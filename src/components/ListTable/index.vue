<script setup lang='ts'>
import { createNewSongList, getAsideList } from '@/api/aside';
import { addOrDelSongApi, like } from '@/api/songlistDetail';
import router from '@/router';
import { CustomMouseMenuOptions } from '@howdyjs/mouse-menu/dist/types';
import { ElMessage } from 'element-plus';
import { defineProps, defineEmits, reactive } from 'vue'
import { useStore } from 'vuex';
const store = useStore()
const emits = defineEmits(['handleRowDbClick', 'clickCheckAll'])
const props = defineProps({
  list: {
    type: Object,
    default() {
      return {};
    },
  },
  // 传过来的封面
  cover: {
    type: String,
    default() {
      return "";
    },
  },
  // 传过来的listId
  listId: {
    type: String,
    default() {
      return "";
    },
  },
  // 是否显示查看全部按钮
  isCheckAllShow: {
    type: Boolean,
    default() {
      return true;
    },
  },
})
interface RootObject {
  currentMusic: currentMusicObject;
  options: CustomMouseMenuOptions;
  deleteDialog: boolean;
  collectDialog: boolean;
  inputDialogVisible: boolean;
  songListName: string;
  isPrivacy: boolean;
  createdMusicList: any[];
}
interface currentMusicObject {
  id: string;
}

const data: RootObject = reactive({
  currentMusic: { id: '' },
  deleteDialog: false,
  collectDialog: false,
  inputDialogVisible: false,
  songListName: '',
  isPrivacy: false,
  createdMusicList: [],
  options: {
    menuItemCss: {
      arrowSize: '8px'
    },
    menuList: [
      {
        label: '播放',
        fn: (item: any, ...args: []) => getSongListInfoHandle(item)
      },
      {
        label: '下一首播放',
        fn: (item: any, ...args: []) => addToPlayListHandle(item)
      },
      {
        line: true
      },
      {
        label: '收藏到歌单',
        fn: (item: any, ...args: []) => openCollectDialog(item),
      },
    ]
  },
})

const handleRowClick = (event: any) => {
  let path;
  if (event.path[0].localName == "tr") {
    path = event.path[0];
  } else {
    path = event.path[1];
  }
  let el = document.querySelector(".selectRow")
  if (el) {
    el.classList.remove("selectRow");
  }
  path.classList.add("selectRow");
}

const handleRowDbClick = (id: any, index: any) => {
  let listId = props.listId
  emits('handleRowDbClick', { id, index, listId })
}

const toSingerDetail = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const clickCheckAll = (id: any) => {
  let listId = props.listId
  emits('clickCheckAll', { id, listId })
}

const getSongListInfoHandle = (item: any) => {
  let arr = []
  arr.push(item)
  // 不能对一个歌单重复加入到歌单列表
  let currentIndex = -1
  let a = store.state.songList.allSongListId.indexOf(item.id)
  if (item.id != store.state.songList.musicId && a == -1) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
    store.state.songList.songList.forEach((item: any, i: number) => {
      if (item.id == store.state.songList.musicId)
        currentIndex = i
    })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex + 1].id)
  }
  // 如果当前播放的歌单有你搜索的那首歌，那就需要找出那首歌在播放列表的位置
  else if (item.id != store.state.songList.musicId && a != -1) {
    store.state.songList.songList.forEach((item1: any, i: number) => {
      if (item1.id == item.id)
        currentIndex = i
    })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex].id)
  }
}
const addToPlayListHandle = (item: any) => {
  let arr = []
  arr.push(item)
  if (store.state.songList.songList.length === 0) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', item.id)
  } else if (store.state.songList.songList.length !== 0 && item.id != store.state.songList.musicId) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
  }
}

const openCollectDialog = (item: any) => {
  data.currentMusic = item
  getAsideListHandle()
  data.collectDialog = true
}
const openInputDialog = () => {
  data.collectDialog = false
  data.songListName = ''
  data.isPrivacy = false
  data.inputDialogVisible = true
}
// 添加到已有的歌单
const addToCreatedSongListHandle = (item: any, index: any) => {
  let timestamp = Date.parse(new Date().toString());

  // 如果点的是第一个，需要把全部的歌加上小爱心，但是一次操作多个会操作频繁
  if (index === 0) {
    // 喜欢
    like(data.currentMusic.id, true, timestamp)
    store.dispatch('songList/updateLikeMusicList', { type: 'add', id: data.currentMusic.id })
  }
  addOrDelSongApi('add', item.id, data.currentMusic.id).then((res) => {
    data.collectDialog = false
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
// 创建新的歌单
const createNewSongListHandle = () => {
  if (data.songListName) {
    createNewSongList(data.songListName, data.isPrivacy ? 10 : 0).then((res) => {
      if (res.data.code === 200) {
        data.inputDialogVisible = false
        store.dispatch('aside/updateCreatedList', res.data.playlist)
        ElMessage({
          type: 'success',
          message: '歌单已创建成功!'
        })
        addOrDelSongApi('add', res.data.id, data.currentMusic.id)
      }
    })
  }
}
// 重新获取歌单的数据
const getAsideListHandle = () => {
  data.createdMusicList = []
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
</script>
<template>
  <div class="officalItem">
    <div class="listCover">
      <img v-lazy="props.list.coverImgUrl || cover + '?param=400y400'" alt="" @click="
        props.list.coverImgUrl || cover
          ? clickCheckAll(props.list.id || listId)
          : ''
      " />
    </div>
    <div class="listContainer">
      <slot name="header"></slot>
      <table>
        <tr class="listRows" v-for="(item, index) in (props.list.tracks &&
        props.list.tracks.slice(0, 5)) ||
        (props.list.topSongs &&
          (props.list.isOpen
            ? props.list.topSongs
            : props.list.topSongs.slice(0, 10))) ||
        props.list.songs.slice(0, 10)" :key="index" @click="handleRowClick" @dblclick="
          handleRowDbClick(props.list.id || item.id, index)
        " v-mouse-menu="{params:item,...data.options}">
          <td class="index">{{ index + 1 }}</td>
          <td class="musicName">{{ item.name }}</td>
          <td class="singer" @click="toSingerDetail(item.ar[0].id)">{{ item.ar[0].name }}</td>
        </tr>
      </table>
      <div class="checkAll" @click="clickCheckAll(props.list.id)" v-show="isCheckAllShow">
        查看全部 <i class="iconfont icon-arrow-right-bold"></i>
      </div>
    </div>
    <el-dialog v-model="data.collectDialog" title="收藏到歌单" width="30%" draggable center :close-on-click-modal="false"
      :modal="false" :destroy-on-close="true" custom-class="collect-songlist-dialog">
      <div class="item" @click="openInputDialog">
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
    <el-dialog v-model="data.inputDialogVisible" title="新建歌单" width="30%" draggable center :close-on-click-modal="false"
      :modal="false" :destroy-on-close="true" custom-class="input-songlist-name-dialog">
      <el-input class="song-list-name-input" v-model="data.songListName" placeholder="请输入新歌单标题"></el-input>
      <el-checkbox v-model="data.isPrivacy" label="设置为隐私歌单" />
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="createNewSongListHandle"
            :class="{ button: data.songListName, button2: !data.songListName }">创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped>
.officalItem {
  display: flex;
  margin: 20px 0 50px 0;
}

.listCover {
  width: 150px;
  height: 150px;
  margin-right: 20px;
  cursor: pointer;
}

.listCover img {
  width: 100%;
  border-radius: 10px;
}

.listContainer {
  width: calc(100% - 200px);
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 5px;
  overflow: hidden;
}

.listRows {
  height: 30px;
  font-size: 12px;
  color: rgb(153, 153, 153);
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

.listRows:nth-child(odd) {
  background-color: #f9f9f9;
}

.listRows:hover {
  background-color: #f4f4f4;
}

.listRows td {
  transform: scale(0.9);
}

.index {
  text-align: center;
  line-height: 28px;
  width: 30px;
}

.topthree {
  color: crimson;
}

.listRows .musicName {
  color: rgb(31, 31, 31);
  transform: translate(-5%, -5%) scale(0.9);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 80%;
}

.singer {
  text-align: right;
  position: absolute;
  right: 10px;
}

.checkAll {
  color: rgb(134, 134, 134);
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  width: 100px;
  height: 30px;
  line-height: 30px;
  cursor: pointer;
}

.checkAll i {
  font-size: 12px;
}

.selectRow {
  background-color: #efefef !important;
}

tr {
  cursor: pointer;
}
</style>