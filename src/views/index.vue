<script setup lang='ts'>
import { onMounted } from 'vue';
import Header from '@/views/Header/index.vue';
import Footer from '@/views/Footer/index.vue';
import Aside from './Aside/index.vue';
import { getLikeMusics } from '@/api/songlistDetail';
import { useStore } from 'vuex';
import SongDetail from './SongDetail/index.vue';
const store = useStore()

// 获取我喜欢的音乐
const getLikeMusicHandle = () => {
  let timestamp = Date.parse(new Date().toString())
  getLikeMusics(window.localStorage.getItem("userId"), timestamp).then((res) => {
    store.dispatch('songList/getLikeMusicList', res.data.ids)
  })
}

onMounted(() => {
  getLikeMusicHandle()
})
</script>
<template>
  <el-container>
    <el-header>
      <Header></Header>
    </el-header>
    <el-container>
      <el-aside width="220px">
        <Aside></Aside>
      </el-aside>
      <el-main>
        <!-- 给router-view添加key有可能对性能有一定的损耗，
        但是可以解决push同一个地址不同参数时不会重新渲染router-view的问题 -->
        <router-view :key="$route.fullPath"></router-view>
      </el-main>
    </el-container>
    <el-footer>
      <Footer></Footer>
    </el-footer>
    <SongDetail></SongDetail>
  </el-container>
</template>
<style lang="less">
.el-container {
  .el-header {
    --el-header-padding: 0;
  }

  .el-container {
    height: calc(100vh - 120px);

    .el-aside {
      height: 100%;
    }

    .el-menu {
      height: 100%;
    }

  }

  .el-main {
    padding: 0;
  }

  .el-footer {
    z-index: 1001;
    --el-header-padding: 0;
    border-top: 1px solid #ddd;
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: #fff;
  }
}
</style>
