<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import CategoryHasWidth from '@/components/CategoryHasWidth/index.vue'
import VideoListCard from '@/components/VideoListCard/index.vue'
import { getNewestMvData, getExclusiveMvData, getRankMvData } from '@/api/video'
import MvRank from '@/components/MvRank/index.vue';
import { useRouter } from 'vue-router';
const router = useRouter()
const data = reactive({
  areaList: [
    { name: "全部", path: "" },
    { name: "内地", path: "内地" },
    { name: "港台", path: "港台" },
    { name: "欧美", path: "欧美" },
    { name: "日本", path: "日本" },
    { name: "韩国", path: "韩国" },
  ],
  // mv 类型
  typeList: [
    { name: "全部", path: "" },
    { name: "官方版", path: "官方版" },
    { name: "原生", path: "原生" },
    { name: "现场版", path: "现场版" },
    { name: "网易出品", path: "网易出品" },
  ],
  // 排序
  orderList: [
    { name: "上升最快", path: "" },
    { name: "最热", path: "最热" },
    { name: "最新", path: "最新" },
  ],
  // 当前地区
  area: "",
  // 当前类型
  type: "",
  // 当前排序
  order: "",
  // 最新Mv
  newstMv: [],
  // 网易出品Mv
  officialMv: [],
  // Mv排行榜数据
  mvRankList: [],
  // Mv排行榜当前地区
  mvArea: "",
  activeIndex: 0,
  rankIndex: 0,
})

const getNewestMvDataHandle = (area?: any) => {
  getNewestMvData(area).then((res) => {
    if (res.data.code == 200) {
      data.newstMv = res.data.data
    }
  })
}

const getExclusiveMvDataHandle = () => {
  getExclusiveMvData().then((res) => {
    if (res.data.code == 200) {
      data.officialMv = res.data.data
    }
  })
}

const getRankMvDataHandle = (area?: any) => {
  getRankMvData(10, area).then((res: any) => {
    if (res.data.code == 200) {
      data.mvRankList = res.data.data
    }
  })
}

const clickSongListTag = (info: any) => {
  // data.newstMv = []
  getNewestMvDataHandle(info.item.path)
  data.activeIndex = info.index
}

const clickMvRankTag = (info: any) => {
  // data.mvRankList = []
  getRankMvDataHandle(info.item.path)
  data.rankIndex = info.index
}

const goToVideoDetail = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: "mv" }, })
}

const toAllMvHandle = () => {
  router.push({ name: 'allmvlist' })
}

const toAllMvRankHandle = () => {
  router.push({ name: 'allmvrank' })
}
onMounted(() => {
  getNewestMvDataHandle()
  getExclusiveMvDataHandle()
  getRankMvDataHandle()
})
</script>
<template>
  <div class="mv-container">
    <div class="nav">
      <div class="left">
        <h3 class="mvTitle" @click="toAllMvHandle">
          最新MV<i class="iconfont icon-arrow-right-bold"></i>
        </h3>
      </div>
      <div class="right">
        <CategoryHasWidth :hotTag="data.areaList" @clickSongListTag="clickSongListTag" :activeIndex="data.activeIndex">
        </CategoryHasWidth>
      </div>
    </div>
    <!-- 最新MV -->
    <div>
      <VideoListCard :videoList="data.newstMv" :videoType="'mv'" @clickListCardItem="goToVideoDetail"></VideoListCard>
    </div>
    <div class="nav">
      <div class="left">
        <h3 class="mvTitle" @click="toAllMvHandle">
          网易出品<i class="iconfont icon-arrow-right-bold"></i>
        </h3>
      </div>
    </div>
    <!-- 网易出品 -->
    <div>
      <VideoListCard :videoList="data.officialMv" :videoType="'mv'" @clickListCardItem="goToVideoDetail">
      </VideoListCard>
    </div>
    <div class="nav">
      <div class="left">
        <h3 class="mvTitle" @click="toAllMvRankHandle">
          MV排行榜<i class="iconfont icon-arrow-right-bold"></i>
        </h3>
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
.mv-container {
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

.mv-rank {
  padding: 0 30px;
}
</style>