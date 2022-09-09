<script setup lang='ts'>
import { defineProps, defineEmits } from "vue";
import { handleNum } from '@/utils'
import router from "@/router";
const emits = defineEmits(['clickListCardItem', 'bottomLoad'])
const props: any = defineProps({
  list: {
    type: Array,
    default: () => []
  },
  isLoad: {
    type: Boolean,
    default() {
      return false;
    },
  },
  type: {
    type: String,
    default: () => 'normal'
  }
})

const load = () => {
  emits('bottomLoad')
}

const clickListCardItem = (item: any) => {
  if (item.type === 5) {
    router.push({ name: 'videodetail', params: { id: item.id, type: 'mv' } })
  } else {
    emits('clickListCardItem', item.id)
  }
}

</script>
<template>
  <div>
    <div class="listCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      v-if="props.list.length > 0 && props.type == 'normal'" :infinite-scroll-distance="300"
      :infinite-scroll-immediate="false" ref="listCard">
      <div v-for="(item, index) in props.list" :key="index" @click="clickListCardItem(item)" :class="{
        listCardItem: item.type == 0 || item.tags || item.alias,
        exclusiveItem: item.type == 5,
      }">
        <div :class="{
          image: item.type == 0 || item.tags || item.alias,
          exclusiveImage: item.type == 5,
        }">
          <img v-lazy="(item.picUrl || item.coverImgUrl) + '?param=300y300'" alt="" />
          <span v-if="item.type == 0 || item.tags" class="playCount"><i class="iconfont icon-shipin"></i>{{
             handleNum(item.playCount) 
            }}</span>
        </div>
        <div class="title">{{  item.name  }}</div>
      </div>
      <div class="fake" v-for="item in (5 - props.list.length % 5)" :key="item"></div>
    </div>
    <div class="listCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      v-else-if="props.list.length > 0 && props.type == 'user'" :infinite-scroll-distance="300"
      :infinite-scroll-immediate="false" ref="listCard">
      <div v-for="(item, index) in props.list" :key="index" @click="clickListCardItem(item)" :class="{
        listCardItem: item.type == 0 || item.tags || item.alias,
        exclusiveItem: item.type == 5,
      }">
        <div :class="{
          image: item.type == 0 || item.tags || item.alias,
          exclusiveImage: item.type == 5,
        }">
          <img v-lazy="(item.picUrl || item.coverImgUrl) + '?param=300y300'" alt="" />
          <span v-if="item.type == 0 || item.tags" class="playCount">
            <i class="iconfont icon-shipin"></i>
            <span>{{  handleNum(item.playCount)  }}</span>
          </span>
        </div>
        <div class="title">{{  item.name  }}</div>
        <div class="count">{{  item.trackCount  }}首</div>
      </div>
      <div class="fake" v-for="item in (5 - props.list.length % 5)" :key="item"></div>
    </div>
    <div class="listCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
      v-else-if="props.list.length > 0 && props.type == 'exclusive'" :infinite-scroll-distance="300"
      :infinite-scroll-immediate="false" ref="listCard">
      <div v-for="(item, index) in props.list" :key="index" @click="clickListCardItem(item)" :class="{
        listCardItem: item.type == 0 || item.tags || item.alias,
        exclusiveItem: item.type == 5,
      }">
        <div :class="{
          image: item.type == 0 || item.tags || item.alias,
          exclusiveImage: item.type == 5,
        }">
          <img v-lazy="(item.picUrl || item.coverImgUrl) + '?param=1260y600'" alt="" />
          <span v-if="item.type == 0 || item.tags" class="playCount">
            <i class="iconfont icon-shipin"></i>
            <span>{{  handleNum(item.playCount)  }}</span>
          </span>
        </div>
        <div class="title">{{  item.name  }}</div>
      </div>
      <div class="fake" v-for="item in (5 - props.list.length % 5)" :key="item"></div>
    </div>
    <div class="no-data" v-else>
      <span>没有相关数据</span>
    </div>
  </div>
</template>
<style lang="less" scoped>
.listCard {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
  justify-content: space-between;
}

.listCardItem {
  width: 18.4%;
  margin: 0 0 20px 0;
  overflow: hidden;
  cursor: pointer;
}

.listCardItem:nth-child(5n) {
  margin-right: 0;
}

.fake {
  content: '';
  width: 18.4%;
  border: 1px solid transparent;
  margin: 0 0 20px 0;
  overflow: hidden;
}

.exclusiveItem {
  width: 32%;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 20px;
}

.image {
  width: 100%;
  padding-bottom: 100%;
  height: 0;
  position: relative;

  .playCount {
    display: flex;
    align-items: center;
    position: absolute;
    right: 10px;
    top: 4px;
    color: white;
    font-size: 12px;
  }
}

.image::after {
  content: "";
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: url("~@/assets/images/imgLoading.png") no-repeat center;
  background-size: contain;
  border-radius: 10px;
  z-index: -1;
}

.image img {
  width: 100%;
  border-radius: 10px;
}

.exclusiveImage {
  width: 100%;
  position: relative;
}

.exclusiveImage::after {
  content: "";
  width: 100%;
  height: 95%;
  position: absolute;
  top: 0;
  left: 0;
  background: url("~@/assets/images/imgLoading.png") no-repeat center;
  background-size: contain;
  border-radius: 10px;
  z-index: -1;
}

.exclusiveImage img {
  width: 100%;
  border-radius: 10px;
}

.title {
  margin-top: 8px;
  padding: 0 2px;
  font-size: 14px;
  color: black;
  line-height: 17px;
  /* 两行溢出 */
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.count {
  font-size: 13px;
  color: rgb(150, 150, 150);
  margin-top: 5px;
}

.no-data {
  margin: 100px;
  text-align: center;
}
</style>