<script setup lang='ts'>
import { defineProps, onMounted, reactive, watch } from 'vue'
import { handleIndex, handleMusicTime } from '@/utils/index'
import { useStore } from 'vuex';
import { addOrDelSongApi, like } from '@/api/songlistDetail'
import { useRoute } from 'vue-router';
import router from '@/router';
import { ElMessage } from 'element-plus';
import { CustomMouseMenuOptions } from '@howdyjs/mouse-menu/dist/types';
import { createNewSongList, getAsideList } from '@/api/aside';
import { CustomMouseMenu } from '@howdyjs/mouse-menu';
const store = useStore()
const route = useRoute()
const emits = defineEmits(['dbClickRow'])
const props: any = defineProps({
  songs: {
    type: Array,
    default: () => []
  },
  playingIndex: {
    type: Number,
    default: () => -1
  }
})

interface RootObject {
  currentSongListLikeMusic: any[];
  dialogVisible: boolean;
  currentId: string;
  currentIndex: number;
  isCreate: boolean;
  currentMusic: currentMusicObject;
  options: CustomMouseMenuOptions;
  deleteDialog: boolean;
  collectDialog: boolean;
  inputDialogVisible: boolean;
  songListName: string;
  isPrivacy: boolean;
  createdMusicList: any[];
}
interface currentMusicObject {
  id: string;
}

const data: RootObject = reactive({
  currentSongListLikeMusic: [],
  dialogVisible: false,
  currentId: '',
  currentIndex: -1,
  isCreate: false,
  currentMusic: { id: '' },
  deleteDialog: false,
  collectDialog: false,
  inputDialogVisible: false,
  songListName: '',
  isPrivacy: false,
  createdMusicList: [],
  options: {
    menuItemCss: {
      arrowSize: '8px'
    },
    menuList: [
      {
        label: '播放',
        fn: (item: any, ...args: []) => getSongListInfoHandle(item)
      },
      {
        label: '下一首播放',
        fn: (item: any, ...args: []) => addToPlayListHandle(item)
      },
      {
        line: true
      },
      {
        label: '收藏到歌单',
        fn: (item: any, ...args: []) => openCollectDialog(item),
      },
    ]
  },
})

let timer: any

const dbClickRow = (row: any, index: number) => {
  if (row.dt === 0) {
    ElMessage({
      type: 'warning',
      message: '歌曲即将上线，敬请期待！'
    })
  } else if (row.noCopyrightRcmd) {
    ElMessage({
      type: 'error',
      message: '因合作方要求,该资源暂时下架＞﹏＜'
    })
  } else if (row.fee === 1 && store.state.login.userInfo.vipType === 0) {
    ElMessage({
      type: 'warning',
      message: '该歌曲需要VIP，暂时只能试听！'
    })
    emits('dbClickRow', row.id)
  }
  else {
    emits('dbClickRow', row.id)
  }
}

const likeIt = (id: any, index: number, item: any) => {
  let timestamp = Date.parse(new Date().toString())
  let isLike = data.currentSongListLikeMusic.findIndex((item: any) => {
    return item == id
  })
  let isCreateSongList = store.state.aside.createdMusicList.findIndex((item: any) => {
    return item.id == route.params.id
  })

  if (isLike != -1) {
    // 取消喜欢
    if (isCreateSongList != -1) {
      data.currentId = id
      data.currentIndex = index
      data.dialogVisible = true
    }
    else {
      like(id, false, timestamp).then((res) => {
        if (res.data.code == 200) {
          store.dispatch('songList/updateLikeMusicList', { type: 'del', id })
        }
      })
    }
  } else {
    // 喜欢
    like(id, true, timestamp).then((res) => {
      if (res.data.code == 200) {
        store.dispatch('songList/updateLikeMusicList', { type: 'add', id })
      }
    })
  }
}

const singerClick = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const albumClick = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}

// 获取我喜欢的音乐
const getLikeMusicHandle = () => {
  data.currentSongListLikeMusic = store.state.songList.likeMusicList
}

const toMvDetail = (id: any) => {
  router.push({ name: 'videodetail', params: { id, type: 'mv' } })
}

const showMouseMenu = (row: any, column: any, event: any) => {
  const { x, y } = event
  const ctx = CustomMouseMenu({
    el: event.currentTarget,
    params: row,
    ...data.options,
  })
  ctx.show(x, y)
  event.preventDefault()
}

const getSongListInfoHandle = (item: any) => {
  let arr = []
  arr.push(item)
  // 不能对一个歌单重复加入到歌单列表
  let currentIndex = -1
  let a = store.state.songList.allSongListId.indexOf(item.id)
  if (item.id != store.state.songList.musicId && a == -1) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
    store.state.songList.songList.forEach((item: any, i: number) => {
      if (item.id == store.state.songList.musicId)
        currentIndex = i
    })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex + 1].id)
  }
  // 如果当前播放的歌单有你搜索的那首歌，那就需要找出那首歌在播放列表的位置
  else if (item.id != store.state.songList.musicId && a != -1) {
    store.state.songList.songList.forEach((item1: any, i: number) => {
      if (item1.id == item.id)
        currentIndex = i
    })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', store.state.songList.songList[currentIndex].id)
  }
}
const addToPlayListHandle = (item: any) => {
  let arr = []
  arr.push(item)
  if (store.state.songList.songList.length === 0) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', item.id)
  } else if (store.state.songList.songList.length !== 0 && item.id != store.state.songList.musicId) {
    store.dispatch('songList/addToSongList', { songList: arr, songListId: item.id })
  }
}

const openCollectDialog = (item: any) => {
  data.currentMusic = item
  getAsideListHandle()
  data.collectDialog = true
}
const openInputDialog = () => {
  data.collectDialog = false
  data.songListName = ''
  data.isPrivacy = false
  data.inputDialogVisible = true
}
// 添加到已有的歌单
const addToCreatedSongListHandle = (item: any, index: any) => {
  let timestamp = Date.parse(new Date().toString());

  // 如果点的是第一个，需要把全部的歌加上小爱心，但是一次操作多个会操作频繁
  if (index === 0) {
    // 喜欢
    like(data.currentMusic.id, true, timestamp)
    store.dispatch('songList/updateLikeMusicList', { type: 'add', id: data.currentMusic.id })
  }
  addOrDelSongApi('add', item.id, data.currentMusic.id).then((res) => {
    data.collectDialog = false
    if (res.data.body.code === 200) {
      ElMessage({
        type: 'success',
        message: '歌曲已添加到歌单！'
      })
    } else {
      ElMessage({
        type: 'error',
        message: '歌单歌曲重复！'
      })
    }
  })
}
// 创建新的歌单
const createNewSongListHandle = () => {
  if (data.songListName) {
    createNewSongList(data.songListName, data.isPrivacy ? 10 : 0).then((res) => {
      if (res.data.code === 200) {
        data.inputDialogVisible = false
        store.dispatch('aside/updateCreatedList', res.data.playlist)
        ElMessage({
          type: 'success',
          message: '歌单已创建成功!'
        })
        addOrDelSongApi('add', res.data.id, data.currentMusic.id)
      }
    })
  }
}
// 重新获取歌单的数据
const getAsideListHandle = () => {
  data.createdMusicList = []
  let timestamp = Date.parse(new Date().toString());
  const userId = window.localStorage.getItem("userId")
  getAsideList(userId, timestamp).then((res) => {
    if (res.data.code == 200) {
      res.data.playlist.filter((item: any) => {
        if (item.creator.userId == userId) {
          data.createdMusicList.push(item)
          data.createdMusicList[0].name = "我喜欢的音乐";
        }
      })
      store.dispatch("aside/getCreatedList", data.createdMusicList)
    }
  })
}


onMounted(() => {
  getLikeMusicHandle()
})

watch(() => store.state.songList.likeMusicList, (current, last) => {
  data.currentSongListLikeMusic = current
})

</script>
<template>
  <div v-if="props.songs">
    <el-table :data="props.songs" size="mini" style="width: 100%" @row-dblclick="dbClickRow" highlight-current-row
      row-class-name="songlist-row" lazy :row-key="
        (row: any) => {
          return row.id;
        }
      " @row-contextmenu="showMouseMenu">
      <el-table-column label="" width="50" type="index" :index="handleIndex" align="right">
        <template #default="scope">
          <span v-if="scope.$index == props.playingIndex && store.state.songList.isPlaying" class="currentRow"><i
              class="iconfont icon-icon-yinliangzhong"></i></span>
          <span v-else-if="scope.$index == props.playingIndex && store.state.songList.isPlaying == false"
            class="currentRow"><i class="iconfont icon-yinliangxiao"></i></span>
          <span v-else>{{ handleIndex(scope.$index) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" prop="id" width="35" class-name="like" align="center">
        <template #default="scope">
          <i v-if="data.currentSongListLikeMusic.findIndex((item: any) => item == scope.row.id) != -1"
            class="iconfont icon-aixin aixin" title="取消喜欢" @click="likeIt(scope.row.id, scope.$index, scope.row)"></i>
          <i v-else class="iconfont icon-aixin2" @click="likeIt(scope.row.id, scope.$index, scope.row)" title="喜欢"></i>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="音乐标题" min-width="250">
        <template #default="scope">
          <div class="table-name-col">
            <span class="name" :class="scope.$index == props.playingIndex ? 'currentRow' : ''">{{ scope.row.name
            }}</span>
            <span class="sub-head" v-if="scope.row.alia">
              <span v-for="(item, index) in scope.row.alia" :key="index">
                ({{ item }})
              </span>
            </span>
            <span class="no-resource" v-if="scope.row.noCopyrightRcmd">无音源</span>
            <span class="tip" v-if="scope.row.noCopyrightRcmd">{{ scope.row.noCopyrightRcmd.typeDesc }}</span>
            <span class="vip" v-if="scope.row.fee == 1 && !scope.row.noCopyrightRcmd">VIP</span>
            <span class="vip" v-if="scope.row.fee == 1 && !scope.row.noCopyrightRcmd">试听</span>
            <span class="Hi-Res" v-if="scope.row.hr && !scope.row.noCopyrightRcmd">Hi-Res</span>
            <span class="Hi-Res" v-if="scope.row.sq && !scope.row.hr && !scope.row.noCopyrightRcmd">SQ</span>
            <span class="mv" v-if="scope.row.mv && !scope.row.noCopyrightRcmd" @click="toMvDetail(scope.row.mv)">MV
              <p class="symbol">▶</p>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="ar[0].name" label="歌手" min-width="120">
        <template #default="{ row }">
          <span v-for="(item1, index) in row.ar" :key="index"><span v-if="index != 0"> / </span>
            <span class="singer" @click="singerClick(item1.id)">
              {{ item1.name }}</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="al.name" label="专辑" min-width="200"><template #default="{ row }">
          <span class="album" @click="albumClick(row.al.id)">{{
          row.al?.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dt" label="时长" min-width="50">
        <template #default="{ row }">
          <span class="time">{{ handleMusicTime(row.dt) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="data.collectDialog" title="收藏到歌单" width="30%" draggable center :close-on-click-modal="false"
      :modal="false" :destroy-on-close="true" custom-class="collect-songlist-dialog">
      <div class="item" @click="openInputDialog">
        <span class="image"><i class="iconfont icon-zengjia"></i></span>
        <p>创建为新歌单</p>
      </div>
      <div class="song-list-item-container scroll">
        <div class="item song-list-item" @click="addToCreatedSongListHandle(item, index)"
          v-for="(item, index) in data.createdMusicList" :key="item.id">
          <span class="image"><img v-lazy="item.coverImgUrl + '?param=200y200'" alt=""></span>
          <div>
            <p class="name">{{ item.name }}</p>
            <p class="num">{{ item.trackCount }}首音乐，0首已下载</p>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog v-model="data.inputDialogVisible" title="新建歌单" width="30%" draggable center :close-on-click-modal="false"
      :modal="false" :destroy-on-close="true" custom-class="input-songlist-name-dialog">
      <el-input class="song-list-name-input" v-model="data.songListName" placeholder="请输入新歌单标题"></el-input>
      <el-checkbox v-model="data.isPrivacy" label="设置为隐私歌单" />
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="createNewSongListHandle"
            :class="{ button: data.songListName, button2: !data.songListName }">创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="less" scoped>
.icon-aixin2 {
  cursor: pointer;
  font-size: 20px;
}

.aixin {
  font-size: 20px;
  color: rgb(236, 65, 65);
}

.aixin:hover {
  color: rgb(215, 53, 53);
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

.singer {
  cursor: pointer;
  color: #8b8b8b;
}

.singer:hover {
  color: rgb(97, 98, 98);
}

.table-name-col {
  display: flex;
  align-items: center;

  .name {
    max-width: 45%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .no-resource {
    padding: 0 2px;
    margin-left: 8px;
    font-size: 12px;
    color: #8b8b8b;
    border: 1px solid #6e6e6e;
    border-radius: 3px;
  }

  .tip {
    margin-left: 8px;
    font-size: 12px;
    color: #8b8b8b;
  }

  .sub-head {
    margin-left: 8px;
    font-size: 12px;
    color: #898989;
    max-width: 45%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .vip {
    padding: 0 2px;
    margin-left: 8px;
    font-size: 12px;
    color: rgb(254, 103, 46);
    border: 1px solid rgb(254, 103, 46);
    border-radius: 3px;
  }

  .Hi-Res {
    padding: 0 2px;
    margin-left: 8px;
    font-size: 12px;
    color: rgb(236, 65, 65);
    border: 1px solid rgb(236, 65, 65);
    border-radius: 3px;
  }

  .mv {
    cursor: pointer;
    padding: 0 2px;
    margin-left: 8px;
    font-size: 12px;
    color: rgb(236, 65, 65);
    border: 1px solid rgb(236, 65, 65);
    border-radius: 3px;

    .symbol {
      float: right;
      font-size: 12px;
      transform: scale(0.5);
    }
  }

  .mv:hover {
    color: rgb(240, 140, 140);
    border: 1px solid rgb(240, 140, 140);
  }
}

.album-name {
  cursor: pointer;
}

.time {
  color: #8b8b8b;
}
</style>