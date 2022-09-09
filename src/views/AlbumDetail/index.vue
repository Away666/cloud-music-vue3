<script setup lang='ts'>
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import Comment from '@/components/Comment/index.vue';
import GoTop from '@/components/GoTop/index.vue';
import AlbumDetailInfo from '@/components/AlbumDetailInfo/index.vue';
import { getAlbumCommentData, getAlbumInfoData, getAlbumDetailData } from '@/api/albumDetail';
import AlbumTable from '@/components/AlbumTable/index.vue';
import { ElMessage } from 'element-plus';
const route = useRoute()
const store = useStore()

const hotComments = ref(null)

interface RootObject {
  activeName: string;
  currentCommentPage: number;
  commentData: CommentData;
  total: number;
  limit: number;
  isMore: boolean;
  playingIndex: number;
  albumInfo: AlbumInfo;
  albumSongs: any[];
  albumDetailList: any[];
}

interface CommentData {
  total: number;
  hotComments: any[];
  comments: any[];
}

interface AlbumInfo {
  description: string;
  id: string;
}
const data: RootObject = reactive({
  activeName: 'first',
  currentCommentPage: 1,
  commentData: { total: 0, hotComments: [], comments: [] },
  total: 0,
  limit: 50,
  isMore: true,
  playingIndex: -1,
  albumInfo: { id: '', description: '' },
  albumSongs: [],
  albumDetailList: [],
})


// 获取专辑信息
const getAlbumInfoDataHandle = () => {
  getAlbumInfoData(route.params.id).then((res) => {
    if (res.data.code === 200) {
      data.albumInfo = res.data.album
      data.albumSongs = res.data.songs
      data.albumDetailList = data.albumInfo.description.split('\n')
      data.albumDetailList = data.albumDetailList.filter((item) => {
        return item !== ''
      })
    }
  })
}

// 获取专辑的评论信息
const getAlbumCommentDataHandle = () => {
  let timestamp: number = Date.parse(new Date().toString());
  getAlbumCommentData(route.params.id, 50, (data.currentCommentPage - 1) * 50, timestamp).then((res) => {
    data.commentData = res.data
    data.total = res.data.total
  })
}

// 点击全部播放
const playAllHandle = () => {
  let noCopyrightRcmd = false
  let list = data.albumSongs.filter((item: any) => {
    if (item.noCopyrightRcmd) {
      noCopyrightRcmd = true
    }
    return item.dt !== 0 && !item.noCopyrightRcmd
  })
  if (noCopyrightRcmd) {
    ElMessage({
      type: 'error',
      message: '因合作方要求,该歌单部分资源暂时下架＞﹏＜'
    })
  }
  if (list[0]) {
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', list[0].id)
    if (data.albumInfo.id != store.state.songList.songListId) {
      store.dispatch('songList/updateSongList', { songList: list, songListId: data.albumInfo.id })
    }
  }
}

// 添加全部到播放列表
const addToPlayListHandle = () => {
  if (store.state.songList.allSongListId.length == 0) {
    playAllHandle()
  } else {
    // 不能对一个歌单重复加入到歌单列表
    let a = store.state.songList.allSongListId.indexOf(data.albumInfo.id)
    let list = data.albumSongs.filter((item: any) => {
      return item.dt !== 0 && !item.noCopyrightRcmd
    })
    if (data.albumInfo.id != store.state.songList.songListId && a == -1) {
      store.dispatch('songList/addToSongList', { songList: list, songListId: data.albumInfo.id })
    }
  }
}

const dbClickRow = (id: number) => {
  let index = data.albumSongs.findIndex((item, index) => {
    return item.id == id
  })
  data.playingIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  if (data.albumInfo.id != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: data.albumSongs, songListId: data.albumInfo.id })
  }
}

const clickTab = (tag: any, e: any) => {
  data.activeName = tag.props.name
  if (data.activeName === 'second') {
    getAlbumCommentDataHandle()
  }
}

// 当热门评论和最新评论都存在的时候，input输入框是热门评论的，现在通过ref调用热门评论的方法
const transToHotComment = (info: any) => {
  (hotComments as any).value.floorComment(info.id, info.nickname);
}

// 点击回复跳到评论输入框
const scrollToComment = () => {
  let container: any = document.querySelector(".scroll");
  let info: any = document.querySelector(".info");
  container.scrollTo({
    behavior: "smooth",
    top: info.clientHeight + 30,
  });
}

const currentChange = (newPage: any) => {
  data.currentCommentPage = newPage
  getAlbumCommentDataHandle()
  scrollToComment()
}

onMounted(() => {
  getAlbumInfoDataHandle()
  getAlbumCommentDataHandle()
})

watch(() => store.state.songList.musicId, (current, last) => {
  data.playingIndex = data.albumSongs.findIndex(
    (item: any) => item.id == current
  );
})

</script>
<template>
  <div class="SongListContainer scroll">
    <AlbumDetailInfo :albumDetailInfo="data.albumInfo" @playAllHandle="playAllHandle"
      @addToPlayListHandle="addToPlayListHandle"></AlbumDetailInfo>
    <div class="songlist-content" v-show="data.commentData.total >= 0">
      <el-tabs v-model="data.activeName" @tab-click="clickTab">
        <el-tab-pane label="歌曲列表" name="first">
          <AlbumTable :songs="data.albumSongs" @dbClickRow="dbClickRow" :playingIndex="data.playingIndex"></AlbumTable>
        </el-tab-pane>
        <el-tab-pane :label="'评论(' + data.commentData.total + ')'" name="second">
          <!-- 热门评论 -->
          <Comment :comments="data.commentData.hotComments" :commentType="'3'" :commentId="data.albumInfo.id + ''"
            :isHotComment="data.commentData.hotComments ? true : false" @scrollToComment="scrollToComment"
            @getSongListCommentHandle="getAlbumCommentDataHandle" ref="hotComments">
            <template #title v-if="data.commentData.hotComments">
              <div>热门评论</div>
            </template>
          </Comment>
          <!-- 最新评论 -->
          <Comment :comments="data.commentData.comments" :commentType="'3'" style="padding: 30px;"
            :commentId="data.albumInfo.id + ''" :isHotComment="data.commentData.hotComments ? false : true"
            @scrollToComment="scrollToComment" @transToHotComment="transToHotComment"
            @getSongListCommentHandle="getAlbumCommentDataHandle">
            <template #title>
              <div>最新评论({{ data.commentData.total }})</div>
            </template>
          </Comment>
          <!-- 分页 -->
          <div class="page" v-if="data.commentData.comments">
            <el-pagination background layout="prev, pager, next" :total="data.total" :page-size="50"
              :current-page="data.currentCommentPage" @current-change="currentChange" :hide-on-single-page="true">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="专辑详情" name="third">
          <div class="album-detail">
            <h4>专辑介绍</h4>
            <p v-for="(item, index) in data.albumDetailList" :key="index">{{ item }}</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <GoTop :scrollObj="'.SongListContainer'"></GoTop>
</template>
<style lang="less" scoped>
.SongListContainer {
  height: calc(100vh - 120px);
  padding: 10px 0;
}

.album-detail {
  padding: 20px 30px;
  -o-user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
  -ms-user-select: text;
  -khtml-user-select: text;
  user-select: text;

  h4 {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    opacity: 0.8;
  }

  p {
    text-indent: 2em;
    line-height: 30px;
    color: #8d8d8d;
    font-size: 14px;
  }
}
</style>