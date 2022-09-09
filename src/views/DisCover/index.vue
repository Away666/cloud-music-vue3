<script setup lang='ts'>
import NavBar from '@/components/NavBar/index.vue';
import { reactive } from 'vue';

const data = reactive({
  navBarList: [
    { name: "个性推荐", path: "/discover/recommend" },
    { name: "歌单", path: "/discover/songlist" },
    { name: "排行榜", path: "/discover/rank" },
    { name: "歌手", path: "/discover/singer" },
  ],
})
</script>
<template>
  <div class="discover">
    <nav-bar class="nav-bar" :navBarList="data.navBarList"></nav-bar>
    <div class="discover-content scroll">
      <router-view></router-view>
    </div>
  </div>
</template>
<style lang="less" >
.nav-bar {
  padding: 0px 20px;
}

.discover-content {
  width: 100%;
  padding: 10px 100px 0;
  // overflow-y: scroll;
  height: calc(100vh - 165px);
}

// .discover-content::-webkit-scrollbar {
//   width: 0px;
// }
</style>