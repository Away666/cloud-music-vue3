<script setup lang='ts'>
import { onMounted, reactive } from 'vue'
import { getAllMvData } from '@/api/video'
import CategoryHasWidth from '@/components/CategoryHasWidth/index.vue'
import MvListCard from '@/components/mvListCard/index.vue';
import GoTop from '@/components/GoTop/index.vue';
import { useRouter } from 'vue-router';
const router = useRouter()
interface RootObject {
  areaList: AreaList[];
  typeList: AreaList[];
  orderList: AreaList[];
  area: string;
  type: string;
  order: string;
  allMvList: any[];
  areaActiveIndex: number;
  typeActiveIndex: number;
  orderActiveIndex: number;
  currentPage: number;
  limit: number;
  isMore: boolean;
}

interface AreaList {
  name: string;
  path: string;
}
const data:RootObject = reactive({
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
  allMvList: [],
  areaActiveIndex: 0,
  typeActiveIndex: 0,
  orderActiveIndex: 0,
  currentPage: 10,
  limit: 96,
  isMore: true,
})

const getAllMvDataHandle = () => {
  const { area, type, order, limit, currentPage } = data
  getAllMvData(area, type, order, limit, (currentPage - 1) * limit).then((res: any) => {
    if (res.data.code == 200) {
      data.allMvList.push(...res.data.data)
      data.isMore = res.data.hasMore
    }
  })
}

const areaItem = (item: any) => {
  data.allMvList = []
  data.currentPage = 1
  data.areaActiveIndex = item.index
  data.area = item.item.path
  getAllMvDataHandle()
}

const typeItem = (item: any) => {
  data.allMvList = []
  data.currentPage = 1
  data.typeActiveIndex = item.index
  data.type = item.item.path
  getAllMvDataHandle()
}

const orderItem = (item: any) => {
  data.allMvList = []
  data.currentPage = 1
  data.orderActiveIndex = item.index
  data.order = item.item.path
  getAllMvDataHandle()
}

const goToVideoDetail = (item: any) => {
  router.push({ name: 'videodetail', params: { id: item.id, type: "mv" }, })
}

const loadBottom = () => {
  data.currentPage += 1
  getAllMvDataHandle()
}

const currentChange = (page: any) => {
  data.currentPage = page
  getAllMvDataHandle()
  console.log(data.currentPage);
}

onMounted(() => {
  getAllMvDataHandle()
})
</script>
<template>
  <div class="allMvContainer scroll">
    <h2>全部MV</h2>
    <div class="selectors">
      <div class="selectorItem">
        <span class="title">地区：</span>
        <span>
          <CategoryHasWidth :hotTag="data.areaList" @clickSongListTag="areaItem" :activeIndex="data.areaActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
      <div class="selectorItem">
        <span class="title">类型：</span>
        <span>
          <CategoryHasWidth :hotTag="data.typeList" @clickSongListTag="typeItem" :activeIndex="data.typeActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
      <div class="selectorItem">
        <span class="title">排序：</span>
        <span>
          <CategoryHasWidth :hotTag="data.orderList" @clickSongListTag="orderItem" :activeIndex="data.orderActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
    </div>
    <div v-if="data.allMvList[0]">
      <MvListCard :videoList="data.allMvList" :isLoad="!data.isMore" @clickListCardItem="goToVideoDetail"
        @loadBottom="loadBottom">
      </MvListCard>
    </div>
    <div v-else>
      <el-empty :image-size="200" />
    </div>
    <GoTop :scrollObj="'.allMvContainer'"></GoTop>
  </div>
</template>
<style lang="less" scoped>
.allMvContainer {
  height: calc(100vh - 120px);
  padding: 0 30px;

  .selectors {
    margin-top: 10px;
  }

  .selectorItem {
    margin-bottom: 10px;
  }

  .title {
    line-height: 29.2px;
    float: left;
    margin-right: 5px;
  }
}
</style>