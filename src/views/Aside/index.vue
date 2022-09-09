<script setup lang='ts'>
import { onMounted, reactive, watch } from 'vue';
import { getAsideList } from '@/api/aside/index'
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { delSongList, getMusics, getSongListInfo, updateSongListName } from '@/api/songlistDetail';
import { ElMessage } from 'element-plus';


const store = useStore();
let router = useRouter()

interface RootObject {
  defaultActive: string;
  defaultOpeneds: string[];
  createdMusicList: any[];
  collectedMusicList: any[];
  currentIndex: number;
  myLikeSongList: any;
  myCreatedSongList: any[];
  isShowScrollBar: boolean;
  editDialog: boolean;
  deleteDialog: boolean;
  currentSongList: currentSongListOblect;
  songListName: string;
  songs: any[];
  options: optionObject;
  options2: optionObject;
}
interface currentSongListOblect {
  id: string;
  name: string;
}
interface optionObject {
  menuItemCss: menuItemCssObject;
}
interface menuItemCssObject {
  arrowSize: string;
}
const data: RootObject = reactive({
  defaultActive: "",
  defaultOpeneds: ["create", "collect"],
  // 创建的歌单
  createdMusicList: [],
  // 收藏的歌单
  collectedMusicList: [],
  currentIndex: -1,
  myLikeSongList: {},
  myCreatedSongList: [],
  isShowScrollBar: false,
  editDialog: false,
  deleteDialog: false,
  currentSongList: { id: '', name: '' },
  songListName: '',
  songs: [],
  options: {
    menuItemCss: {
      arrowSize: '8px'
    },
    menuList: [
      {
        label: '播放',
        fn: (id: any, ...args: []) => getSongListInfoHandle(id)
      },
      {
        label: '下一首播放',
        fn: (id: any, ...args: []) => addToPlayListHandle(id)
      },
    ]
  },
  options2: {
    menuItemCss: {
      arrowSize: '8px'
    },
    menuList: [
      {
        label: '播放',
        fn: (item: any, ...args: []) => getSongListInfoHandle(item.id)
      },
      {
        label: '下一首播放',
        fn: (item: any, ...args: []) => addToPlayListHandle(item.id)
      },
      {
        line: true
      },
      {
        label: '编辑歌单信息',
        fn: (item: any, ...args: []) => openEditDialog(item),
        hidden: (item: any) => {
          if (item.creator.userId == window.localStorage.getItem("userId")) {
            return false
          } else {
            return true
          }
        }
      },
      {
        label: '删除歌单',
        fn: (item: any, ...args: []) => openDeleteDialog(item),
      }
    ]
  },
})


// 获取歌单的数据
const getAsideListHandle = () => {
  const timestamp = Date.parse(new Date().toString());
  const userId = window.localStorage.getItem("userId")
  getAsideList(userId, timestamp).then((res) => {
    if (res.data.code == 200) {
      res.data.playlist.filter((item: any) => {
        if (item.creator.userId == userId) {
          data.createdMusicList.push(item)
        } else {
          data.collectedMusicList.push(item)
        }
      })
      data.createdMusicList[0].name = "我喜欢的音乐";
      store.dispatch("aside/getCreatedList", data.createdMusicList)
      store.dispatch('aside/getCollectedList', data.collectedMusicList)
      data.myLikeSongList = data.createdMusicList[0]
      data.myCreatedSongList = data.createdMusicList.slice(1)
    }
  })
}

// 获取歌单的所有歌曲
const getSongListInfoHandle = (id: any) => {
  let timestamp: number = Date.parse(new Date().toString());
  getSongListInfo(id, timestamp).then((res) => {
    if (res.data.code == 200) {
      let ids = ''
      res.data.playlist.trackIds.forEach((item: any) => {
        ids += item.id + ",";
      })
      ids = ids.substr(0, ids.length - 1);
      getMusics(ids).then((res) => {
        if (res.data.code == 200) {
          store.dispatch('songList/updatePlayState', true)
          store.dispatch('songList/getMusicId', res.data.songs[0]?.id)
          store.dispatch('songList/updateSongList', { songList: res.data.songs, songListId: id })
        }
      })
    }
  })
}

// 下一首播放
// 添加全部到播放列表
const addToPlayListHandle = (id: any) => {
  ElMessage({
    type: 'success',
    message: '已添加到播放列表'
  })
  if (store.state.songList.allSongListId.length == 0) {
    getSongListInfoHandle(id)
  } else {
    // 不能对一个歌单重复加入到歌单列表
    let a = store.state.songList.allSongListId.indexOf(id)
    if (id != store.state.songList.songListId && a == -1) {
      let timestamp: number = Date.parse(new Date().toString());
      getSongListInfo(id, timestamp).then((res) => {
        if (res.data.code == 200) {
          let ids = ''
          res.data.playlist.trackIds.forEach((item: any) => {
            ids += item.id + ",";
          })
          ids = ids.substr(0, ids.length - 1);
          getMusics(ids).then((res) => {
            if (res.data.code == 200) {
              store.dispatch('songList/addToSongList', { songList: res.data.songs, songListId: id })
            }
          })
        }
      })
    }
  }
}

// 打开编辑对话框
const openEditDialog = (item: any) => {
  data.currentSongList = item
  data.songListName = data.currentSongList.name
  data.editDialog = true
}

// 编辑歌单
const editSongList = () => {
  updateSongListName(data.currentSongList.id, data.songListName).then((res) => {
    console.log(res);
    if (res.data.code === 200) {
      data.editDialog = false
      data.createdMusicList = []
      data.collectedMusicList = []
      store.dispatch("aside/getCreatedList", data.createdMusicList)
      store.dispatch('aside/getCollectedList', data.collectedMusicList)
      getAsideListHandle()
    }
  })
}

// 打开删除对话框
const openDeleteDialog = (item: any) => {
  data.currentSongList = item
  data.deleteDialog = true
}

// 删除歌单
const deleteSongList = () => {
  delSongList(data.currentSongList.id).then((res) => {
    if (res.data.code === 200) {
      data.deleteDialog = false
      data.createdMusicList = []
      data.collectedMusicList = []
      store.dispatch("aside/getCreatedList", data.createdMusicList)
      store.dispatch('aside/getCollectedList', data.collectedMusicList)
      getAsideListHandle()
    }
  })
}

let timer: any = null

onMounted(() => {
  if (router.currentRoute.value.path.search("/songlistdetail") == -1) {
    data.defaultActive = "/" + router.currentRoute.value.path.split("/")[1];
    data.currentIndex = -1
  } else {
    data.defaultActive = router.currentRoute.value.path
  }
  timer = setInterval(() => {
    if (document.querySelector('.is-active > div')) {
      clearInterval(timer)
      document.querySelector('.is-active > div')?.classList.add("currentSubMenu")
    }
  }, 1)
})


// 监听路由的切换
watch(() => router.currentRoute.value.path, (current) => {
  document.querySelector('.currentSubMenu')?.classList.remove("currentSubMenu");
  if (current.search("/songlistdetail") == -1) {
    data.defaultActive = "/" + current.split("/")[1];
    data.currentIndex = -1
  } else {
    data.defaultActive = current;
    timer = setInterval(() => {
      if (document.querySelector('.currentSubMenu')) {
        clearInterval(timer)
      } else {
        document.querySelector('.is-active > div')?.classList.add("currentSubMenu")
      }
    }, 1)
  }
})

// 监听登录状态
watch(() => store.state.login.isLogin, (current) => {
  if (current) {
    getAsideListHandle();
  } else {
    // 清空收藏和创建歌单
    data.createdMusicList = [];
    data.collectedMusicList = [];
  }
})

watch(() => store.state.aside.collectedMusicList, (current, last) => {
  data.collectedMusicList = current
})

watch(() => store.state.aside.createdMusicList, (current, last) => {
  data.createdMusicList = current
  data.myLikeSongList = current[0]
  data.myCreatedSongList = current.slice(1)
})
</script>
<template>
  <el-menu :default-active="data.defaultActive" :default-openeds="data.defaultOpeneds" router
    :class="data.isShowScrollBar ? 'show-scroll-bar' : ''" @mouseenter="data.isShowScrollBar = !data.isShowScrollBar"
    @mouseleave="data.isShowScrollBar = !data.isShowScrollBar">
    <div class="main-aside">
      <el-menu-item index="/discover" class="menuItem">
        <span>发现音乐</span>
      </el-menu-item>
      <el-menu-item index="/video" class="menuItem">
        <span>视频</span>
      </el-menu-item>
      <el-menu-item index="/recommend_music" class="menuItem">
        <span>每日推荐</span>
      </el-menu-item>
      <el-menu-item-group index="myMusic" popper-class="currentSubMenu">
        <template #title>
          <span class="groupTitle">我的音乐</span>
        </template>
        <el-menu-item :index="'/songlistdetail/' + data.myLikeSongList.id" class="menuItem"
          v-if="data.createdMusicList.length != 0" v-mouse-menu="{params:data.myLikeSongList.id,...data.options}">
          <i class="iconfont icon-xihuan"></i>
          <span>{{ data.myLikeSongList.name }}</span>
        </el-menu-item>
        <el-menu-item index="/history" class="menuItem">
          <i class="iconfont  icon-yinle"></i>
          <span>最近播放</span>
        </el-menu-item>
        <el-menu-item index="/collected" class="menuItem" v-if="data.createdMusicList.length != 0">
          <i class="iconfont icon-more"></i>
          <span>我的收藏</span>
        </el-menu-item>
      </el-menu-item-group>
      <el-sub-menu index="create" v-if="data.createdMusicList.length != 0" popper-class="currentSubMenu">
        <template #title>
          <span class="groupTitle">创建的歌单</span>
        </template>
        <el-menu-item v-for="(item) in data.myCreatedSongList" :key="item.id" :index="'/songlistdetail/' + item.id"
          class="item" v-mouse-menu="{params:item,...data.options2}">
          <!-- <span v-if="index == 0"><i class="iconfont icon-xihuan"></i>{{ item.name }}</span> -->
          <span v-if="item.privacy === 0"><i class="iconfont icon-gedan"></i>{{ item.name }}</span>
          <span v-else><i class="iconfont icon-lock"></i>{{ item.name }}</span>
        </el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="collect" v-if="data.collectedMusicList.length != 0" popper-class="currentSubMenu">
        <template #title>
          <span class="groupTitle">收藏的歌单</span>
        </template>
        <el-menu-item v-for="(item, index) in data.collectedMusicList" :key="index"
          :index="'/songlistdetail/' + item.id" class="item" v-mouse-menu="{params:item,...data.options2}">
          <i class="iconfont icon-gedan"></i><i class="iconfont song-list-name">{{ item.name }}</i>
        </el-menu-item>
      </el-sub-menu>
      <el-dialog v-model="data.editDialog" width="30%" center :modal="false" :destroy-on-close="true"
        custom-class="delete-like-music-dialog" :close-on-click-modal="false">
        <el-input v-model="data.songListName" />
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="editSongList">确定</el-button>
          </span>
        </template>
      </el-dialog>
      <el-dialog v-model="data.deleteDialog" width="30%" center :modal="false" :destroy-on-close="true"
        custom-class="delete-like-music-dialog" :close-on-click-modal="false">
        <span>确定删除该歌单？</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="deleteSongList">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </el-menu>


</template>
<style lang="less" scoped>
.el-menu-item.is-active {
  font-weight: 600;
  color: #ec4141;
  background-color: rgb(246, 246, 247);
}

// .is-active {
//   background-color: #ecf5ff;
// }

.el-sub-menu.is-active .el-sub-menu__title {
  // background-color: #ecf5ff;
}

.el-menu {
  overflow: auto;
}


.el-menu::-webkit-scrollbar {
  width: 5px;
}

.el-menu::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
  background: rgba(0, 0, 0, 0);
}

.el-menu::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0);
}

.show-scroll-bar::-webkit-scrollbar {
  width: 5px;
}

.show-scroll-bar::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.el-menu-item:hover {
  background-color: rgb(246, 246, 247);
}


.el-menu-item,
.el-sub-menu__title {
  height: 45px;
  line-height: 45px;
  margin: 5px 5px 5px 10px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-container.is-vertical {
  height: 100%;
}


.el-sub-menu .el-menu-item {
  display: list-item;
  min-width: unset;
  height: 45px;
  line-height: 45px;
  padding: unset;
  font-size: 16px;
}

.el-sub-menu .el-menu-item:hover {
  background-color: rgb(246, 246, 247);
}

.item {
  padding-left: 10px !important;
  width: 199px;
  font-size: 16px;
  overflow: hidden; //超出的文本隐藏
  text-overflow: ellipsis; //溢出用省略号显示
  white-space: nowrap; //溢出不换行
}

.el-menu-item {
  font-size: 16px;
}

.groupTitle {
  font-size: 14px;
  opacity: 0.6;
}
</style>