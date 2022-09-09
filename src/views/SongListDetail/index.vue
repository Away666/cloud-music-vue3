<script setup lang='ts'>
import SongListDetailInfo from '@/components/SongListDetailInfo/index.vue';
import { handleMusicTime } from '@/utils';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSongListInfo, getSongListComment, getMusics, getSubscribersApi } from '@/api/songlistDetail'
import { useStore } from 'vuex';
import SongListTable from '../../components/SongListTable/index.vue';
import { Search } from '@element-plus/icons-vue'
import Comment from '@/components/Comment/index.vue';
import GoTop from '@/components/GoTop/index.vue';
import UserCard from '@/components/UserCard/index.vue';
import { ElMessage } from 'element-plus';
const route = useRoute()
const store = useStore()

const hotComments = ref(null)

interface RootObject {
  songListDetailInfo: SongListDetailInfo;
  songs: any[];
  activeName: string;
  keyWord: string;
  currentCommentPage: number;
  commentData: CommentData;
  total: number;
  limit: number;
  currentSubscribersPage: number;
  subscribersData: any[];
  isMore: boolean;
  playingIndex: number;
  list: any[];
}

interface CommentData {
  total: number;
  hotComments: any[];
  comments: any[];
}

interface SongListDetailInfo {
  id: string;
  trackIds: any[];
  trackCount: number;
}

const data: RootObject = reactive({
  songListDetailInfo: { id: '', trackIds: [], trackCount: 0 },
  songs: [],
  activeName: 'first',
  keyWord: '',
  currentCommentPage: 1,
  commentData: { total: 0, hotComments: [], comments: [] },
  total: 0,
  limit: 50,
  currentSubscribersPage: 1,
  subscribersData: [],
  isMore: true,
  playingIndex: -1,
  list: [],
})

// 获取歌单信息
const getSongListInfoHandle = () => {
  let timestamp: number = Date.parse(new Date().toString());
  getSongListInfo(route.params.id, timestamp).then((res) => {
    if (res.data.code == 200) {
      data.songListDetailInfo = res.data.playlist
      let ids = ''
      data.songListDetailInfo.trackIds.forEach((item: any) => {
        ids += item.id + ",";
      })
      ids = ids.substr(0, ids.length - 1);
      getMusics(ids).then((res) => {
        if (res.data.code == 200) {
          data.songs = res.data.songs
          data.list = res.data.songs
          data.playingIndex = data.songs.findIndex(
            (item: any) => item.id == store.state.songList.musicId
          );
        }
      })
    }
  })
}

// 获取歌单的评论信息
const getSongListCommentHandle = () => {
  let timestamp: number = Date.parse(new Date().toString());
  getSongListComment(route.params.id, (data.currentCommentPage - 1) * 50, 50, timestamp).then((res) => {
    data.commentData = res.data
    data.total = res.data.total
  })
}

// 获取收藏者
const getSubscribersHandle = () => {
  getSubscribersApi(route.params.id, (data.currentSubscribersPage - 1) * 40, 40).then((res: any) => {
    if (res.data.code) {
      data.subscribersData.push(...res.data.subscribers)
      data.isMore = res.data.more
    }
  })
}

// 点击全部播放
const playAllHandle = () => {
  data.playingIndex = 0
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', data.list[0]?.id)
  store.dispatch('songList/updateSongList', { songList: data.list, songListId: data.songListDetailInfo.id })
}

// 添加全部到播放列表
const addToPlayListHandle = () => {
  ElMessage({
    type: 'success',
    message: '已添加到播放列表'
  })
  if (store.state.songList.allSongListId.length == 0) {
    playAllHandle()
  } else {
    // 不能对一个歌单重复加入到歌单列表
    let a = store.state.songList.allSongListId.indexOf(data.songListDetailInfo.id)
    if (data.songListDetailInfo.id != store.state.songList.songListId && a == -1) {
      store.dispatch('songList/addToSongList', { songList: data.list, songListId: data.songListDetailInfo.id })
    }
  }
}

const clickTab = (tag: any, e: any) => {
  data.activeName = tag.props.name
  if (tag.props.name == 'third' && data.isMore) {
    getSubscribersHandle()
  }
}

const dbClickRow = (id: number) => {
  let index = data.list.findIndex((item, index) => {
    return item.id == id
  })
  data.playingIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  if (data.songListDetailInfo.id != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: data.list, songListId: data.songListDetailInfo.id })
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
  getSongListCommentHandle()
  scrollToComment()
}

const bottomLoad = () => {
  data.currentSubscribersPage += 1
  getSubscribersHandle()
}

const onChange = (value: string) => {
  data.list = data.songs.filter((item: any, index: number) => {
    return item.name.search(value) != -1
  })
  data.playingIndex = data.list.findIndex(item => {
    return item.id == store.state.songList.musicId
  })
}

const deleteLikeMusic = (index: number) => {
  data.list.splice(index, 1)
  data.playingIndex = data.list.findIndex(item => {
    return item.id == store.state.songList.musicId
  })
  data.songListDetailInfo.trackCount -= 1
}

const deleteMusic = (index: number) => {
  data.list.splice(index, 1)
  data.playingIndex = data.list.findIndex(item => {
    return item.id == store.state.songList.musicId
  })
  data.songListDetailInfo.trackCount -= 1
}

onMounted(() => {
  getSongListInfoHandle()
  getSongListCommentHandle()
})

watch(() => store.state.songList.musicId, (current, last) => {
  data.playingIndex = data.list.findIndex(
    (item: any) => item.id == current
  );
})

</script>
<template>
  <div class="SongListContainer scroll">
    <SongListDetailInfo :songListDetailInfo="data.songListDetailInfo" @playAllHandle="playAllHandle"
      @addToPlayListHandle="addToPlayListHandle">
    </SongListDetailInfo>
    <div class="songlist-content" v-show="data.commentData.total >= 0">
      <el-input v-model="data.keyWord" @input="onChange" class="w-50 m-2 search-input" size="small" placeholder="搜索歌单音乐"
        v-if="data.activeName == 'first'" :suffix-icon="data.keyWord == '' ? Search : ''" clearable />
      <el-tabs v-model="data.activeName" @tab-click="clickTab">
        <el-tab-pane label="歌曲列表" name="first">
          <SongListTable :songs="data.list" @dbClickRow="dbClickRow" :keyWord="data.keyWord"
            :playingIndex="data.playingIndex" @deleteLikeMusic="deleteLikeMusic" @deleteMusic="deleteMusic">
          </SongListTable>
        </el-tab-pane>
        <el-tab-pane :label="'评论(' + data.commentData.total + ')'" name="second">
          <!-- 热门评论 -->
          <Comment :comments="data.commentData.hotComments" :commentType="'2'"
            :commentId="data.songListDetailInfo.id + ''" :isHotComment="data.commentData.hotComments ? true : false"
            @scrollToComment="scrollToComment" @getSongListCommentHandle="getSongListCommentHandle" ref="hotComments">
            <template #title v-if="data.commentData.hotComments.length != 0">
              <div>热门评论</div>
            </template>
          </Comment>
          <!-- 最新评论 -->
          <Comment :comments="data.commentData.comments" :commentType="'2'" style="padding: 30px;"
            :commentId="data.songListDetailInfo.id + ''" :isHotComment="data.commentData.hotComments ? false : true"
            @scrollToComment="scrollToComment" @transToHotComment="transToHotComment"
            @getSongListCommentHandle="getSongListCommentHandle">
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
        <el-tab-pane label="收藏者" name="third">
          <UserCard userType="musicListDetailPage" :userList="data.subscribersData" :isLoad="data.isMore"
            @bottomLoad="bottomLoad"></UserCard>
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
</style>