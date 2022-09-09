<script setup lang='ts'>
import SongListCategory from '@/components/SongListCategory/index.vue'
import { nextTick, onMounted, reactive, watch } from 'vue';
import { getVideoAllTag, getVideoHotTag, getVideoAllData, getVideoTagData } from '@/api/video'
import CategoryHasWidth from '@/components/CategoryHasWidth/index.vue';
import VideoListCard from '@/components/VideoListCard/index.vue';
import GoTop from '@/components/GoTop/index.vue';
import router from '@/router';

interface RootObject {
  currentTag: CurrentTag;
  allTag: any[];
  hotTag: any[];
  videoList: any[];
  isMore: boolean;
  currentPage: number;
  activeIndex: number;
}

interface CurrentTag {
  name: string;
  id: string;
}
const data: RootObject = reactive({
  currentTag: { name: '全部视频', id: '' },
  allTag: [],
  hotTag: [],
  videoList: [],
  isMore: true,
  currentPage: 1,
  activeIndex: -1,
})

// 获取全部视频标签数据
const getVideoAllTagHnadle = () => {
  getVideoAllTag().then((res) => {
    if (res.data.code == 200) {
      data.allTag = res.data.data
    }
  })
}

// 获取热门视频标签数据
const getVideoHotTagHandle = () => {
  getVideoHotTag().then((res) => {
    if (res.data.code == 200) {
      data.hotTag = res.data.data
    }
  })
}

// 获取全部视频数据
const getVideoAllDataHandle = () => {
  getVideoTagDataHandle(data.allTag[0].id)
}

const getVideoTagDataHandle = async (id: any) => {
  let timestamp = Date.parse(new Date().toString());
  if (data.isMore) {
    await getVideoTagData(id, (data.currentPage - 1) * 8, timestamp).then((res) => {
      if (res.data.hasmore) {
        data.isMore = res.data.hasmore
        data.currentPage = data.currentPage + 1
        data.videoList.push(...res.data.datas)
      }
    })
  }
  await nextTick(() => {
    if (data.isMore) {
      getVideoTagData(id, (data.currentPage - 1) * 8, timestamp).then((res) => {
        if (res.data.hasmore) {
          data.isMore = res.data.hasmore
          data.currentPage = data.currentPage + 1
          data.videoList.push(...res.data.datas)
        }
      })
    }
  })
}

// 点击左边标签
const clickLeftSongListTag = (info: any) => {
  data.videoList = []
  data.isMore = true
  data.currentTag = info
  data.activeIndex = data.hotTag.findIndex((item: any) => {
    return item.name == info.name
  })
  data.currentPage = 1
  getVideoTagDataHandle(info.id)
}

// 点击右边标签item
const clickSongListTag = (info: any) => {
  data.videoList = []
  data.isMore = true
  data.activeIndex = info.index
  data.currentTag = info.item
  data.currentPage = 1
  getVideoTagDataHandle(info.item.id)
}

const bottomLoad = () => {
  if (data.currentTag.id) {
    data.currentPage = data.currentPage + 1
    getVideoTagDataHandle(data.currentTag.id)
  } else {
    data.currentPage = data.currentPage + 1
    getVideoTagDataHandle(data.allTag[0].id)
  }
}

const goToVideoDetail = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: "video" }, })
}
onMounted(() => {
  getVideoAllTagHnadle()
  getVideoHotTagHandle()
})
watch(() => data.allTag[0], (current, last) => {
  getVideoTagDataHandle(data.allTag[0].id)
})
</script>
<template>
  <div class="videoContainer scroll">
    <div class="nav">
      <div class="left">
        <SongListCategory :allTag="data.allTag" :currentTag="data.currentTag" @clickSongListTag="clickLeftSongListTag">
        </SongListCategory>
      </div>
      <div class="right">
        <CategoryHasWidth :hotTag="data.hotTag" @clickSongListTag="clickSongListTag" :activeIndex="data.activeIndex">
        </CategoryHasWidth>
      </div>
    </div>
    <VideoListCard :videoList="data.videoList" :isLoad="!data.isMore" :videoType="'video'"
      @clickListCardItem="goToVideoDetail" @bottomLoad="bottomLoad"></VideoListCard>
    <GoTop :scrollObj="'.videoContainer'"></GoTop>
  </div>
</template>
<style lang="less" scoped>
.videoContainer {
  height: calc(100vh - 165px);

  .nav {
    margin-top: 20px;
    padding: 0 30px;

    .left {
      display: inline-block;
    }

    .right {
      display: inline;
      float: right;
      text-align: center;
    }
  }
}
</style>