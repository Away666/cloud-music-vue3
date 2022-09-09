<script setup lang='ts'>
import { computed, onMounted, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue'
import { getVideoData } from '@/api/collected';
import VideoListCard from '@/components/VideoListCard/index.vue';
import router from '@/router';
interface RootObject {
  total: number;
  currentPage: number;
  keyWord: string;
  videoList: any[];
  list: any[];
  isMore: boolean;
}
const data: RootObject = reactive({
  total: 0,
  keyWord: '',
  videoList: [],
  currentPage: 1,
  isMore: false,
  list: computed(() => {
    return data.videoList.filter((item: any, index: number) => {
      return item.title.search(data.keyWord) != -1
    })
  })
})

const getVideoDataHandle = () => {
  let timestamp = Date.parse(new Date().toString())
  getVideoData(50, (data.currentPage - 1) * 50, timestamp).then((res) => {
    if (res.data.code == 200) {
      data.videoList = res.data.data
      data.total = res.data.count
      data.isMore = res.data.hasMore
    }
  })
}

const goToVideoDetail = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: item.type == 1 ? "video" : "mv" } })
}

const bottomLoad = () => {
  data.currentPage += 1
  getVideoDataHandle()
}
onMounted(() => {
  getVideoDataHandle()
})
</script>
<template>
  <div class="albumContainer">
    <div class="head">
      收藏的视频<span>({{ data.total }})</span>
      <el-input v-model="data.keyWord" class="w-50 m-2" size="small" placeholder="搜索我收藏的视频"
        :suffix-icon="data.keyWord == '' ? Search : ''" clearable />
    </div>
    <VideoListCard :videoList="data.list" :isLoad="!data.isMore" :videoType="'video'"
      @clickListCardItem="goToVideoDetail" @bottomLoad="bottomLoad"></VideoListCard>
    <div v-if="data.list.length == 0 && data.keyWord != ''" class="no-data">
      <span>未能找到与<a class="keyword">"{{ data.keyWord }}"</a>相关的任何视频</span>
    </div>
  </div>
</template>
<style lang="less" scoped>
.albumContainer {
  .head {
    margin: 20px 0;
    margin-left: 30px;
    position: relative;
    height: 33px;
    line-height: 33px;
  }

  .no-data {
    height: 100px;
    width: 100%;
    text-align: center;
    position: relative;

    span {
      position: absolute;
      top: 50%;
      transform: translate(-50%, 0);

      .keyword {
        color: rgb(80, 125, 175);
      }
    }
  }
}
</style>