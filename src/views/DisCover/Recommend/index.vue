<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import { getBannerList, getRecommendList, getExclusiveList, getNewestMusicList } from '@/api/discover'
import ListCard5 from '../../../components/ListCard5/index.vue'
import NewestMusic from '@/components/NewestMusic/index.vue';
import { useRouter } from 'vue-router';
const router = useRouter()

interface RootObject {
  bannerList: any[];
  recommendList: any[];
  exclusiveList: any[];
  newestMusicList: any[];
}
const data: RootObject = reactive({
  bannerList: [],
  recommendList: [],
  exclusiveList: [],
  newestMusicList: []
})

// 轮播图
const getBannerData = () => {
  getBannerList().then((res) => {
    if (res.data.code == 200) {
      data.bannerList = res.data.banners
    }
  })
}

// 推荐歌单
const getRecommendData = () => {
  getRecommendList(10).then((res) => {
    if (res.data.code == 200) {
      data.recommendList = res.data.result
    }
  })
}

// 独家放送
const getExclusiveData = () => {
  getExclusiveList(3).then((res) => {
    if (res.data.code == 200) {
      data.exclusiveList = res.data.result
    }
  })
}

// 最新音乐
const getNewestMusicData = () => {
  getNewestMusicList().then((res) => {
    if (res.data.code == 200) {
      data.newestMusicList = res.data.data.slice(0, 12)
    }
  })
}

// 点击item
const clickListCardItem = (id: any) => {
  router.push({ name: "songlistdetail", params: { id } });
}

onMounted(() => {
  getBannerData()
  getRecommendData()
  getExclusiveData()
  getNewestMusicData()
})
</script>
<template>
  <div class="recommend">
    <el-carousel :interval="4000" type="card" height="200px" :initial-index="0" v-if="data.bannerList.length != 0">
      <el-carousel-item v-for="(item, index) in data.bannerList" :key="index">
        <img :src="item.imageUrl" alt="" />
      </el-carousel-item>
    </el-carousel>
    <div>
      <div>
        <h3>推荐歌单<i class="iconfont icon-arrow-right-bold"></i></h3>
        <ListCard5 :list="data.recommendList" @clickListCardItem="clickListCardItem"></ListCard5>
      </div>
      <div>
        <h3>独家放送<i class="iconfont icon-arrow-right-bold"></i></h3>
        <ListCard5 :list="data.exclusiveList" @clickListCardItem="clickListCardItem" :type="'exclusive'"></ListCard5>
      </div>
      <div>
        <h3>最新音乐<i class="iconfont icon-arrow-right-bold"></i></h3>
        <NewestMusic :list="data.newestMusicList"></NewestMusic>
      </div>
    </div>
  </div>
</template>
<style lang="less">
.el-carousel__item {
  border-radius: 10px;
}

.el-carousel__item img {
  height: 100%;
  width: 100%;
}
</style>