<script setup lang='ts'>
import { onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import AlbumTable from '@/components/AlbumTable/index.vue';
import ListCard1 from '@/components/ListCard1/index.vue';
import VideoListCard from '@/components/VideoListCard/index.vue';
import { getInterestData, getAllData } from '@/api/search/index'
import { ElMessage } from 'element-plus';
import { handleNum } from '@/utils';
import router from '@/router';
import { useStore } from 'vuex';
const route = useRoute()
const store = useStore()
interface RootObject {
  interestList: InterestList;
  list: any[];
  total: number;
  limit: number;
  page: number;
  activeName: string;
  playingIndex: number;
}
interface InterestList {
  album: any[];
  artist: any[];
  playlist: any[];
  new_mlog: any[];
}
const data: RootObject = reactive({
  interestList: { album: [], artist: [], playlist: [], new_mlog: [] },
  list: [],
  total: 0,
  limit: 100,
  page: 1,
  activeName: 'first',
  playingIndex: -1,
})

// 获取你可能感兴趣的数据
const getInterestDataHandle = () => {
  getInterestData(route.params.keyWord).then((res) => {
    if (res.data.code === 200) {
      data.interestList = res.data.result
    }
  })
}

// 获取单曲的数据
const getMusicListHandle = () => {
  getAllData(route.params.keyWord, data.limit, (data.page - 1) * data.limit, 1).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.songs
      data.total = res.data.result.songCount
    }
  })
}

// 获取歌手数据
const getSingerListHandle = () => {
  getAllData(route.params.keyWord, 20, (data.page - 1) * 20, 100).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.artists
      data.total = res.data.result.artistCount
    }
  })
}

// 获取专辑数据
const getAlbumListHandle = () => {
  getAllData(route.params.keyWord, 20, (data.page - 1) * 20, 10).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.albums
      data.total = res.data.result.albumCount
    }
  })
}
// 获取视频数据
const getVideoListHandle = () => {
  getAllData(route.params.keyWord, 24, (data.page - 1) * 24, 1014).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.videos
      data.total = res.data.result.videoCount
    }
  })
}
// 获取歌单数据
const getSongListHandle = () => {
  getAllData(route.params.keyWord, 20, (data.page - 1) * 20, 1000).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.playlists
      data.total = res.data.result.playlistCount
    }
  })
}
// 获取用户数据
const getUserListHandle = () => {
  getAllData(route.params.keyWord, 20, (data.page - 1) * 20, 1002).then((res) => {
    if (res.data.code == 200) {
      data.list = res.data.result.userprofiles
      data.total = res.data.result.userprofileCount
    }
  })
}

const toSingerDetail = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}
const toAlbumDetail = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}
const toVideoDetail = (id: any) => {
  router.push({ name: 'videodetail', params: { id, type: 'mv' } })
}
const toSongListDetail = (id: any) => {
  router.push({ name: 'songlistdetail', params: { id } })
}

const clickListCardItem = ({ id, type }: any) => {
  router.push({ name: 'videodetail', params: { id, type: type ? 'video' : 'mv' } })
}
const toUserDetail = (id: any) => {
  router.push({ name: 'userdetail', params: { id } })
}

const clickTab = (tag: any) => {
  data.activeName = tag.props.name
  data.page = 1
  if (data.activeName === 'first') {
    getMusicListHandle()
  } else if (data.activeName === 'second') {
    getSingerListHandle()
  } else if (data.activeName === 'third') {
    getAlbumListHandle()
  } else if (data.activeName === 'fourth') {
    getVideoListHandle()
  } else if (data.activeName === 'fifth') {
    getSongListHandle()
  } else {
    getUserListHandle()
  }
}

const dbClickRow = (id: number) => {
  let index = data.list.findIndex((item, index) => {
    return item.id == id
  })
  data.playingIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  // 暂时用歌曲的第一首歌的id代替歌曲列表id
  if (data.list[0].id != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: data.list, songListId: data.list[0].id })
  }
}

const playAllHandle = () => {
  let noCopyrightRcmd = false
  let list = data.list.filter((item: any) => {
    if (item.noCopyrightRcmd) {
      noCopyrightRcmd = true
    }
    return item.dt !== 0 && !item.noCopyrightRcmd
  })
  if (noCopyrightRcmd) {
    ElMessage({
      type: 'error',
      message: '因合作方要求,该歌单部分资源暂时下架＞﹏＜'
    })
  }
  if (list[0]) {
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', list[0].id)
    // 暂时用歌曲的第一首歌的id代替歌曲列表id
    if (data.list[0].id != store.state.songList.songListId) {
      store.dispatch('songList/updateSongList', { songList: list, songListId: data.list[0].id })
    }
  }
}

// 点击添加到播放列表
const addToPlayListHandle = () => {
  if (store.state.songList.allSongListId.length == 0) {
    playAllHandle()
  } else {
    // 不能对一个歌单重复加入到歌单列表
    let a = store.state.songList.allSongListId.indexOf(data.list[0].id)
    let list = data.list.filter((item: any) => {
      return item.dt !== 0 && !item.noCopyrightRcmd
    })
    // 暂时用歌曲的第一首歌的id代替歌曲列表id
    if (data.list[0].id != store.state.songList.songListId && a == -1) {
      store.dispatch('songList/addToSongList', { songList: list, songListId: data.list[0].id })
    }
  }
}

const mouseenter = () => {
  document.querySelector(".play-all-left")?.classList.add("play-all-left-hover")
}

const mouseleave = () => {
  document.querySelector(".play-all-left-hover")?.classList.remove("play-all-left-hover")
}

const currentChange = (newPage: number) => {
  data.list = []
  data.page = newPage
  if (data.activeName === 'first') {
    getMusicListHandle()
  } else if (data.activeName === 'second') {
    getSingerListHandle()
  } else if (data.activeName === 'third') {
    getAlbumListHandle()
  } else if (data.activeName === 'fourth') {
    getVideoListHandle()
  } else if (data.activeName === 'fifth') {
    getSongListHandle()
  } else {
    getUserListHandle()
  }
}

onMounted(() => {
  getInterestDataHandle()
  getMusicListHandle()
})
watch(() => store.state.songList.musicId, (current, last) => {
  data.playingIndex = data.list.findIndex(
    (item: any) => item.id == current
  );
})
</script>
<template>
  <div class="search-detail scroll">
    <div>
      <h2>搜索 {{ route.params.keyWord }}</h2>
    </div>
    <div class="search-interest"
      v-if="data.interestList.artist || data.interestList.album || data.interestList.new_mlog || data.interestList.playlist || data.interestList">
      <span>你可能感兴趣</span>
      <div class="search-interest-list">
        <div class="item singer" v-if="data.interestList.artist"
          @click="toSingerDetail(data.interestList.artist[0]?.id)">
          <img v-lazy="data.interestList.artist[0]?.img1v1Url + '?param=200y200'" alt="">
          <div class="info">
            <p>歌手：{{ data.interestList.artist[0]?.name }}
              <span v-if="data.interestList.artist[0]?.alias[0]">({{
                  data.interestList.artist[0]?.alias[0]
              }})</span>
            </p>
            <p> <span>粉丝:{{ handleNum(data.interestList.artist[0]?.fansSize)
            }},歌曲:{{ data.interestList.artist[0]?.musicSize }}</span>
            </p>
          </div>
        </div>
        <div class="item album" v-if="data.interestList.album" @click="toAlbumDetail(data.interestList.album[0]?.id)">
          <div class="image"><img v-lazy="data.interestList.album[0]?.blurPicUrl + '?param=200y200'" alt=""></div>
          <div class="album-info">
            <p>专辑：{{ data.interestList.album[0]?.name }}
              <span v-if="data.interestList.album[0]?.alias[0]">({{
                  data.interestList.album[0]?.alias[0]
              }})</span>
            </p>
            <p> <span>{{ data.interestList.album[0]?.artist.name }}</span>
            </p>
          </div>
        </div>
        <div class="item video" v-if="data.interestList.new_mlog"
          @click="toVideoDetail(data.interestList.new_mlog[0]?.baseInfo.id)">
          <img v-lazy="data.interestList.new_mlog[0]?.baseInfo.resource.mlogBaseData.coverUrl" alt="">
          <div class="video-info">
            <p>视频:{{ data.interestList.new_mlog[0]?.baseInfo.resource.mlogBaseData.text }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="search-detail-content">
      <span>找到{{ data.total || 0 }}
        <span v-if="data.activeName === 'first'">首单曲</span>
        <span v-if="data.activeName === 'second'">位歌手</span>
        <span v-if="data.activeName === 'third'">张专辑</span>
        <span v-if="data.activeName === 'fourth'">个视频</span>
        <span v-if="data.activeName === 'fifth'">个歌单</span>
        <span v-if="data.activeName === 'sixth'">位用户</span>
      </span>
      <el-tabs v-model="data.activeName" @tab-click="clickTab">
        <el-tab-pane label="单曲" name="first">
          <div class="buttons">
            <div class="buttonItem playAll">
              <div class="play-all-left" @click="playAllHandle">
                <i class="iconfont icon-bofang playAll"></i>
                <span>播放全部</span>
              </div>
              <div class="play-all-right" title="添加全部到播放列表" @mouseenter="mouseenter" @mouseleave="mouseleave"
                @click="addToPlayListHandle">
                <i class="iconfont icon-zengjia"></i>
              </div>
            </div>
          </div>
          <AlbumTable :songs="data.list" @dbClickRow="dbClickRow" :playingIndex="data.playingIndex"></AlbumTable>
          <div class="page" v-if="data.list[0]">
            <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="data.limit"
              :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="歌手" name="second">
          <div class="singer-container">
            <div v-for="item in data.list" :key="item.id" class="singer-item" @click="toSingerDetail(item.id)">
              <img v-lazy="item.img1v1Url + '?param=200y200'" alt="">
              <div class="singer-name">{{ item.name }}<span v-for="(item2, index) in item.alias" :key="index">
                  <span class="sub-head" v-if="index === 0">({{ item2 }})</span></span>
              </div>
            </div>
          </div>
          <div class="page" v-if="data.list[0]">
            <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="20"
              :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="专辑" name="third">
          <div class="album-container">
            <ListCard1 :listData="data.list" :type="'album'"></ListCard1>
            <div class="page" v-if="data.list[0]">
              <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="20"
                :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="视频" name="fourth">
          <div class="album-container">
            <VideoListCard :videoList="data.list" :videoType="'searchDetailVideo'"
              @clickListCardItem="clickListCardItem">
            </VideoListCard>
            <div class="page" v-if="data.list[0]">
              <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="24"
                :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="歌单" name="fifth">
          <div class="singer-container songlist-container">
            <div v-for="item in data.list" :key="item.id" class="singer-item" @click="toSongListDetail(item.id)">
              <img v-lazy="item.coverImgUrl + '?param=200y200'" alt="">
              <div class="singer-name">{{ item.name }}<span v-for="(item2, index) in item.alias" :key="index">
                  <span class="sub-head" v-if="index === 0">({{ item2 }})</span></span>
              </div>
              <div class="count">{{ item.trackCount }}首</div>
              <div class="user">by<span class="nickname" @click.stop="toUserDetail(item.creator?.userId)">{{
                  item.creator?.nickname
              }}</span></div>
              <div class="playCount"> <i class="iconfont icon-bofang"></i> {{ handleNum(item.playCount) }}</div>
            </div>
            <div class="page" v-if="data.list[0]">
              <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="20"
                :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="用户" name="sixth">
          <div class="singer-container user-container">
            <div v-for="item in data.list" :key="item.id" class="singer-item" @click="toUserDetail(item.userId)">
              <div class="image">
                <img v-lazy="item.avatarUrl + '?param=200y200'" alt="">
                <span class="icon" v-if="item.avatarDetail?.identityIconUrl">
                  <img :src="item.avatarDetail?.identityIconUrl" alt=""></span>
              </div>
              <div class="singer-name">{{ item.nickname }}
              </div>
              <div class="gender">
                <div v-if="item.gender === 1" class="male"><i class="iconfont icon-male"></i></div>
                <div v-if="item.gender === 2" class="female"><i class="iconfont icon-female"></i></div>
              </div>
              <div class="signature">
                <span v-if="!item.avatarDetail?.identityIconUrl">{{ item.signature }}</span>
                <span v-else>网易音乐人</span>
              </div>
            </div>
            <div class="page" v-if="data.list[0]">
              <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="20"
                :current-page="data.page" @current-change="currentChange" :hide-on-single-page="true">
              </el-pagination>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<style lang="less" scoped>
.search-detail {
  padding: 20px 30px;
  height: calc(100vh - 120px);

  .search-interest {
    margin: 20px 0;

    span {
      font-size: 13px;
      color: #949494;
    }

    .search-interest-list {
      margin-top: 10px;
      display: flex;

      .item {
        width: 280px;
        height: 70px;
        background-color: rgb(245, 245, 245);
        margin-right: 10px;
        position: relative;
        cursor: pointer;
        z-index: 0;

        .info {
          position: absolute;
          top: 0;
          left: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          width: calc(100% - 60px);

          p {
            margin: 2px 0;
            font-size: 13px;
            width: 100%;
            overflow: hidden; //超出的文本隐藏
            text-overflow: ellipsis; //溢出用省略号显示
            white-space: nowrap; //溢出不换行
          }
        }
      }

      .singer {
        img {
          margin: 15px 10px;
          width: 40px;
          border-radius: 50%;
        }
      }

      .album {
        .image {
          display: inline-block;
          margin: 15px 10px;
          width: 50px;
          height: 40px;
          position: relative;
        }

        .image::after {
          content: "";
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          right: 3px;
          background: url("~@/assets/images/MusicDetailCard/disc.png") no-repeat right;
          background-size: contain;
          border-radius: 0;
          z-index: -1;
          opacity: 0.9;
        }

        img {
          width: 40px;
          z-index: 2;
        }
      }

      .album-info {
        position: absolute;
        top: 0;
        left: 70px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: calc(100% - 70px);

        p {
          margin: 2px 0;
          font-size: 13px;
          width: 100%;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
      }

      .video {
        img {
          margin: 10px 10px;
          height: 50px;
          border-radius: 5px;
        }
      }

      .video-info {
        position: absolute;
        top: 0;
        left: 110px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: calc(100% - 110px);

        p {
          margin: 2px 0;
          font-size: 13px;
          width: 100%;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
      }
    }
  }

  .buttons {
    margin-top: 16px;
  }

  .search-detail-content {
    position: relative;

    >span {
      position: absolute;
      top: 0;
      right: 0;
      line-height: 40px;
      font-size: 13px;
      color: #949494;
    }
  }

  .singer-container,
  .album-container {
    margin-top: 10px;

    .singer-item {
      width: 100%;
      height: 85px;
      display: flex;
      align-items: center;
      cursor: pointer;
      padding-left: 30px;

      img {
        height: 70px;
        border-radius: 5px;
      }

      .singer-name {
        margin-left: 15px;

        .sub-head {
          margin-left: 3px;
          color: #9f9f9f;
        }
      }
    }

    .singer-item:hover {
      background-color: #F1F2F3;
    }

    .singer-item:nth-last-child(2n-1) {
      background-color: rgb(250, 250, 250);
    }

    .singer-item:nth-last-child(2n-1):hover {
      background-color: #F1F2F3;
    }
  }

  .page {
    margin-top: 20px;
  }

  .songlist-container {
    .singer-name {
      width: 40%;
    }

    .count {
      width: 10%;
      font-size: 13px;
      color: #b7b7b7;
    }

    .user {
      width: 30%;
      font-size: 13px;
      color: #b7b7b7;

      .nickname {
        margin-left: 5px;
        color: #797979;
      }

      .nickname:hover {
        color: #333;
      }
    }

    .playCount {
      font-size: 13px;
      color: #b7b7b7;
    }
  }

  .user-container {
    .image {
      position: relative;

      >img {
        border-radius: 50%;
      }

      .icon {
        position: absolute;
        bottom: 0;
        right: -5px;

        img {
          width: 20px;
          height: 20px;
        }
      }
    }

    .gender {
      margin-left: 10px;

      .male {
        height: 20px;
        width: 20px;
        background-color: #BFF3FF;
        border-radius: 50%;
        text-align: center;

        i {
          color: #74C3E3;
        }
      }

      .female {
        height: 20px;
        width: 20px;
        background-color: #FBC8E3;
        border-radius: 50%;
        text-align: center;

        i {
          color: #EC7BAC;
        }
      }
    }

    .signature {
      position: absolute;
      right: 10px;
      font-size: 13px;
    }
  }
}
</style>