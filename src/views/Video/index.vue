<script setup lang='ts'>
import { reactive } from 'vue'
import NavBar from '@/components/NavBar/index.vue';
const data = reactive({
  navBarList: [
    { name: "视频", path: "/video/videolist" },
    { name: "MV", path: "/video/mvlist" }
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
    padding: 5px 30px;
  }

  .content {
    height: calc(100vh - 165px);
  }
}
</style>