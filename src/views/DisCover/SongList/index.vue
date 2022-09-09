<script setup lang='ts'>
import { getSongListInfo, getSongListCategory, getHotSongListCategory, getSongList } from '@/api/discover';
import { onMounted, reactive } from 'vue';
import SongListCategory from '../../../components/SongListCategory/index.vue';
import HotSongListCategory from '@/components/HotSongListCategory/index.vue';
import ListCard5 from '../../../components/ListCard5/index.vue'
import { useRouter } from 'vue-router';
const router = useRouter()

interface RootObject {
  currentTag: CurrentTag;
  songListInfo: CurrentTag;
  allTag: any[];
  hotTag: any[];
  songList: any[];
  currentPage: number;
  total: number;
  limit: number;
}

interface CurrentTag {
  [x: string]: any;
}

const data: RootObject = reactive({
  currentTag: {},
  songListInfo: {},
  allTag: [],
  hotTag: [],
  songList: [],
  currentPage: 1,
  total: 0,
  limit: 50,
})

// 获取精品歌单信息
const getSongListInfoHandle = (tag?: any) => {
  getSongListInfo(tag).then((res) => {
    if (res.data.code == 200) {
      data.songListInfo = res.data.playlists[0]
    }
  })
}

// 获取所有歌单分类
const getSongListCategoryHandle = () => {
  getSongListCategory().then((res) => {
    if (res.data.code == 200) {
      data.allTag = res.data.sub;
      data.currentTag = res.data.all;
      getSongListHandle()
    }

  })
}

// 获取热门歌单分类
const getHotSongListCategoryHandle = () => {
  getHotSongListCategory().then((res) => {
    if (res.data.code == 200) {
      data.hotTag = res.data.tags
    }
  })
}


const clickSongListTag = (item: any) => {
  data.currentPage = 1
  data.currentTag = item
  getSongListInfoHandle(item.name)
  getSongListHandle()
}

const getSongListHandle = () => {
  data.songList = []
  getSongList(data.currentTag.name, data.limit * (data.currentPage - 1)).then((res) => {
    if (res.data.code == 200) {
      data.songList = res.data.playlists
      data.total = res.data.total
    }
  })
}

// 点击item
const clickListCardItem = (id: any) => {
  router.push({ name: "songlistdetail", params: { id } });
}

const currentChange = (newPage: any) => {
  data.currentPage = newPage
  getSongListHandle()
}

onMounted(() => {
  getSongListInfoHandle()
  getSongListCategoryHandle()
  getHotSongListCategoryHandle()
  getSongListHandle()
})
</script>
<template>
  <div class="container">
    <!-- 歌单信息展示 -->
    <div class="SongListInfo" v-if="data.songListInfo.length != 0">
      <img v-lazy="data.songListInfo.coverImgUrl" alt="" class="backgroundImg" />
      <div class="cover">
        <img v-lazy="data.songListInfo.coverImgUrl" alt="" />
      </div>
      <div class="EntryInfo">
        <div class="tag"><i class="iconfont icon-good"></i> 精品歌单</div>
        <div class="name">{{ data.songListInfo.name }}</div>
        <div class="desc">{{ data.songListInfo.copywriter }}</div>
      </div>
    </div>
    <!-- 切换歌单分类 -->
    <div class="nav">
      <div class="left">
        <SongListCategory :allTag="data.allTag" :currentTag="data.currentTag" @clickSongListTag="clickSongListTag">
        </SongListCategory>
      </div>
      <div class="right">
        <HotSongListCategory :hotTag="data.hotTag" :currentTag="data.currentTag" @clickSongListTag="clickSongListTag">
        </HotSongListCategory>
      </div>
    </div>
    <!-- 展示对应歌单分类的数据 -->
    <div class="SongListContent" v-if="data.songList[0]">
      <ListCard5 :list="data.songList" @clickListCardItem="clickListCardItem"></ListCard5>
    </div>
    <div class="SongListContent" v-else>
      <el-empty :image-size="200" />
    </div>
    <!-- 分页 -->
    <div class="page" v-if="data.songList[0]">
      <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="50"
        :current-page="data.currentPage" @current-change="currentChange" :hide-on-single-page="true">
      </el-pagination>
    </div>
  </div>
</template>
<style lang="less" scoped>
.container {}

.SongListInfo {
  width: 100%;
  position: relative;
  height: 170px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  cursor: pointer;
}

.backgroundImg {
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  width: 100%;
  transform: translateY(-40%);
  filter: blur(50px) brightness(70%);
}

.cover {
  width: 150px;
  height: 150px;
  margin: 10px;
}

.cover img {
  border-radius: 10px;
  width: 100%;
}

.tag {
  color: #d59e54;
  border: 1px solid #d59e54;
  padding: 8px;
  width: 96px;
  font-size: 14px;
  margin: 25px 10px 22px;
  border-radius: 15px;
  text-align: center;
}

.tag i {
  font-size: 14px;
}

.name {
  color: white;
  font-size: 14px;
  margin: 10px 0;
}

.desc {
  color: rgba(255, 255, 255, 0.5);
  /* 字体直接写小于12没有效果 */
  font-size: 13px;
  margin-top: 10px;
}

.nav {
  margin: 15px 0px;

  .left {
    display: inline-block;
  }

  .right {
    display: inline;
    float: right;
    text-align: center;
  }
}
</style>