<script setup lang='ts'>
import { onMounted, reactive, watch, defineProps, defineEmits } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { handleNum, formatDate } from '@/utils/index'
import { ElMessage } from 'element-plus';
import router from '@/router';
import { getAlbumData, subAlbumApi } from '@/api/collected';

const route = useRoute()
const store = useStore()
const emits = defineEmits(['playAllHandle', 'addToPlayListHandle'])
const props = defineProps({
  albumDetailInfo: {
    type: Object,
    default: () => { }
  }
})

const data = reactive({
  isCollect: false,
  isCreate: false,
})

const getAlbumDataHandle = () => {
  let timestamp = Date.parse(new Date().toString())
  getAlbumData(timestamp).then((res) => {
    if (res.data.code == 200) {
      res.data.data.forEach((item: any) => {
        if (item.id == route.params.id) {
          data.isCollect = true
        }
      })
    }
  })
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
  let t = data.isCollect ? 2 : 1
  subAlbumApi(route.params.id, t).then((res) => {
    if (res.data.code === 200) {
      data.isCollect = !data.isCollect
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

const toSingerDetail = (id: string) => {
  router.push({ name: 'singerdetail', params: { id } })
}

onMounted(() => {
})
watch(() => props.albumDetailInfo, (current, last) => {
  if (current.id) {
    getAlbumDataHandle()
  }
})


</script>
<template>
  <div class="info">
    <!-- 歌单封面 -->
    <div class="listAvatar">
      <img v-lazy="props.albumDetailInfo.picUrl + '?param=400y400'" alt="" />
    </div>
    <div class="right">
      <!-- 标题 -->
      <div class="title">
        <div class="titleTag">专辑</div>
        <div class="titleContent">{{ props.albumDetailInfo.name }}
          <span class="sub-head" v-if="props.albumDetailInfo.alias">
            <span v-for="(item, index) in props.albumDetailInfo.alias" :key="index">
              <span v-if="index === 0">({{ item }})</span>
            </span>
          </span>
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
        <div class="buttonItem" :title="data.isCollect ? '取消收藏' : '收藏'" @click="clickCollectHandle">
          <i class="iconfont icon-folder-checked" :class="data.isCollect ? 'red' : ''" v-if="data.isCollect"></i>
          <i class="iconfont icon-folder-add" v-else></i>
          <span>{{ data.isCollect ? "已收藏" : "收藏" }}</span>
        </div>
        <div class="buttonItem">
          <i class="iconfont icon-zhuanfa"></i>
          <span>分享 ({{ handleNum(props.albumDetailInfo.info?.shareCount) }})</span>
        </div>
      </div>
      <!-- 歌手信息 -->
      <div class="singer-info">
        <p>歌手：<span class="name" @click="toSingerDetail(props.albumDetailInfo.artist?.id)">{{
            props.albumDetailInfo.artist?.name
        }}</span></p>
        <p>时间：<span>{{ formatDate(props.albumDetailInfo?.publishTime, 'yyyy-MM-dd') }}</span></p>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.info {
  padding: 0 30px;
  display: flex;

  .singer-info {
    font-size: 14px;

    p {
      margin: 5px 0;
    }

    .name {
      cursor: pointer;
      color: #6191c2;
    }

    .name:hover {
      color: #0a88d1;
    }
  }
}

.listAvatar {
  display: inline-block;
  width: 230px;
  height: 200px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 15px;
  position: relative;
}

.listAvatar::after {
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

.listAvatar img {
  height: 100%;
  border-radius: 10px;
}

.right {
  display: inline-block;
  width: calc(100% - 245px);
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
  width: 95%;

  .sub-head {
    color: rgb(159, 159, 159);
  }
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
  margin: 8px 0 8px 0;
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