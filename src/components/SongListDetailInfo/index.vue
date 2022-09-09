<script setup lang='ts'>
import { subSongList } from '@/api/songlistDetail'
import { onMounted, reactive, watch, defineProps, defineEmits } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { handleNum, formatDate } from '@/utils/index'
import { ElMessage } from 'element-plus';
import { getAsideList } from '@/api/aside/index'
import router from '@/router';

const route = useRoute()
const store = useStore()
const emits = defineEmits(['playAllHandle', 'addToPlayListHandle'])
const props = defineProps({
  songListDetailInfo: {
    type: Object,
    default: () => { }
  }
})

const data = reactive({
  isCollect: false,
  isCreate: false,
})

// 判断是不是收藏的歌单
const isCollectHandle = () => {
  store.state.aside.collectedMusicList.forEach((item: any) => {
    if (item.id == route.params.id) {
      data.isCollect = true
      return;
    }
  });
}

// 判断是不是创建的歌单
const isCreateHandle = () => {
  store.state.aside.createdMusicList.forEach((item: any) => {
    if (item.id == route.params.id) {
      data.isCreate = true
      return;
    }
  });
}

// 点击播放全部
const playAllHandle = () => {
  emits('playAllHandle')
}

// 点击收藏或者取消收藏
const clickCollectHandle = () => {
  let timestamp: number = Date.parse(new Date().toString());

  if (!store.state.login.isLogin) {
    ElMessage({
      message: '请先进行登录操作!',
      type: 'error',
    })
    return;
  }
  let isSub = data.isCollect ? 2 : 1
  subSongList(route.params.id, isSub, timestamp).then((res) => {
    if (res.data.code == 200) {
      const userId = window.localStorage.getItem("userId")
      getAsideList(userId, timestamp).then((res: any) => {
        if (res.data.code == 200) {
          data.isCollect = !data.isCollect
          res = res.data.playlist;
          let index = res.findIndex((item: any) => item.subscribed == true);
          let collectedMusicList = res.slice(index);
          // store.dispatch("aside/getCreatedList", data.createdMusicList)
          store.dispatch('aside/getCollectedList', collectedMusicList)
        }
      })
    }
  })
}

// 点击添加到播放列表
const addToPlayListHandle = () => {
  emits('addToPlayListHandle')
}

const mouseenter = () => {
  document.querySelector(".play-all-left")?.classList.add("play-all-left-hover")
}

const mouseleave = () => {
  document.querySelector(".play-all-left-hover")?.classList.remove("play-all-left-hover")
}

const toUserDetail = (id: any) => {
  router.push({ name: 'userdetail', params: { id } })
}

onMounted(() => {
  isCollectHandle()
  isCreateHandle()
})

watch(() => store.state.aside.collectedMusicList, (current, last) => {
  isCollectHandle()
})

watch(() => store.state.aside.createdMusicList, (current, last) => {
  isCreateHandle()
})

</script>
<template>
  <div class="info">
    <!-- 歌单封面 -->
    <div class="listAvatar">
      <img v-lazy="props.songListDetailInfo.coverImgUrl" alt="" />
    </div>
    <div class="right">
      <!-- 标题 -->
      <div class="title">
        <div class="titleTag">歌单</div>
        <div class="titleContent">{{ props.songListDetailInfo.name }}</div>
      </div>
      <!-- 用户信息 -->
      <div class="user" v-if="props.songListDetailInfo.creator">
        <div class="userAvatar">
          <img v-lazy="props.songListDetailInfo.creator.avatarUrl + '?param=200y200'" alt="" />
        </div>
        <div class="userName" @click="toUserDetail(props.songListDetailInfo.creator.userId)">
          {{ props.songListDetailInfo.creator.nickname }}
        </div>
        <div class="createTime">
          {{ formatDate(props.songListDetailInfo.createTime, "yyyy-MM-dd") }}创建
        </div>
      </div>
      <!-- 操作按钮 -->
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
        <div class="buttonItem" :title="data.isCollect ? '取消收藏' : '收藏'" v-if="!data.isCreate"
          @click="clickCollectHandle">
          <i class="iconfont icon-folder-checked" :class="data.isCollect ? 'red' : ''" v-if="data.isCollect"></i>
          <i class="iconfont icon-folder-add" v-else></i>
          <span>{{ data.isCollect ? "已收藏" : "收藏" }} ({{ handleNum(props.songListDetailInfo.subscribedCount) }})</span>
        </div>
        <div class="buttonItem">
          <i class="iconfont icon-zhuanfa"></i>
          <span>分享 ({{ handleNum(props.songListDetailInfo.shareCount) }})</span>
        </div>
      </div>
      <!-- 标签 -->
      <div class="tags" v-if="props.songListDetailInfo.tags">
        标签：
        <div class="tagItem" v-for="(item, index) in props.songListDetailInfo.tags" :key="index">
          {{ item }}
        </div>
        <div v-if="props.songListDetailInfo.tags.length == 0">暂无标签</div>
      </div>
      <!-- 歌曲列表的歌曲数量和播放量 -->
      <div class="otherInfo">
        <div class="musicNum">
          歌曲 : {{ props.songListDetailInfo.trackCount }}
        </div>
        <div class="playCount">
          播放 : {{ handleNum(props.songListDetailInfo.playCount) }}
        </div>
      </div>
      <div class="desc">
        简介 :
        {{ props.songListDetailInfo.description ? props.songListDetailInfo.description : "暂无简介" }}
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.info {
  padding: 0 30px;
}

.listInfo {
  display: flex;
  padding: 25px 15px;
  align-items: center;
}

.listAvatar {
  display: inline-block;
  width: 180px;
  height: 180px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 15px;
  position: relative;
}

.listAvatar::after {
  content: "";
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  background: url("~@/assets/images/imgLoading.png") no-repeat;
  background-size: contain;
  z-index: -1;
}

.listAvatar img {
  width: 100%;
}

.right {
  display: inline-block;
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
  // transform: scale(0.8);
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

.user {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.userAvatar {
  height: 25px;
  width: 25px;
  margin-right: 8px;
}

.userAvatar img {
  width: 100%;
  border-radius: 50%;
  cursor: pointer;
}

.userName {
  color: #6191c2;
  margin-right: 8px;
  cursor: pointer;
}



.buttons {
  margin: 8px 0 8px -5px;
  display: flex;
}

.buttonItem {
  display: flex;
  height: 40px;
  line-height: 40px;
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
  color: white;
  border-radius: unset;
  padding: 0;
  border: unset;

  .play-all-left {
    height: 40px;
    background-color: #ec4141;
    padding-left: 15px;
    padding-right: 10px;
    // border: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    position: relative;
  }

  .play-all-left::after {
    content: '';
    position: absolute;
    right: 0;
    background: #ddd;
    width: 1px;
    height: 38px;
    -webkit-transform: scaleX(0.3);
  }

  .play-all-right {
    height: 40px;
    background-color: #ec4141;
    padding-left: 12px;
    padding-right: 12px;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  .play-all-left:hover {
    background-color: rgb(204, 50, 50);

    +.play-all-right {
      background-color: rgb(215, 53, 53);
    }
  }

  // 不能对兄弟之前的元素产生影响
  .play-all-right:hover {
    background-color: rgb(204, 50, 50);

    +.play-all-left {
      background-color: rgb(215, 53, 53);
    }
  }

  .play-all-left-hover {
    background-color: rgb(215, 53, 53);
  }
}

.tags {
  // margin: 8px 0 0 -30px;
  display: flex;
  font-size: 12px;
  line-height: 20px;
  // transform: scale(0.9);
}

.tagItem {
  color: #6191c2;
  margin-right: 5px;
}

.otherInfo {
  // margin: 5px 0 0 -30px;
  display: flex;
  font-size: 12px;
  line-height: 20px;
  // transform: scale(0.9);
}

.musicNum {
  margin-right: 13px;
}

.desc {
  // margin: 5px 0 0 -30px;
  font-size: 12px;
  line-height: 20px;
  // transform: scale(0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.red {
  color: #ec4141;
}

/deep/ .el-table tr {
  cursor: pointer;
}
</style>