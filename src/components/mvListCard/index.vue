<script setup lang='ts'>
import { defineProps, defineEmits } from 'vue'
import { handleNum } from '@/utils/index'
const emits = defineEmits(['clickListCardItem', 'loadBottom'])
const props = defineProps({
  videoList: {
    type: Array,
    default() {
      return [];
    },
  },
  isLoad: {
    type: Boolean,
    default: () => false,
  }
})

const load = () => {
  emits('loadBottom')
}

const clickListCardItem = (id: any, index: any, type: any) => {
  emits('clickListCardItem', { id, index, type })
}
</script>
<template>
  <div>
    <!-- mv -->
    <div class="videoListCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      :infinite-scroll-distance="300" :infinite-scroll-immediate="false">
      <div class="cardItem" v-for="(item, index) in (props.videoList as any)" :key="index"
        @click="clickListCardItem(item.id, index, item.type)">
        <div class="videoCover">
          <img v-lazy="
            (item.cover) +
            '?param=1360y800'
          " alt="" />
          <div class="playCount">
            <i class="iconfont icon-shipin"></i>{{ handleNum(item.playCount) }}
          </div>
        </div>
        <div class="videoTitle">{{ item.name }}</div>
        <div class="singer">{{ item.artistName }}</div>
      </div>
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
  cursor: pointer;
}

/* .cardItem:nth-child(4n) {
  margin: 0;
} */

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
}
</style>