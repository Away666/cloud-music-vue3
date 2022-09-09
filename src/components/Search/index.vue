<script setup lang='ts'>
import { onMounted, reactive, ref } from 'vue';
import useCurrentInstance from "@/utils/useCurrentInstance";
import { Search } from '@element-plus/icons-vue'
import { getSearchList } from '@/api/search'
import router from '@/router';
import { ElMessage } from 'element-plus';
import { useStore } from 'vuex';
import { getMusics } from '@/api/songlistDetail';

const store = useStore()

// 定义一个热门搜索的接口
interface RootObject {
  isSearchPopShow: boolean;
  searchInput: string;
  hotSearchList: any[];
  keywordSearchList: KeywordSearchList;
}

interface KeywordSearchList {
  songs: any[];
  albums: any[];
  artists: any[];
  playlists: any[];
}

const data: RootObject = reactive({
  isSearchPopShow: false,
  searchInput: '',
  hotSearchList: [],
  keywordSearchList: {
    songs: [],
    albums: [],
    artists: [],
    playlists: []
  },
})

const { proxy } = useCurrentInstance();

// 根据输入的内容获取相应的数据
const inputSearch = (value: any) => {
  getSearchList(value).then((res) => {
    if (res.data.code == 200) {
      data.keywordSearchList = res.data.result
    }
  })
}
// input 获得焦点
const focusHandle = () => {
  data.isSearchPopShow = true
  data.keywordSearchList = { albums: [], songs: [], artists: [], playlists: [] }
  inputSearch(data.searchInput)
}

// 点击热门搜索的item
const clickHotSearchItem = (item: any) => {
  data.searchInput = item.searchWord
  router.push({ name: 'searchdetail', params: { keyWord: item.searchWord } })
}

// 点击单曲
const clickSuggestSong = (item: any) => {
  let id = item.id
  getMusics(id).then((res) => {
    if (res.data.code === 200) {
      let arr = res.data.songs
      // 不能对一个歌单重复加入到歌单列表
      let currentIndex = -1
      let a = store.state.songList.allSongListId.indexOf(id)
      if (id != store.state.songList.musicId && a == -1) {
        store.dispatch('songList/addToSongList', { songList: arr, songListId: id })
        store.state.songList.songList.forEach((item: any, i: number) => {
          if (item.id == store.state.songList.musicId)
            currentIndex = i
        })
        store.dispatch('songList/updatePlayState', true)
        store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex + 1].id)
      }
      // 如果当前播放的歌单有你搜索的那首歌，那就需要找出那首歌在播放列表的位置
      else if (id != store.state.songList.musicId && a != -1) {
        store.state.songList.songList.forEach((item: any, i: number) => {
          if (item.id == id)
            currentIndex = i
        })
        store.dispatch('songList/updatePlayState', true)
        store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex].id)
      }
    }
  })

}

// 点击歌手
const clickSuggestSinger = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

// 点击专辑
const clickSuggestAlbum = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}

// 点击歌单
const clickSuggestMusicList = (id: any) => {
  router.push({ name: 'songlistdetail', params: { id } })
}

onMounted(() => {
  // 获取热门搜索的列表
  proxy.$http('/search/hot/detail').then((res: any) => {
    if (res.data.code == 200) {
      data.hotSearchList = res.data.data
    }
  })
})


</script>
<template>
  <div>
    <el-popover placement="bottom" width="300" popper-class="searchPop" :hide-after="0" trigger="click"
      :visible="data.isSearchPopShow">
      <template #reference>
        <el-input v-model="data.searchInput" placeholder="搜索" :prefix-icon="Search" size="small" @input="inputSearch"
          @blur="data.isSearchPopShow = false" @focus="focusHandle" class="searchInput"></el-input>
      </template>
      <!-- 搜索历史不想做了，做的话可以将搜索历史存到localstorage中 -->
      <!-- 热搜榜 -->
      <div class="hotSearch" v-if="data.hotSearchList && !data.searchInput && data.keywordSearchList.songs">
        <div class="hotSearchTitle">热搜榜</div>
        <div class="hotSearchItem" v-for="(item, index) in data.hotSearchList" :key="index"
          @click="clickHotSearchItem(item)">
          <div class="hotSearchIndex" :class="index < 3 ? 'topThree' : ''">
            {{ index + 1 }}
          </div>
          <div class="hotSearchInfo">
            <div class="hotSearchWord" :class="index < 3 ? 'hotSearchWordTopThree' : ''">
              {{ item.searchWord }}
            </div>
            <div class="hotSearchContent">{{ item.content }}</div>
          </div>
        </div>
      </div>
      <!-- 搜索列表 -->
      <div class="searchSuggest" v-else>
        <div class="hotSearchTitle" v-if="data.keywordSearchList.songs && data.keywordSearchList.songs.length != 0">
          搜索建议
        </div>
        <!-- 单曲 -->
        <div class="searchSuggestItem" v-if="
          data.keywordSearchList.songs && data.keywordSearchList.songs.length != 0
        ">
          <div class="searchSuggestItemTitle">
            <i class="iconfont icon-yinle"></i> 单曲
          </div>
          <div class="suggestItemDetail" v-for="(item, index) in data.keywordSearchList.songs" :key="index"
            @click="clickSuggestSong(item)">
            {{ item.name + " - " + item.artists[0].name }}
          </div>
        </div>
        <!-- 歌手 -->
        <div class="searchSuggestItem" v-if="
          data.keywordSearchList.artists &&
          data.keywordSearchList.artists.length != 0
        ">
          <div class="searchSuggestItemTitle">
            <i class="iconfont icon-mic"></i> 歌手
          </div>
          <div class="suggestItemDetail" v-for="(item, index) in data.keywordSearchList.artists" :key="index"
            @click="clickSuggestSinger(item.id)">
            {{ item.name }}
          </div>
        </div>
        <!-- 专辑 -->
        <div class="searchSuggestItem" v-if="
          data.keywordSearchList.albums && data.keywordSearchList.albums.length != 0
        ">
          <div class="searchSuggestItemTitle">
            <i class="iconfont icon-more"></i> 专辑
          </div>
          <div class="suggestItemDetail" v-for="(item, index) in data.keywordSearchList.albums" :key="index"
            @click="clickSuggestAlbum(item.id)">
            {{ item.name + " - " + item.artist.name }}
          </div>
        </div>
        <!-- 歌单 -->
        <div class="searchSuggestItem" v-if="
          data.keywordSearchList.playlists &&
          data.keywordSearchList.playlists.length != 0
        ">
          <div class="searchSuggestItemTitle">
            <i class="iconfont icon-gedan"></i> 歌单
          </div>
          <div class="suggestItemDetail" v-for="(item, index) in data.keywordSearchList.playlists" :key="index"
            @click="clickSuggestMusicList(item.id)">
            {{ item.name }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>
<style lang="less">
.el-popper__arrow {
  position: unset !important;
}

.el-input--small {
  width: 160px;
  border-radius: 50px;
  color: white;

  .el-input__wrapper {
    height: 30px;
    background-color: #e13e3e;
    border-radius: 50px;
    box-shadow: none;
    font-size: 14px;

    .el-input__prefix {
      color: white;
    }

    .el-input__inner {
      color: white;

      &::placeholder {
        color: white;
      }
    }
  }
}

.searchPop {
  margin-top: -10px !important;
  height: 400px;
  overflow: auto;
  padding: 5px 10px !important;
}

.searchPop::-webkit-scrollbar {
  display: none;
}

.el-popper.is-light {
  width: 300px;
  border: unset;
}

.hotSearchTitle {
  font-size: 14px;
  margin: 10px 0 5px 20px;
}

.hotSearchItem:hover {
  background-color: #f2f2f2;
}


.hotSearchItem {
  // display: flex;
  // align-items: center;
  padding: 6.5px 15px;
  cursor: pointer;
  vertical-align: middle;
  position: relative;
}

.hotSearchIndex {
  color: #aaa;
  width: 20px;
  display: inline-block;
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  text-align: center;
}

.hotSearchInfo {
  display: inline-block;
  margin-left: 30px;
  width: 230px;
}

.topThree {
  color: #e13e3e;
}

.hotSearchWord {
  font-size: 14px;
  color: rgb(51, 51, 51);
}

.hotSearchWordTopThree {
  font-weight: 600;
  color: black;
}

.hotSearchContent {
  font-size: 12px;
  // transform: scale(0.9) translateX(-5%);
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap; //溢出不换行
}

.searchSuggest {
  font-size: 12px;
}

.searchSuggestItemTitle {
  background-color: #f5f5f7;
  padding: 4px 8px;
  font-size: 15px;
}



.searchSuggestItem {
  cursor: pointer;
}

.suggestItemDetail {
  padding: 4px 27px;
  font-size: 14px;
}

.suggestItemDetail:hover {
  background-color: #f2f2f2;
}
</style>