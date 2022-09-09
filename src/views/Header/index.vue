<script setup lang='ts'>
import Search from '@/components/Search/index.vue';
import Login from '@/components/Login/index.vue';

</script>
<template>
  <el-row align="middle">
    <el-col :span="4">
      <div class="logo">
        <img src="../../assets/images/logo.png" alt="">
      </div>
    </el-col>
    <el-col :span="2">
      <div class="buttons">
        <i class="iconfont icon-arrow-left-bold back" @click="$router.go(-1)"></i>
        <i class="iconfont icon-arrow-right-bold forward" @click="$router.go(1)"></i>
      </div>
    </el-col>
    <el-col :span="14">
      <Search></Search>
    </el-col>
    <el-col :span="4">
      <Login ></Login>
    </el-col>
  </el-row>
</template>
<style lang="less" >
.el-row {
  height: 60px;
  background: #ec4141;

  .logo {
    position: relative;
    height: 100%;

    img {
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
      height: 40px;
    }
  }

  .el-col-2 {
    .buttons {
      i {
        color: white;
        background-color: #e13e3e;
        border-radius: 50%;
        margin: 0 3px;
        padding: 5px;
      }
    }
  }

}
</style>