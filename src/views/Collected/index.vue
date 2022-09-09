<script setup lang='ts'>
import { reactive } from 'vue'
import NavBar from '@/components/NavBar/index.vue';
const data = reactive({
  navBarList: [
    { name: "专辑", path: "/collected/album" },
    { name: "歌手", path: "/collected/singer" },
    { name: "视频", path: "/collected/video" },
  ],
})
</script>
<template>
  <div class="video-container">
    <NavBar :navBarList="data.navBarList" class="nav-bar"></NavBar>
    <router-view class="content scroll"></router-view>
  </div>
</template>
<style lang="less" scoped>
.video-container {
  .nav-bar {
    padding: 0 30px;
  }

  .content {
    height: calc(100vh - 165px);
  }
}
</style>