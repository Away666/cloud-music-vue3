<script setup lang='ts'>
import { defineProps, reactive, defineEmits, onMounted, watch } from 'vue'
import { addOrDelSongApi, like } from '@/api/songlistDetail';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { createNewSongList, getAsideList } from '@/api/aside';
import { ElMessage } from 'element-plus';
import router from '@/router';
import AlbumTopTable from './AlbumTopTable.vue';
import { getAlbumData, subAlbumApi } from '@/api/collected';
const store = useStore()
const route = useRoute()
const emits = defineEmits(['getAlbumIndexAndSongIndex', 'bottomLoad'])
const props: any = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  singerName: {
    type: String,
    default: () => ''
  },
  albumList: {
    type: Array,
    default: () => []
  },
  isLoad: {
    type: Boolean,
    default: () => false
  }
})
interface RootObject {
  currentSongListLikeMusic: any[];
  dialogVisible: boolean;
  currentId: string;
  top50PlayingIndex: number;
  showAll: boolean;
  createdMusicList: any[];
  currentPlayingAlbumId: string;
  albumPlayingIndex: number;
  checkAllAlbumIndex: number;
  subAlbumList: any[];
}
const data: RootObject = reactive({
  currentSongListLikeMusic: [],
  dialogVisible: false,
  currentId: '',
  top50PlayingIndex: -1,
  showAll: false,
  createdMusicList: [],
  currentPlayingAlbumId: '',
  albumPlayingIndex: -1,
  checkAllAlbumIndex: -1,
  subAlbumList: [],
})

// 点击top50的播放
const play = () => {
  dbClickRow(props.list[0].id)
}

// 点击某个专辑的播放
const playAlbum = (id: any, index: number) => {
  let noCopyrightRcmd = false
  let list = props.albumList[index].songs.filter((item: any) => {
    if (item.noCopyrightRcmd) {
      noCopyrightRcmd = true
    }
    return item.dt !== 0 && !item.noCopyrightRcmd
  })
  if (noCopyrightRcmd) {
    ElMessage({
      type: 'error',
      message: '因合作方要求,该资源暂时下架＞﹏＜'
    })
  }
  if (list[0]) {
    data.currentPlayingAlbumId = id
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', list[0].id)
    if (id != store.state.songList.songListId) {
      store.dispatch('songList/updateSongList', { songList: list, songListId: id })
    }
  }
}

// 添加到创建的某个歌单，如果是添加到我喜欢的，全部都设置为喜欢
const addToCreatedSongList = () => {
  data.createdMusicList = []
  getAsideListHandle()
  data.dialogVisible = true
}

// top50的双击事件
const dbClickRow = (id: any) => {
  let index = props.list.findIndex((item: { id: any; }, index: any) => {
    return item.id == id
  })
  data.top50PlayingIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  // 因为top50没有id，所以用歌手ID代替
  if (route.params.id != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: props.list, songListId: route.params.id })
  }
}

// 专辑的双击事件
const AlbumDbClickRow = (id: any, index: number) => {
  data.currentPlayingAlbumId = props.albumList[index].album.id
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  if (props.albumList[index].album.id != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: props.albumList[index].songs, songListId: props.albumList[index].album.id })
  }
}

// 点击查看全部
const checkAll = (index: number) => {
  data.showAll = true
  data.checkAllAlbumIndex = index
}

// top50新建歌单
const createNewSongListHandle = () => {
  createNewSongList(props.singerName).then((res) => {
    if (res.data.code === 200) {
      data.dialogVisible = false
      store.dispatch('aside/updateCreatedList', res.data.playlist)
      ElMessage({
        type: 'success',
        message: '歌单已收藏'
      })
      let tracks = ''
      for (let i = props.list.length - 1; i >= 0; i--) {
        if (i === props.list.length - 1) {
          tracks += props.list[i].id
        } else {
          tracks += ',' + props.list[i].id
        }
      }
      addOrDelSongApi('add', res.data.id, tracks)
    }
  })
}

// 把top50的歌添加到我创建的歌单中,包括我喜欢的音乐
const addToCreatedSongListHandle = (item: any, index: any) => {
  let timestamp = Date.parse(new Date().toString());
  let tracks = ''
  for (let i = props.list.length - 1; i >= 0; i--) {
    if (i === props.list.length - 1) {
      tracks += props.list[i].id
    } else {
      tracks += ',' + props.list[i].id
    }
  }
  // 如果点的是第一个，需要把全部的歌加上小爱心，但是一次操作多个会操作频繁
  if (index === 0) {
    // 喜欢
    for (let i = props.list.length - 1; i >= 0; i--) {
      like(props.list[i].id, true, timestamp)
      // data.currentSongListLikeMusic.push(props.list[i])
      store.dispatch('songList/updateLikeMusicList', { type: 'add', id: props.list[i].id })
    }
  } else {

  }
  addOrDelSongApi('add', item.id, tracks).then((res) => {
    data.dialogVisible = false
    if (res.data.body.code === 200) {
      ElMessage({
        type: 'success',
        message: '歌曲已添加到歌单！'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '歌单歌曲重复！'
      })
    }
  })
}

// 重新获取歌单的数据
const getAsideListHandle = () => {
  let timestamp = Date.parse(new Date().toString());
  const userId = window.localStorage.getItem("userId")
  getAsideList(userId, timestamp).then((res) => {
    if (res.data.code == 200) {
      res.data.playlist.filter((item: any) => {
        if (item.creator.userId == userId) {
          data.createdMusicList.push(item)
          data.createdMusicList[0].name = "我喜欢的音乐";
        }
      })
      store.dispatch("aside/getCreatedList", data.createdMusicList)
    }
  })
}

const getAlbumDataHandle = () => {
  let timestamp = Date.parse(new Date().toString())
  getAlbumData(timestamp).then((res) => {
    if (res.data.code == 200) {
      data.subAlbumList = res.data.data
    }
  })
}

const toAlbumDetail = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}

const subAlbum = (id: any) => {
  subAlbumApi(id, 1).then((res) => {
    if (res.data.code === 200) {
      ElMessage({
        type: 'success',
        message: '专辑收藏成功！'
      })
      getAlbumDataHandle()
    }
  })
}

const load = () => {
  emits('bottomLoad')
}

onMounted(() => {
  getAlbumDataHandle()
})

watch(() => store.state.aside.createdMusicList, (current, last) => {
  data.createdMusicList = current
})
watch(() => store.state.songList.songListId, (current, last) => {
  if (current) {
    data.currentPlayingAlbumId = current

  }
})
watch(() => store.state.songList.musicId, (current, last) => {
  let index = props.albumList.findIndex((item: any) => {
    return item.album.id === data.currentPlayingAlbumId
  })
  if (props.albumList[index]) {
    data.albumPlayingIndex = props.albumList[index].songs.findIndex((item: any) => {
      return item.id === current
    })
  }
  data.top50PlayingIndex = props.list.findIndex(
    (item: any) => item.id == current
  );
})
</script>
<template>
  <div>
    <div class="singer-top-container" v-if="props.list.length != 0">
      <div class="img-container">
        <img src="@/assets/images/topSongsLogo.png" alt="">
      </div>
      <div class="table-container">
        <div class="head">
          <span class="title">热门50首</span>
          <span class="play"><i class="iconfont icon-bofang" @click="play"></i></span>
          <span class="hr"></span>
          <span class="collected"><i class="iconfont icon-folder-add" @click="addToCreatedSongList"></i></span>
        </div>
        <div class="">
          <AlbumTopTable :songs="data.showAll ? props.list : props.list.slice(0, 10)"
            :playingIndex="store.state.songList.songListId == route.params.id ? data.top50PlayingIndex : -1"
            @dbClickRow="dbClickRow"></AlbumTopTable>
        </div>
        <div class="check-all" v-if="props.list.length > 10 && !data.showAll">
          <div>
            <span @click="checkAll(-1)">查看全部{{
                props.list.length
            }}首></span>
          </div>
        </div>
      </div>
      <el-dialog v-model="data.dialogVisible" title="收藏到歌单" width="30%" draggable center :close-on-click-modal="false"
        :modal="false" :destroy-on-close="true">
        <div class="item" @click="createNewSongListHandle">
          <span class="image"><i class="iconfont icon-zengjia"></i></span>
          <p>创建为新歌单</p>
        </div>
        <div class="song-list-item-container scroll">
          <div class="item song-list-item" @click="addToCreatedSongListHandle(item, index)"
            v-for="(item, index) in data.createdMusicList" :key="item.id">
            <span class="image"><img v-lazy="item.coverImgUrl + '?param=200y200'" alt=""></span>
            <div>
              <p class="name">{{ item.name }}</p>
              <p class="num">{{ item.trackCount }}首音乐，0首已下载</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
    <!-- 专辑列表 -->
    <div v-if="props.albumList.length != 0" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="0" :infinite-scroll-immediate="false">
      <div v-for="(item, index) in props.albumList" :key="item.album.id" class="singer-album-container">
        <div class="img-container">
          <img v-lazy="item.album.picUrl + '?param=200y200'" alt="">
        </div>
        <div class="table-container">
          <div class="head">
            <span class="title title-name" @click="toAlbumDetail(item.album.id)">{{ item.album.name }}</span>
            <span class="play"><i class="iconfont icon-bofang" @click="playAlbum(item.album.id, index)"></i></span>
            <span class="hr"
              v-if="data.subAlbumList.findIndex((item1: any) => item1.id === item.album.id) == -1"></span>
            <span class="collected"
              v-if="data.subAlbumList.findIndex((item1: any) => item1.id === item.album.id) == -1"><i
                class="iconfont icon-folder-add" @click="subAlbum(item.album.id)"></i></span>
          </div>
          <div class="">
            <AlbumTopTable
              :songs="data.showAll && data.checkAllAlbumIndex === index ? item.songs : item.songs.slice(0, 10)"
              :playingIndex="data.currentPlayingAlbumId === item.album.id ? data.albumPlayingIndex : -1"
              :currentAlbumIndex="index" @dbClickRow="AlbumDbClickRow"></AlbumTopTable>
          </div>
          <!-- 这个是点击查看全部就显示全部的 -->
          <!-- <div class="check-all" v-if="item.songs.length > 10 &&  data.checkAllAlbumIndex !== index">
            <span @click="checkAll(index)">查看全部{{
                item.songs.length
            }}首></span>
          </div> -->
          <!-- 这个是点击全部跳转到专辑歌单列表 -->
          <div class="check-all" v-if="item.songs.length > 10">
            <div>
              <span @click="toAlbumDetail(item.album.id)">查看全部{{
                  item.songs.length
              }}首 ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.singer-top-container,
.singer-album-container {
  margin: 30px 30px;
  position: relative;
  display: flex;

  .img-container {
    // position: absolute;
    display: inline-block;
    height: 150px;
    width: 180px;
    margin-right: 20px;

    img {
      height: 100%;
      border-radius: 5px;
    }
  }

  .table-container {
    display: inline-block;
    width: calc(100vw - 485px);
    // float: right;

    .head {
      display: flex;
      align-items: center;
      margin-bottom: 5px;

      i {
        font-size: 24px;
        opacity: 0.6;
        cursor: pointer;
      }

      i:hover {
        opacity: 1;
      }
    }

    .title {
      font-weight: 500;
      font-size: 18px;
      line-height: 24px;
      opacity: 0.8
    }

    .title:hover {
      opacity: 1;
    }

    .title-name {
      cursor: pointer;
    }

    .play {
      margin: 0 10px 0 25px;
      display: inline-block;
      line-height: 24px;
    }

    .hr {
      height: 15px;
      margin-right: 10px;
      border-right: 1px solid rgb(229, 229, 229);
    }

    .collected {
      font-size: 18px;
      line-height: 24px;
    }
  }

  .el-dialog {
    .item {
      display: flex;
      align-items: center;
      // margin-bottom: 10px;
      padding: 10px 15px;

      .image {
        display: inline-block;
        width: 60px;
        height: 60px;
        background-color: rgb(238, 239, 241);
        position: relative;
        border-radius: 5px;

        i {
          font-size: 30px;
          color: rgb(236, 65, 65);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        img {
          width: 100%;
          height: 100%;
          border-radius: 5px;
        }
      }

      p {
        margin-left: 15px;
        display: inline;
      }

    }

    .song-list-item-container {
      height: 271px;
    }

    .song-list-item {
      cursor: pointer;

      div {
        display: flex;
        flex-direction: column;

        p {
          line-height: 24px;
        }

        .num {
          font-size: 13px;
          opacity: 0.7;
        }
      }
    }

    .song-list-item:hover {
      background-color: rgb(238, 239, 240);
    }

  }
}

.singer-album-container {
  .img-container {
    position: relative;

    img {
      cursor: pointer;
    }
  }

  .img-container::after {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: 10px;
    background: url("~@/assets/images/MusicDetailCard/disc.png") no-repeat right;
    background-size: contain;
    border-radius: 10px;
    z-index: -1;
    opacity: 0.9;
  }
}

.icon-aixin2 {
  font-size: 20px;
  cursor: pointer;
}

.aixin {
  font-size: 20px;
  color: rgb(236, 65, 65);
  cursor: pointer;
}

.aixin:hover {
  color: rgb(215, 53, 53);
}

.check-all {
  height: 32px;
  line-height: 32px;
  background-color: rgb(250, 250, 250);

  div {
    position: relative;
    font-size: 12px;
    opacity: 0.5;
    width: 100%;
    height: 100%;
  }

  span {
    display: block;
    position: absolute;
    right: 30px;
    cursor: pointer;
  }

  div:hover {
    opacity: 0.8;
  }
}
</style>