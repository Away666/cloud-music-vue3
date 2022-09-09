<script setup lang='ts'>
import { computed, onMounted, reactive } from 'vue';
import { Search } from '@element-plus/icons-vue'
import { getSingerData } from '@/api/collected';
import ListCard1 from '@/components/ListCard1/index.vue';
interface RootObject {
  total: number;
  keyWord: string;
  singerList: any[];
  list: any[];
}
const data: RootObject = reactive({
  total: 0,
  keyWord: '',
  singerList: [],
  list: computed(() => {
    return data.singerList.filter((item: any, index: number) => {
      return item.name.search(data.keyWord) != -1
    })
  })
})

const getSingerDataHandle = () => {
  let timestamp = Date.parse(new Date().toString())
  getSingerData(timestamp).then((res) => {
    if (res.data.code == 200) {
      data.singerList = res.data.data
      data.total = res.data.count
    }
  })
}
onMounted(() => {
  getSingerDataHandle()
})
</script>
<template>
  <div class="albumContainer">
    <div class="head">
      收藏的歌手<span>({{ data.total }})</span>
      <el-input v-model="data.keyWord" class="w-50 m-2" size="small" placeholder="搜索我收藏的歌手"
        :suffix-icon="data.keyWord == '' ? Search : ''" clearable />
    </div>
    <ListCard1 :listData="data.list" :type="'singer'"></ListCard1>
    <div v-if="data.list.length == 0 && data.keyWord != ''" class="no-data">
      <span>未能找到与<a class="keyword">"{{ data.keyWord }}"</a>相关的任何歌手</span>
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