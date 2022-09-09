<script setup lang='ts'>
import { getRankMvData } from '@/api/video';
import { onMounted, reactive } from 'vue';
import CategoryHasWidth from '@/components/CategoryHasWidth/index.vue';
import MvRank from '@/components/MvRank/index.vue'
import router from '@/router';

const data = reactive({
  areaList: [
    { name: "全部", path: "" },
    { name: "内地", path: "内地" },
    { name: "港台", path: "港台" },
    { name: "欧美", path: "欧美" },
    { name: "日本", path: "日本" },
    { name: "韩国", path: "韩国" },
  ],
  // 当前地区
  area: "",
  // Mv排行榜数据
  mvRankList: [],
  // Mv排行榜当前地区
  mvArea: "",
  rankIndex: 0,
})

const getRankMvDataHandle = (area?: any) => {
  getRankMvData(50, area).then((res: any) => {
    if (res.data.code == 200) {
      data.mvRankList = res.data.data
    }
  })
}

const clickMvRankTag = (info: any) => {
  data.mvRankList = []
  getRankMvDataHandle(info.item.path)
  data.rankIndex = info.index
}

const goToVideoDetail = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: "mv" }, })
}

onMounted(() => {
  getRankMvDataHandle()
})
</script>
<template>
  <div class="allMvContainer scroll">
    <h2>全部MV</h2>
    <div class="nav">
      <div class="left">
      </div>
      <div class="right">
        <CategoryHasWidth :hotTag="data.areaList" @clickSongListTag="clickMvRankTag" :activeIndex="data.rankIndex">
        </CategoryHasWidth>
      </div>
    </div>
    <!-- MV排行榜 -->
    <MvRank :mvRankList="data.mvRankList" @clickListCardItem="goToVideoDetail" class="mv-rank"></MvRank>
  </div>
</template>
<style lang="less" scoped>
.allMvContainer {
  height: calc(100vh - 120px);
  padding: 0 30px;

  .nav {
    height: 30px;
    margin-top: 20px;
    padding: 0 30px;

    .left {
      display: inline-block;
      height: 30px;
      line-height: 30px;

      .mvTitle {
        cursor: pointer;
      }

      i {
        font-size: 20px;
      }
    }

    .right {
      display: inline;
      float: right;
      text-align: center;
    }
  }
}
</style>