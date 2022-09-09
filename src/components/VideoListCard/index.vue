<script setup lang='ts'>
import { defineProps, defineEmits } from 'vue'
import { handleMusicTime, handleNum } from '@/utils/index'
import router from '@/router';
import { getSingerDetailData } from '@/api/singerDetail';
const emits = defineEmits(['bottomLoad', 'clickListCardItem'])
const props = defineProps({
  videoList: {
    type: Array,
    default() {
      return [];
    },
  },
  // 是否触底加载
  isLoad: {
    type: Boolean,
    default() {
      return false;
    },
  },
  videoType: {
    type: String,
    default() {
      return "singerMv";
    },
  }
})
const load = () => {
  emits('bottomLoad')
}

const clickListCardItem = (id: any, index: any, type: any) => {
  emits('clickListCardItem', { id, index, type })
}

const toUserDetail = (id: any) => {
  router.push({ name: 'userdetail', params: { id } })
}

const toMvDetail = (id: any) => {
  router.push({ name: 'videodetail', params: { id, type: 'mv' } })
}

const toSingerDetail = (id: any) => {
  getSingerDetailData(id).then((res) => {
    if (res.data.code === 200) {
      router.push({ name: 'singerdetail', params: { id } })
    }
  })
}
</script>
<template>
  <!-- singermv 和 mv -->
  <div>
    <div class="videoListCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="300" :infinite-scroll-immediate="false" v-if="videoType === 'singerMv'">
      <div class="cardItem" v-for="(item, index) in (videoList as any)" :key="index">
        <div class="videoCover" @click="clickListCardItem(item.id, index, item.type)">
          <img v-lazy="
            (videoType == 'singerMv' ? item.imgurl : item.cover) +
            '?param=680y400'
          " alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playCount) }}
          </div>
          <div class="videoTime" v-if="videoType == 'singerMv'">
            {{ handleMusicTime(item.duration) }}
          </div>
        </div>
        <div class="videoTitle" @click="toMvDetail(item.id)">{{ item.name }}</div>
      </div>
      <div class="fake" v-for="item in (4 - props.videoList.length % 4)" :key="item"></div>
    </div>
    <!-- mv -->
    <div class="videoListCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="300" :infinite-scroll-immediate="false" v-if="videoType === 'mv'">
      <div class="cardItem" v-for="(item, index) in (videoList as any)" :key="index">
        <div class="videoCover" @click="clickListCardItem(item.id, index, item.type)">
          <img v-lazy="item.cover + '?param=680y400'
          " alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playCount) }}
          </div>
        </div>
        <div class="videoTitle">{{ item.name }}</div>
        <div class="singer" v-if="videoType == 'mv'"><span @click="toSingerDetail(item.artistId)">{{ item.artistName
        }}</span>
        </div>
      </div>
      <div class="fake" v-for="item in (4 - props.videoList.length % 4)" :key="item"></div>
    </div>
    <!-- video -->
    <div class="videoListCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="300" :infinite-scroll-immediate="false" v-else-if="videoType == 'video'">
      <div class="cardItem" v-for="(item, index) in (videoList as any)" :key="index">
        <div class="videoCover" @click="clickListCardItem(item.vid || item.data.vid, index, item.type)">
          <img v-lazy="(item.coverUrl || item.data.coverUrl) + '?param=1260y800'" alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playTime) || handleNum(item.data.playTime) }}
          </div>
          <div class="videoTime">
            {{ handleMusicTime(item.durationms || item.data.durationms) }}
          </div>
        </div>
        <div class="videoTitle">{{ item.title || item.data.title }}</div>
        <div class="creator" v-if="item.data">
          by<span @click="toUserDetail(item.data.creator.userId)">{{ item.data.creator.nickname }}</span>
        </div>
        <div class="creator" v-else>
          by<span @click="toUserDetail(item.creator[0].userId)">{{ item.creator[0].userName }}</span>
        </div>
      </div>
      <div class="fake" v-for="item in (4 - props.videoList.length % 4)" :key="item"></div>
    </div>
    <!-- favoriteVideo -->
    <div class="videoListCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="300" :infinite-scroll-immediate="false" v-else-if="videoType == 'favoriteVideo'">
      <div class="cardItem" v-for="(item, index) in (videoList as any)" :key="index">
        <div class="videoCover" @click="clickListCardItem(item.vid || item.data.vid, index, item.type)">
          <img v-lazy="(item.coverUrl || item.data.coverUrl) + '?param=1260y800'" alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playTime) || handleNum(item.data.playTime) }}
          </div>
          <div class="videoTime">
            {{ handleMusicTime(item.durationms || item.data.durationms) }}
          </div>
        </div>
        <div class="videoTitle">{{ item.title || item.data.title }}</div>
        <div class="creator">
          by<span>{{ item.creator[0].userName }}</span>
        </div>
      </div>
      <div class="fake" v-for="item in (4 - props.videoList.length % 4)" :key="item"></div>
    </div>
    <!-- searchDetailVideo -->
    <div class="videoListCard" v-else-if="videoType == 'searchDetailVideo'">
      <div class="cardItem" v-for="(item, index) in (videoList as any)" :key="index">
        <div class="videoCover" @click="clickListCardItem(item.vid || item.data.vid, index, item.type)">
          <img v-lazy="(item.coverUrl) + '?param=1260y800'" alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playTime) }}
          </div>
          <div class="videoTime">
            {{ handleMusicTime(item.durationms) }}
          </div>
        </div>
        <div class="videoTitle">{{ item.name }}</div>
        <div class="creator">
          <span v-for="(singer, index) in item.creator" :key="index">
            <span v-if="index === 0" @click="toSingerDetail(singer.userId)">{{ singer.userName }}</span></span>
        </div>
      </div>
      <div class="fake" v-for="item in (4 - props.videoList.length % 4)" :key="item"></div>
    </div>
    <div v-else-if="props.videoList.length === 0">
      <div class="no-data">暂无数据</div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.videoListCard {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0;
  margin-top: 20px;
  padding: 0 30px;
}

.cardItem {
  /* max-width: 228px; */
  /* width: 14.64vw; */
  /* margin-right: 1%; */
  /* margin-left: 1%; */
  /* margin-bottom: 20px; */
  width: 22%;
  overflow: hidden;
  margin-bottom: 20px;

}

/* .cardItem:nth-child(4n) {
  margin: 0;
} */

.fake {
  content: '';
  width: 22%;
  border: 1px solid transparent;
  overflow: hidden;
}

.videoCover {
  position: relative;
  /* height: 11.6vw; */
  height: 9.28vw;
  width: 100%;
  max-height: 144px;
  overflow: hidden;
  border-radius: 10px;
  display: flex;
  align-items: center;
  background-color: black;
  cursor: pointer;
}

.videoCover img {
  width: 18.3vw;
}

.playCount {
  font-size: 12px;
  color: white;
  position: absolute;
  top: 0;
  right: 5px;
  transform: scale(0.9);
}

.videoTime {
  font-size: 12px;
  color: white;
  position: absolute;
  bottom: 5px;
  transform: scale(0.9);
  right: 5px;
}

.videoTitle {
  cursor: pointer;
  margin-top: 8px;
  font-size: 12px;
  line-height: 16px;
  color: rgb(32, 32, 32);
  word-break: break-all;
  /* 两行溢出 */
  /*text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.creator {
  margin-top: 5px;
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  color: #c7c5c5;

  span {
    cursor: pointer;
    margin-left: 5px;
  }

  span:hover {
    color: gray;
  }
}

.singer {
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  margin: 1px 0 0 -1px;
  padding: 0;
  color: #c7c5c5;

  span {
    cursor: pointer;
  }

  span:hover {
    color: gray;
  }
}

.no-data {
  margin-top: 100px;
  text-align: center;
}
</style>