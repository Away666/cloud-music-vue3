<script setup lang='ts'>
import { getSingerAlbumData, getSingerDescData, getSingerDetailData, getSingerTop50Data, getSubSingerList, updateSubSinger, getSingerAlbumDetail, getSingerMvList, getSimiSingerList } from '@/api/singerDetail';
import { ElMessage } from 'element-plus';
import { nextTick, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import AlbumListCard from '../../components/AlbumListCard/index.vue';
import ListCard1 from '../../components/ListCard1/index.vue'
import AlbumTop from '../../components/AlbumTopTable/index.vue'
import { da } from 'element-plus/es/locale';
import VideoListCard from '@/components/VideoListCard/index.vue';
import router from '@/router';
import ListCard5 from '@/components/ListCard5/index.vue';

const route = useRoute()
const store = useStore()
interface RootObject {
  list: any[];
  singerInfo: SingerInfo;
  isSub: boolean;
  singerListLength: number;
  isByClickSub: boolean;
  activeName: string;
  singerDesc: any[];
  mode: number;
  currentPage: number;
  singerAlbumList: any[];
  topSongs: any[];
  hasMore: boolean;
  singerAlbumInfoAndSongs: any[];
  mvList: any[];
  simiSingerList: any[];
}

interface SingerInfo {
  cover: string;
  name: string;
  musicSize: number;
  albumSize: number;
  mvSize: number;
  briefDesc: string;
}
const data: RootObject = reactive({
  singerInfo: { cover: '', name: '', musicSize: 0, albumSize: 0, mvSize: 0, briefDesc: '' },
  isSub: false,
  singerListLength: 0,
  isByClickSub: false,
  activeName: 'first',
  singerDesc: [],
  mode: 1,
  currentPage: 1,
  singerAlbumList: [],
  hasMore: true,
  topSongs: [],
  singerAlbumInfoAndSongs: [],
  list: [],
  mvList: [],
  simiSingerList: [],
})

// 获取歌手的信息
const getSingerDetailDataHandle = () => {
  getSingerDetailData(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.singerInfo = res.data.data.artist
    }
  })
}

// 获取关注的歌手列表，并判断当前歌手是不是被关注
const getSubSingerListHandle = () => {
  let timestamp = Date.parse(new Date().toString());
  getSubSingerList(1000, timestamp).then((res) => {
    if (data.isByClickSub && data.singerListLength == res.data.data.length) {
      ElMessage({
        type: 'error',
        message: '系统繁忙，请稍后重试！'
      })
      return
    }
    else if (res.data.code == 200) {
      data.singerListLength = res.data.data.length
      data.isSub = res.data.data.find((item: any) => {
        return item.id == route.params.id
      })
    }
  })
}

// 关注歌手
const subSinger = () => {
  if (store.state.login.isLogin) {
    updateSubSinger(route.params.id, data.isSub ? '0' : '1').then((res) => {
      if (res.data.code == 200) {
        data.isByClickSub = true
        getSubSingerListHandle()
      }
    })
  } else {
    ElMessage({
      type: 'error',
      message: '请先登录后在进行操作！'
    })
  }
}

// 获取歌手的专辑
const getSingerAlbumDataHandle = () => {
  return new Promise((resolve, reject) => {
    let timestamp = Date.parse(new Date().toString());
    if (data.hasMore) {
      getSingerAlbumData(route.params.id, (data.currentPage - 1) * 30, timestamp).then((res) => {
        if (res.data.code === 200) {
          data.singerAlbumList.push(...res.data.hotAlbums)
          data.hasMore = res.data.more
          data.list = res.data.hotAlbums
          resolve(true)
        }
      })
    }
  })
}

// 图列模式下,获取专辑信息和歌曲
const getAllAlbumData = () => {
  data.list.forEach((item: any) => {
    getSingerAlbumDetail(item.id).then((res: any) => {
      if (res.data.code === 200) {
        data.singerAlbumInfoAndSongs.push(res.data)
      }
    })
  })
}

// 加载更多
const bottomLoad = () => {
  if (data.activeName === 'first') {
    data.currentPage += 1
    getSingerAlbumDataHandle().then((res) => {
      getAllAlbumData()
    })
  } else if (data.activeName === 'second') {

  }
}

// 歌手top50
const getSingerTop50DataHandle = () => {
  getSingerTop50Data(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.topSongs = res.data.songs
    }
  })
}

// 切换tab
const clickTab = (tag: any) => {
  data.activeName = tag.props.name
  if (tag.props.name == 'third') {
    getSingerDescDataHandle()
  }
  else if (data.activeName === 'second') {
    getSingerMvListHandle()
  } else if (data.activeName === 'fourth') {
    getSimiSingerListHandle()
  }
}

// 获取歌手mv
const getSingerMvListHandle = () => {
  getSingerMvList(route.params.id).then((res) => {
    if (res.data.code === 200) {
      data.mvList = res.data.mvs
    }
  })
}

// 点击歌手mv
const clickSingerMv = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: 'mv' } })
}

// 歌手详情
const getSingerDescDataHandle = () => {
  getSingerDescData(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.singerDesc = res.data.introduction
    }
  })
}

// 获取相似歌手
const getSimiSingerListHandle = () => {
  getSimiSingerList(route.params.id).then((res) => {
    if (res.data.code === 200) {
      data.simiSingerList = res.data.artists
    }
  })
}

// 点击相似歌手
const toSingerDetail = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

onMounted(() => {
  getSingerDetailDataHandle()
  getSubSingerListHandle()
  getSingerAlbumDataHandle()
  getSingerTop50DataHandle()
})

watch(() => data.mode, (current, last) => {
  if (current === 3) {
    getAllAlbumData()
  }
})
</script>
<template>
  <div class="singer-detail-container scroll">
    <!-- 歌单信息 -->
    <div class="listInfo">
      <!-- 歌单封面 -->
      <div class="listAvatar">
        <img :src="data.singerInfo.cover + '?param=300y300'" alt="" />
      </div>
      <div class="right">
        <!-- 标题 -->
        <div class="title">
          <div class="titleContent">{{ data.singerInfo.name }}</div>
        </div>
        <!-- 操作按钮 -->
        <div class="buttons">
          <div class="buttonItem" :title="data.isSub ? '取消收藏' : '收藏'" @click="subSinger">
            <i class="iconfont icon-folder-checked" :class="data.isSub ? 'red' : ''" v-if="data.isSub"></i>
            <i class="iconfont icon-folder-add" v-else></i>
            <span>{{ data.isSub ? "已收藏" : "收藏" }}</span>
          </div>
          <div class="buttonItem">
            <i class="iconfont icon-link"></i>
            <span>个人主页</span>
          </div>
        </div>
        <!-- 歌曲列表的歌曲数量和播放量 -->
        <div class="otherInfo">
          <div class="musicNum">单曲数 : {{ data.singerInfo.musicSize }}</div>
          <div class="musicNum">专辑数 : {{ data.singerInfo.albumSize }}</div>
          <div class="musicNum">MV数 : {{ data.singerInfo.mvSize }}</div>
        </div>
      </div>
    </div>
    <div class="singer-content">
      <div class="mode" v-if="data.activeName == 'first'">
        <div class="mode-button" :class="data.mode == 1 ? 'is-active' : ''" @click="data.mode = 1" title="大图模式">
          <i class="iconfont icon-datuzhanshi"></i>
        </div>
        <div class="mode-button" :class="data.mode == 2 ? 'is-active' : ''" @click="data.mode = 2" title="列表模式">
          <i class="iconfont icon-liebiao2"></i>
        </div>
        <div class="mode-button" :class="data.mode == 3 ? 'is-active' : ''" @click="data.mode = 3" title="图列模式">
          <i class="iconfont icon-liebiao"></i>
        </div>
      </div>
      <el-tabs v-model="data.activeName" @tab-click="clickTab">
        <el-tab-pane label="专辑" name="first">
          <!-- 大图模式 -->
          <div class="big-pic" v-if="data.mode == 1">
            <AlbumListCard :list="data.singerAlbumList" :isLoad="!data.hasMore" @bottomLoad="bottomLoad">
            </AlbumListCard>
          </div>
          <!-- 列表模式 -->
          <div class="" v-if="data.mode == 2">
            <ListCard1 :listData="data.singerAlbumList" :type="'album1'" :isLoad="!data.hasMore"
              @bottomLoad="bottomLoad"></ListCard1>
          </div>
          <!-- 图列模式 -->
          <div class="figure-col" v-if="data.mode == 3">
            <AlbumTop :list="data.topSongs" :singerName="data.singerInfo.name"></AlbumTop>
            <AlbumTop :albumList="data.singerAlbumInfoAndSongs" :isLoad="!data.hasMore" @bottomLoad="bottomLoad">
            </AlbumTop>
          </div>
        </el-tab-pane>
        <el-tab-pane label="MV" name="second">
          <VideoListCard :videoList="data.mvList" @clickListCardItem="clickSingerMv"></VideoListCard>
        </el-tab-pane>
        <el-tab-pane label="歌手详情" name="third">
          <div class="singer-detail">
            <h4>{{ data.singerInfo.name }}简介</h4>
            <p>{{ data.singerInfo.briefDesc }}</p>
            <div v-for="(item, index) in data.singerDesc" :key="index">
              <h4>{{ item.ti }}</h4>
              <p>{{ item.txt }}</p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="相似歌手" name="fourth">
          <ListCard5 class="simi-singer-list" :list="data.simiSingerList" @clickListCardItem="toSingerDetail">
          </ListCard5>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<style lang="less" scoped>
.singer-detail-container {
  height: calc(100vh - 120px);

  .listInfo {
    display: flex;
    margin: 20px 30px;
  }

  .listAvatar {
    width: 180px;
    height: 180px;
    overflow: hidden;
    border-radius: 10px;
    margin-right: 15px;
  }

  .listAvatar img {
    width: 100%;
  }

  .right {
    margin-top: 10px;
    width: calc(100% - 200px);
  }

  .title {
    display: flex;
    align-items: center;
  }

  .titleTag {
    font-size: 12px;
    color: #ec4141;
    border: 1px solid #ec4141;
    padding: 1px 2px;
    border-radius: 2px;
    margin-right: 5px;
    transform: scale(0.8);
  }

  .titleContent {
    font-size: 20px;
    font-weight: 600;
    color: #373737;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 90%;
  }

  .buttons {
    margin: 15px 0 0 0;
    display: flex;
  }

  .buttonItem {
    display: flex;
    height: 35px;
    line-height: 35px;
    font-size: 14px;
    padding: 0 15px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    // transform: scale(0.9);
    cursor: pointer;
    align-items: center;

    .icon-folder-checked,
    .icon-folder-add {
      font-size: 20px;
    }
  }

  .buttonItem i {
    font-size: 16px;
    margin-right: 4px;
    // transform: scale(0.9);
  }

  .playAll {
    background-color: #ec4141;
    color: white;
  }

  .otherInfo {
    margin: 15px 0 0 0;
    display: flex;
    font-size: 12px;
  }

  .musicNum {
    margin-right: 13px;
  }

  .musicList {
    margin: 0 10px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    color: black;
    margin-bottom: 10px;
  }

  .singerDesc {
    font-size: 12px;
    color: #373737;
    line-height: 25px;
    letter-spacing: 0.5px;
    text-indent: 2em;
  }

  .red {
    color: #ec4141;
  }
}

.singer-detail {
  padding: 20px 30px;
  -o-user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
  -ms-user-select: text;
  -khtml-user-select: text;
  user-select: text;

  p {
    margin-top: 10px;
    font-size: smaller;
    line-height: 30px;
    text-indent: 2em;
  }

  div {
    margin-top: 20px;
  }
}

.singer-content {
  position: relative;
}

.mode {
  position: absolute;
  right: 20px;
  top: 8px;

  .mode-button {
    z-index: 99;
    margin-right: 1px;
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: rgb(242, 242, 242);
    position: relative;

    i {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .mode-button:hover {
    background-color: rgb(232, 232, 232);
  }

  .is-active {
    background-color: rgb(191, 191, 191);
  }

  .is-active:hover {
    background-color: rgb(191, 191, 191);
  }
}

.big-pic {
  padding: 0 30px;
}

.simi-singer-list {
  margin: 10px 30px 0;
}
</style>