<script setup lang='ts'>
import { onMounted, reactive, toRefs } from 'vue';
import { getSingerList } from '@/api/discover'
import ListCard5 from '@/components/ListCard5/index.vue';
import GoTop from '@/components/GoTop/index.vue';
import CategoryHasWidth from '@/components/CategoryHasWidth/index.vue';
import router from '@/router';

interface RootObject {
  languageSort: LanguageSort[];
  typeSort: TypeSort[];
  initialSort: InitialSort[];
  area: number;
  type: number;
  initial: number;
  currentPage: number;
  singerList: any[];
  isMore: boolean;
  areaActiveIndex: number;
  typeActiveIndex: number;
  initActiveIndex: number;
}

interface InitialSort {
  initial: number | string;
  name: string;
}

interface TypeSort {
  type: number;
  name: string;
}

interface LanguageSort {
  area: number;
  name: string;
}

const data: RootObject = reactive({
  languageSort: [
    { area: -1, name: "全部" },
    { area: 7, name: "华语" },
    { area: 96, name: "欧美" },
    { area: 8, name: "日本" },
    { area: 16, name: "韩国" },
    { area: 0, name: "其它" },
  ],
  typeSort: [
    { type: -1, name: "全部" },
    { type: 1, name: "男歌手" },
    { type: 2, name: "女歌手" },
    { type: 3, name: "乐队" },
  ],
  initialSort: [
    { initial: -1, name: "热门" },
    { initial: "a", name: "A" },
    { initial: "b", name: "B" },
    { initial: "c", name: "C" },
    { initial: "d", name: "D" },
    { initial: "e", name: "E" },
    { initial: "f", name: "F" },
    { initial: "g", name: "G" },
    { initial: "h", name: "H" },
    { initial: "i", name: "I" },
    { initial: "j", name: "J" },
    { initial: "k", name: "K" },
    { initial: "l", name: "L" },
    { initial: "m", name: "M" },
    { initial: "n", name: "N" },
    { initial: "o", name: "O" },
    { initial: "p", name: "P" },
    { initial: "q", name: "Q" },
    { initial: "r", name: "R" },
    { initial: "s", name: "S" },
    { initial: "t", name: "T" },
    { initial: "u", name: "U" },
    { initial: "v", name: "V" },
    { initial: "w", name: "W" },
    { initial: "x", name: "X" },
    { initial: "y", name: "Y" },
    { initial: "z", name: "Z" },
    { initial: 0, name: "#" },
  ],
  area: -1,
  type: -1,
  initial: -1,
  // 当前所在页数
  currentPage: 1,
  singerList: [],
  // 是否还有更多数据
  isMore: false,
  areaActiveIndex: 0,
  typeActiveIndex: 0,
  initActiveIndex: 0,
})

const getSingerListHandle = () => {
  const { area, type, initial, currentPage } = data
  let offset = (currentPage - 1) * 30
  getSingerList(area, type, initial, offset).then((res) => {
    if (res.data.code == 200) {
      data.singerList.push(...res.data.artists);
      data.isMore = res.data.more;
    }

  })
}

const areaItem = (item: any) => {
  data.singerList = []
  data.currentPage = 1
  data.area = item.item.area
  data.areaActiveIndex = item.index
  getSingerListHandle()
}
const typeItem = (item: any) => {
  data.singerList = []
  data.currentPage = 1
  data.type = item.item.type
  data.typeActiveIndex = item.index
  getSingerListHandle()
}
const initialItem = (item: any) => {
  data.singerList = []
  data.currentPage = 1
  data.initial = item.item.initial
  data.initActiveIndex = item.index
  getSingerListHandle()
}

const clickListCardItem = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const bottomLoad = () => {
  if (data.isMore) {
    data.currentPage += 1
    getSingerListHandle()
  }

}
onMounted(() => {
  getSingerListHandle()

})
</script>
<template>
  <div class="singer">
    <!-- 歌手分类选择 -->
    <div class="selectors">
      <div class="selectorItem">
        <span class="title">语种：</span>
        <span>
          <CategoryHasWidth :hotTag="data.languageSort" @clickSongListTag="areaItem"
            :activeIndex="data.areaActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
      <div class="selectorItem">
        <span class="title">分类：</span>
        <span>
          <CategoryHasWidth :hotTag="data.typeSort" @clickSongListTag="typeItem" :activeIndex="data.typeActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
      <div class="selectorItem">
        <span class="title">筛选：</span>
        <span>
          <CategoryHasWidth :hotTag="data.initialSort" @clickSongListTag="initialItem"
            :activeIndex="data.initActiveIndex">
          </CategoryHasWidth>
        </span>
      </div>
    </div>
    <div class="listCardContainer">
      <!-- 歌手列表 -->
      <ListCard5 class="listCard" :list="data.singerList" @clickListCardItem="clickListCardItem" :isLoad="!data.isMore"
        @bottomLoad="bottomLoad"></ListCard5>
    </div>
    <GoTop scrollObj=".discover-content"></GoTop>
  </div>
</template>
<style lang="less" scoped>
.singer {
  // width: 85%;
  margin: auto;
}

.selectorItem {
  margin-bottom: 10px;
}

.title {
  line-height: 29.2px;
  float: left;
  margin-right: 5px;
}



.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.listCardContainer {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>