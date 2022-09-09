<script setup lang='ts'>
import router from '@/router';
import { defineProps } from 'vue'
const props: any = defineProps({
  list: {
    type: Array,
    default: () => []
  }
})

// 跳转到歌手详情页
const goToSingerDetail = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}
</script>
<template>
  <div class="newest-music">
    <div class="item" v-for="(item, index) in props.list" :key="index">
      <img v-lazy="item.album.picUrl + '?param=100y100'" alt="" />
      <div class="content">
        <div class="songName">{{ item.name }}</div>
        <div class="singer" @click="goToSingerDetail(item.artists[0].id)">
          {{ item.artists[0].name }}
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.newest-music {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;

  .item {
    width: 33%;
    height: 60px;
    margin: 10px 0;
    position: relative;
    border-radius: 10px;

    img {
      height: 100%;
      border-radius: 10px;
      cursor: pointer;
    }

    .content {
      width: calc(100% - 68px);
      height: 60px;
      display: inline-block;
      position: absolute;
      top: 0;
      margin-left: 8px;

      .songName {
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        overflow: hidden; //超出的文本隐藏
        text-overflow: ellipsis; //溢出用省略号显示
        white-space: nowrap; //溢出不换行
      }

      .singer {
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        cursor: pointer;
        color: #999;
      }

      .singer:hover {
        color: #666;
      }
    }
  }

  .item:hover {
    background-color: rgb(234, 234, 234);
  }
}
</style>