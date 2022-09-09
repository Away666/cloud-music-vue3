<script setup lang='ts'>
import { getMvComment, getMvDetailData, getMvLikeList, getMvSubList, getMvUrl, getRelatedVideo, getVideoComment, getVideoDetailData, getVideoUrl, mlogToVideoId, mvSub, videoLike, videoSub } from '@/api/video';
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { handleNum, handleMusicTime, formatDate } from '@/utils/index'
import Comment from '@/components/Comment/index.vue'
import store from '@/store';
import { __metadata } from 'tslib';
import router from '@/router';
const route = useRoute()
const hotComments = ref(null)
const data = reactive({
  videoInfo: { cover: '', coverUrl: '', artists: [{ img1v1Url: '', name: '' }], avatarUrl: '', creator: { nickname: '' }, name: '', title: '', publishTime: '', playCount: 0, playTime: 0, },
  videoUrl: '',
  currentPage: 1,
  limit: 20,
  total: 0,
  comments: { hotComments: [], comments: [] },
  isSub: false,
  isLike: false,
  // 相关视频数据
  relatedVideo: [],
})

// 获取MV的数据
const getMvDetailDataHandle = () => {
  // 获取mv详情信息
  getMvDetailData(route.params.id).then((res) => {
    data.videoInfo = res.data.data;
  })
  // 播放的url
  getMvUrl(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.videoUrl = res.data.data.url
    }
  })
}

// 评论
const getMvCommentDataHandle = () => {
  let timestamp = Date.parse(new Date().toString());
  getMvComment(route.params.id, (data.currentPage - 1) * data.limit, timestamp).then((res) => {
    if (res.data.code == 200) {
      data.comments = res.data
      data.total = res.data.total
    }
  })
}

// 获取Video的数据
const getVideoDetailDataHandle = () => {
  // 获取video的详情信息
  getVideoDetailData(route.params.id).then((res) => {
    data.videoInfo = res.data.data;
  })
  // 播放的url
  getVideoUrl(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.videoUrl = res.data.urls[0].url
    }
  })
}

// 获取视频的评论
const getVideoCommentHnadle = () => {
  let timestamp = Date.parse(new Date().toString());
  getVideoComment(route.params.id, (data.currentPage - 1) * data.limit, timestamp).then((res) => {
    if (res.data.code == 200) {
      data.comments = res.data
      data.total = res.data.total
    }
  })
}

// 获取收藏的MV和视频列表
const getMvSubListHandle = () => {
  let timestamp = Date.parse(new Date().toString());
  getMvSubList(timestamp).then((res) => {
    if (res.data.code == 200) {
      store.dispatch('video/updateVideoList', res.data.data)
      data.isSub = res.data.data.find((item: any) => item.vid == route.params.id)
    }
  })
}

// 获取点赞过的视频,没有点赞过的MV接口
const getMvLikeListHandle = () => {
  let timestamp = Date.parse(new Date().toString());
  getMvLikeList(timestamp).then((res) => {
    if (res.data.code == 200) {
      res.data.data.feeds.forEach((item: any, index: any) => {
        data.isLike = false
        mlogToVideoId(item.mlogBaseData.id, timestamp).then((res) => {
          if (res.data.data == route.params.id) data.isLike = true
        })
      })
    }
  })
}

// 收藏或者取消收藏
const subVideo = async () => {
  let timestamp = Date.parse(new Date().toString());
  if (route.params.type == 'mv') {
    await mvSub(route.params.id, data.isSub ? 0 : 1, timestamp).then((res) => {
    })
  } else {
    await videoSub(route.params.id, data.isSub ? 0 : 1, timestamp).then((res) => {
    })
  }
  await getMvSubListHandle()
}

// 点赞或者取消点赞
const likeVideo = async () => {
  let timestamp = Date.parse(new Date().toString());
  let type = route.params.type == "mv" ? 1 : 5;
  await videoLike(type, route.params.id, data.isLike ? 0 : 1, timestamp).then((res) => {
  })
  getMvLikeListHandle()
}

const scrollToComment = () => {
  let videoDetailContainer: any = document.querySelector(".videoDetailContainer");
  let commentTitle: any = document.querySelector(".commentTitle");
  videoDetailContainer.scrollTo({
    behavior: "smooth",
    top: commentTitle.offsetTop - 70,
  });
}

// 当热门评论和最新评论都存在的时候，input输入框是热门评论的，现在通过ref调用热门评论的方法
const transToHotComment = (info: any) => {
  (hotComments as any).value.floorComment(info.id, info.nickname);
}

const commentPageChange = (page: number) => {
  // data.comments = []
  data.currentPage = page
  scrollToComment()
  if (route.params.type == 'mv') {
    getMvCommentDataHandle()
  } else {
    getVideoCommentHnadle()
  }
}

// 获取相关视频
const getRelatedVideoHandle = () => {
  getRelatedVideo(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.relatedVideo = res.data.data
    }
  })
}

const goToRelatedVideo = (id: any) => {
  router.push({ name: 'videodetail', params: { id, type: "video" } })
}

onMounted(() => {
  // 如果正在播放音乐就暂停播放音乐
  store.dispatch('songList/updatePlayState', false)
  getRelatedVideoHandle()
  getMvSubListHandle()
  getMvLikeListHandle()
  if (route.params.type == 'mv') {
    getMvDetailDataHandle()
    getMvCommentDataHandle()
  } else {
    getVideoDetailDataHandle()
    getVideoCommentHnadle()
  }
})
</script>
<template>
  <div class="videoDetailContainer scroll" v-if="data.videoUrl">
    <div class="left">
      <div class="title">
        {{ $route.params.type == "mv" ? "MV详情" : "视频详情" }}
      </div>
      <video class="videoPlayer" :src="data.videoUrl" controls width="636" height="380" autoplay muted :poster="
        $route.params.type == 'mv' ? data.videoInfo.cover : data.videoInfo.coverUrl
      "></video>
      <!-- 视频详情信息 -->
      <div class="videoInfo" v-if="$route.params.type == 'mv' ? data.videoInfo.cover : data.videoInfo.coverUrl">
        <div class="user">
          <div class="avatar">
            <img v-lazy="
              ($route.params.type == 'mv'
                ? data.videoInfo.artists[0].img1v1Url
                : data.videoInfo.avatarUrl) + '?param=100y100'
            " alt="" />
          </div>
          <div class="userName">
            {{
                $route.params.type == "mv"
                  ? data.videoInfo.artists[0].name
                  : data.videoInfo.creator.nickname
            }}
          </div>
        </div>
        <div class="videoTitle">
          {{ $route.params.type == "mv" ? data.videoInfo.name : data.videoInfo.title }}
        </div>
        <div class="otherInfo">
          <div>
            发布：{{ formatDate(data.videoInfo.publishTime, 'yyyy-MM-dd') }}
          </div>
          <div>
            播放：{{
                handleNum($route.params.type == "mv"
                  ? data.videoInfo.playCount
                  : data.videoInfo.playTime)
            }}
          </div>
        </div>
        <div class="buttons">
          <div class="buttonItem" @click="likeVideo">
            <i class="iconfont icon-good" :class="data.isLike ? 'red' : ''"></i>{{ data.isLike ? "已赞" : "赞" }}
          </div>
          <div class="buttonItem" @click="subVideo">
            <i class="iconfont icon-folder-checked" :class="data.isSub ? 'red' : ''" v-if="data.isSub"></i>
            <i class="iconfont icon-folder-add" v-else></i>{{ data.isSub ? "已收藏" : "收藏" }}
          </div>
          <div class="buttonItem">
            <i class="iconfont icon-zhuanfa"></i>分享
          </div>
        </div>
      </div>
      <!-- 视频评论 -->
      <div class="comment">
        <div class="title commentTitle">评论({{ data.total }})</div>
        <div class="commentList">
          <!-- 精彩评论 -->
          <Comment :comments="data.comments.hotComments" v-if="data.comments.hotComments"
            @getSongListCommentHandle="$route.params.type == 'mv' ? getMvCommentDataHandle() : getVideoCommentHnadle()"
            :isHotComment="data.comments.hotComments ? true : false"
            :commentType="$route.params.type == 'mv' ? '2' : '5'" :commentId="$route.params.id + ''"
            @scrollToComment="scrollToComment" ref="hotComments">
            <template #title>
              <div>精彩评论</div>
            </template>
          </Comment>
          <!-- 最新评论 -->
          <Comment :comments="data.comments.comments" :commentType="$route.params.type == 'mv' ? '2' : '5'"
            style="padding: 30px;" :commentId="$route.params.id + ''"
            @getSongListCommentHandle="$route.params.type == 'mv' ? getMvCommentDataHandle() : getVideoCommentHnadle()"
            :isHotComment="data.comments.hotComments ? false : true" @scrollToComment="scrollToComment"
            @transToHotComment="transToHotComment">
            <template #title>
              <div>最新评论({{ data.total }})</div>
            </template>
          </Comment>
        </div>
        <!-- 分页 -->
        <div class="page" v-if="data.total > 0">
          <el-pagination background layout="prev, pager, next" :total="data.total" small :page-size="data.limit"
            :current-page="data.currentPage" @current-change="commentPageChange" :hide-on-single-page="true">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 相关推荐 -->
    <div class="right" v-if="data.relatedVideo.length != 0">
      <div class="title">相关推荐</div>
      <div class="relatedVideoItem" v-for="(item, index) in (data.relatedVideo as any)" :key="index"
        @click="goToRelatedVideo(item.vid)">
        <div class="relatedVideoItemCover">
          <img v-lazy="item.coverUrl + '?param=300y180'" alt="" />
          <div class="relatedVideoItemPlayCount">
            <i class="iconfont icon-shipin"></i> {{ handleNum(item.playTime) }}
          </div>
          <div class="relatedVideoItemTime">
            {{ handleMusicTime(item.durationms) }}
          </div>
        </div>
        <div class="relatedVideoItemInfo">
          <div class="relatedVideoItemTitle">{{ item.title }}</div>
          <div class="creator">by {{ item.creator[0].userName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.videoDetailContainer {
  height: calc(100vh - 120px);
  padding: 0 30px;
  display: flex;
  justify-content: center;

  .left {
    width: 650px;
  }

  .right {
    margin-left: 30px;
  }

  .title {
    margin: 20px 0;
    color: black;
    font-weight: 600;
  }

  .relatedVideoItem {
    display: flex;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .relatedVideoItemCover {
    position: relative;
    margin-right: 10px;
  }

  .relatedVideoItemCover img {
    width: 180px;
    height: 120px;
    border-radius: 10px;
  }

  .relatedVideoItemPlayCount {
    position: absolute;
    top: 0;
    right: 5px;
    font-size: 12px;
    color: white;
    /* transform: scale(0.9); */
  }

  .relatedVideoItemTime {
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 12px;
    color: white;
    /* transform: scale(0.9); */
  }

  .relatedVideoItemInfo {
    font-size: 14px;
    color: rgb(31, 30, 30);
    margin: 16px 0;
    width: 160px;
  }

  .relatedVideoItemTitle {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .creator {
    color: rgb(156, 156, 156);
    margin-top: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* transform: scale(0.9) translateX(-5%); */
  }

  .user {
    display: flex;
    margin: 10px 0;
    align-items: center;
  }

  .avatar {
    width: 40px;
    height: 40px;
  }

  .avatar img {
    width: 100%;
    border-radius: 50%;
    cursor: pointer;
  }

  .userName {
    font-size: 12px;
    margin-left: 10px;
    color: rgb(36, 36, 36);
    cursor: pointer;
  }

  .videoTitle {
    color: #1b1b1b;
    font-size: 20px;
    margin: 20px 0 10px;
    font-weight: bold;
  }

  .otherInfo {
    display: flex;
    color: #aaa;
    font-size: 12px;
  }

  .otherInfo div {
    margin-right: 20px;
    /* transform: scale(0.9) translateX(-5%); */
  }

  .buttons {
    display: flex;
    font-size: 12px;
    margin: 20px 0;
    color: #252525;
  }

  .buttonItem {
    padding: 5px 20px;
    border: 1px solid #ccc;
    border-radius: 20px;
    margin-right: 10px;
  }

  .buttonItem i {
    font-size: 14px;
    margin-right: 3px;
  }

  .page {
    width: 100%;
    text-align: center;
    padding-bottom: 20px;
  }

  .videoPlayer {
    background-color: black;
  }

  .red {
    color: #ec4141;
  }

  .videoDetail /deep/ .el-loading-spinner {
    top: 40px;
  }
}
</style>