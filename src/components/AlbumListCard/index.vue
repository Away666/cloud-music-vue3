<script setup lang='ts'>
import { defineProps, defineEmits, reactive, watch } from "vue";
import { formatDate, handleNum } from '@/utils'
import router from "@/router";
const emits = defineEmits(['bottomLoad'])
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
})

const load = () => {
  emits('bottomLoad')
}

const clickListCardItem = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}


</script>
<template>
  <div class="listCard" v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad"
    :infinite-scroll-distance="100" :infinite-scroll-immediate="false" ref="listCard">
    <div v-for="(item, index) in props.list" :key="index" @click="clickListCardItem(item.id)" class="listCardItem">
      <div class="image">
        <img v-lazy="(item.picUrl || item.coverImgUrl) + '?param=400y400'" alt="" />
      </div>
      <div class="title">{{ item.name }}</div>
      <div class="time">{{ formatDate(item.publishTime, 'yyyy-MM-dd') }}</div>
    </div>
    <div class="fake" v-for="item in (5 - props.list.length % 5)" :key="item"></div>
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


  .time {
    font-size: 12px;
    margin-top: 10px;
    color: rgb(161, 161, 161);
  }
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


.image {
  width: 100%;
  position: relative;
  box-sizing: border-box;
  border-radius: 10px;
}

.image::after {
  content: "";
  width: 100%;
  height: 90%;
  position: absolute;
  top: 5%;
  left: 0;
  background: url("~@/assets/images/MusicDetailCard/disc.png") no-repeat right;
  background-size: contain;
  border-radius: 10px;
  z-index: -1;
  opacity: 0.9;
}

.image img {
  cursor: pointer;
  width: 90%;
  border-radius: 10px;
  border: 1px solid #eee;
  border-right: 0;
}

.title {
  cursor: pointer;
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
</style>