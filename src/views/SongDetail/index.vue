<script setup lang='ts'>
import { getMusicComment, getMusicUrl } from '@/api/songlistDetail';
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
import Lyric from '@/components/Lyric/index.vue';
import Comment from '@/components/Comment/index.vue';
import router from '@/router';
const store = useStore()
const data = reactive({
  isShowMusicDetail: false,
  musicUrl: '',
  songList: [],
  currentMusic: { al: { picUrl: '', id: '', name: '' }, name: '', ar: [{ id: '', name: '' }], mv: '', alia: [], },
  commentData: { hotComments: [], total: 0, comments: [], },
  currentCommentPage: 1,
  total: 0,
})

const getCommentData = (id: any) => {
  let timestamp: number = Date.parse(new Date().toString());
  getMusicComment(id, (data.currentCommentPage - 1) * 50, 50, timestamp).then((res) => {
    if (res.data.code === 200) {
      data.commentData = res.data
      data.total = res.data.total
    }
  })
}
const toMusicDetail = () => {
  data.isShowMusicDetail = !data.isShowMusicDetail
  store.dispatch('songList/updateMusicDetailState', data.isShowMusicDetail)
}

const toAlbumDetail = (id: any) => {
  data.isShowMusicDetail = false
  store.dispatch('songList/updateMusicDetailState', data.isShowMusicDetail)
  router.push({ name: 'albumdetail', params: { id } })
}
const toSingerDetail = (id: any) => {
  data.isShowMusicDetail = false
  store.dispatch('songList/updateMusicDetailState', data.isShowMusicDetail)
  router.push({ name: 'singerdetail', params: { id } })
}
const toMvDetail = (id: any) => {
  data.isShowMusicDetail = false
  store.dispatch('songList/updateMusicDetailState', data.isShowMusicDetail)
  store.dispatch('songList/updatePlayState', false)
  router.push({ name: 'videodetail', params: { id, type: 'mv' } })
}
const currentChange = (newPage: number) => {
  data.currentCommentPage = newPage
  let songDetailContainer: any = document.querySelector(".song-detail-container");
  let lyricContainer: any = document.querySelector("body");
  songDetailContainer.scrollTo({
    behavior: "smooth",
    top: (lyricContainer.clientHeight * 0.4) + 180,
  });
  getCommentData(store.state.songList.musicId)
}

watch(() => store.state.songList.isShowMusicDetail, (current) => {
  data.isShowMusicDetail = current
})
watch(() => store.state.songList.songList, (current) => {
  if (current) {
    data.songList = current
  }
})
watch(() => store.state.songList.musicId, (current, last) => {
  data.songList = store.state.songList.songList
  let index = data.songList.findIndex((item: any) => {
    return item.id === current
  })
  data.currentMusic = data.songList[index]
  getMusicUrl(current, 'hires').then((res) => {
    if (res.data.code === 200) {
      data.musicUrl = res.data.data[0].url
    }
  })
  data.currentCommentPage = 1
  getCommentData(current)
  let songDetailContainer: any = document.querySelector(".song-detail-container");
  songDetailContainer.scrollTo({
    behavior: "smooth",
    top: 0,
  });
})
</script>
<template>
  <div class="song-detail-container scroll" :class="[data.isShowMusicDetail ? '' : 'hide']">
    <div class="icon-box" @click="toMusicDetail" title="收起音乐详情页"><i class="iconfont icon-arrow-down-bold"></i></div>
    <div class="musicDetailCardContainer">
      <div class="top">
        <div class="left">
          <div class="discContainer">
            <div class="needle" :class="store.state.songList.isPlaying ? 'needleRotate' : ''" ref="needle">
              <img src="@/assets/images/MusicDetailCard/needle.png" alt="" />
            </div>
            <!-- 通过音乐的加载时差删除discAnimation类名再添加,达到重置动画的效果 -->
            <div class="disc discAnimation" :class="[store.state.songList.isPlaying ? '' : 'pause']" ref="disc">
              <img src="@/assets/images/MusicDetailCard/disc.png" alt="" />
              <img src="@/assets/images/test.jpg" alt="" class="musicAvatar" v-if="!data.currentMusic.al" />
              <img :src="data.currentMusic.al.picUrl" alt="" class="musicAvatar" v-else />
            </div>
          </div>
        </div>
        <div class="center">
          <h1 class="musicName">{{ data.currentMusic.name }} <span class="mv" v-if="data.currentMusic.mv"
              @click="toMvDetail(data.currentMusic.mv)">MV
              <p class="symbol">▶</p>
            </span>
          </h1>
          <div class="alia"> {{ data.currentMusic.alia[0] }}</div>
          <div>
            <span v-for="(item1, index) in data.currentMusic.ar" :key="index"><span v-if="index != 0" class="alia"> /
              </span>
              <span class="singer" @click="toSingerDetail(item1.id)">
                {{ item1.name }}</span>
            </span>-
            <span class="singer" @click="toAlbumDetail(data.currentMusic.al.id)">
              {{ data.currentMusic.al.name }}
            </span>
          </div>
        </div>
        <div class="right">
          <Lyric></Lyric>
        </div>
      </div>
      <div class="bottom">
        <!-- 热门评论 -->
        <Comment :comments="data.commentData.hotComments" :commentType="'0'"
          :style="{padding: data.commentData.hotComments ? '20px' :'0px'}"
          :commentId="store.state.songList.musicId + ''" :isHotComment="data.commentData.hotComments ? true : false"
          @getSongListCommentHandle="getCommentData(store.state.songList.musicId)" ref="hotComments">
          <template #title v-if="data.commentData.hotComments">
            <div>全部评论({{ data.commentData.total }})</div>
          </template>
        </Comment>
        <!-- 最新评论 -->
        <Comment :comments="data.commentData.comments" :commentType="'0'" style="padding: 20px;"
          :commentId="store.state.songList.musicId + ''" :isHotComment="data.commentData.hotComments ? false : true"
          @getSongListCommentHandle="getCommentData(store.state.songList.musicId)" :musicName="data.currentMusic.name">
          <template #title>
            <div>最新评论({{ data.commentData.total }})</div>
          </template>
        </Comment>
        <!-- 分页 -->
        <div class="page" v-if="data.commentData.comments">
          <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="50"
            :current-page="data.currentCommentPage" @current-change="currentChange" :hide-on-single-page="true">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.song-detail-container {
  position: fixed;
  height: calc(100% - 60px);
  width: 100%;
  bottom: 60px;
  left: 0;
  z-index: 1000;
  transition: all 0.25s ease;
  background-color: white;
  // background-image: linear-gradient(to bottom, #e3e2e3, white);

  .icon-box {
    display: flex;
    height: 60px;
    width: 40px;
    margin-left: 20px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}

.hide {
  bottom: calc(-100vh + 60px);
}

.musicDetailCardContainer {
  display: flex;

  .top {
    display: flex;
    justify-content: center;
  }

  .left {
    width: 220px;
    position: absolute;
    top: 60px;
    left: 15%;
  }

  .needle {
    position: relative;
    left: 50%;
    width: 88px;
    height: 72px;
    z-index: 10000;
    transition: all .5s;
    transform-origin: 5.3px 5.3px;
  }

  .needle img {
    width: 100%;
  }

  .needleRotate {
    transform-origin: 5.3px 5.3px;
    transform: rotate(22deg);
  }

  .disc {
    width: 220px;
    height: 220px;
    position: relative;
    top: -12px;
  }

  .disc img:nth-child(1) {
    width: 100%;
  }

  .disc .musicAvatar {
    position: absolute;
    top: 35px;
    left: 35px;
    width: 150px;
    z-index: -1;
  }

  /* 碟子设置旋转动画 */
  .discAnimation {
    /* infinite动画无限循环 */
    animation: disc 25s linear infinite;
    /* 动画延迟一秒 */
    animation-delay: 0.8s;
  }

  .pause {
    animation-play-state: paused;
    -webkit-animation-play-state: paused;
  }

  .center {
    position: absolute;
    top: 60px;
    left: 50%;
    transform: translate(-50%, -0%);
    display: flex;
    flex-direction: column;
    align-items: center;

    .mv {
      cursor: pointer;
      padding: 0 2px;
      font-size: 12px;
      color: #ec4141;
      border: 1px solid #ec4141;
      border-radius: 3px;
      width: 39px;
      height: 20px;
      position: absolute;
      transform: scale(0.8);

      .symbol {
        float: right;
        font-size: 12px;
        transform: scale(0.5);
      }
    }

    h3 {
      font-weight: 500;
    }

    .alia {
      font-size: 13px;
      line-height: 22px;
      color: #ababab;
    }

    .singer {
      font-size: 13px;
      line-height: 22px;
      color: #ababab;
      cursor: pointer;
    }

    .singer:hover {
      color: #5F89B6;
    }
  }

  .right {
    position: absolute;
    width: 40%;
    height: 40%;
    top: 150px;
    left: 50%;
    transform: translate(-50%, -0%);
  }

  .bottom {
    position: absolute;
    top: calc(40% + 160px);
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
  }
}

.page {
  margin-bottom: 50px;
}

@keyframes disc {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>