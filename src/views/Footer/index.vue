<script setup lang='ts'>
import { createNewSongList, getAsideList } from '@/api/aside';
import { addOrDelSongApi, getLikeMusics, getMusicUrl, like } from '@/api/songlistDetail';
import router from '@/router';
import { handleMusicTime } from '@/utils';
import { ElMessage } from 'element-plus';
import { reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
const store = useStore()
const audioPlayer = ref<any>(null);
interface RootObject {
  mark: any;
  musicUrl: string;
  currentMusic: CurrentMusic;
  songList: any[];
  currentIndex: number;
  likeList: any[];
  isShowMask: boolean;
  playMode: string;
  isPlaying: boolean;
  timeProgress: number;
  currentTime: number;
  lastSecond: number;
  voiceProgress: number;
  isShowDrawer: boolean;
  dialogVisible: boolean;
  inputDialogVisible: boolean;
  createdMusicList: any[];
  songListName: string;
  isPrivacy: boolean;
  isShowMusicDetail: boolean;
  collectMode: boolean;
  currentMusicTime: number;
}

interface CurrentMusic {
  al: Al;
  name: string;
  alia: any[];
  ar: any[];
  id: string;
  dt: number;
  fee: number;
  noCopyrightRcmd?: any;
}

interface Al {
  picUrl: string;
}


const data: RootObject = reactive({
  musicUrl: '',
  currentMusic: { al: { picUrl: '' }, name: '', alia: [], ar: [], id: '', dt: 0, fee: 0, noCopyrightRcmd: null, },
  songList: [],
  currentIndex: -1,
  likeList: [],
  isShowMask: false,
  playMode: 'order',
  isPlaying: false,
  timeProgress: 0,
  currentTime: 0,
  lastSecond: 0,
  mark: { 0: '' },
  voiceProgress: 50,
  isShowDrawer: false,
  dialogVisible: false,
  inputDialogVisible: false,
  createdMusicList: [],
  songListName: '',
  isPrivacy: false,
  isShowMusicDetail: false,
  collectMode: true, // 判断是收藏某一个歌到歌单还是收藏播放列表到歌单 true为歌单
  currentMusicTime: 0, // 歌曲的实际时间，比currentTime长一点
})
const likeIt = () => {
  let timestamp = Date.parse(new Date().toString())
  let isLike = data.likeList.findIndex((item: any) => {
    return item == data.currentMusic.id
  })
  if (isLike != -1) {
    // 取消喜欢
    like(data.currentMusic.id, false, timestamp).then((res) => {
      if (res.data.code == 200) {
        store.dispatch('songList/updateLikeMusicList', { type: 'del', id: data.currentMusic.id })
      }
    })

  } else {
    // 喜欢
    like(data.currentMusic.id, true, timestamp).then((res) => {
      if (res.data.code == 200) {
        store.dispatch('songList/updateLikeMusicList', { type: 'add', id: data.currentMusic.id })
      }
    })
  }
}

const toSingerDetail = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const changeState = (flag: boolean) => {

}

const changeMusic = (type: string) => {
  if (type == "next") {
    let currentMusicIndex = data.currentIndex
    let nextIndex = 0;
    if (data.playMode == "order") {
      if (data.songList.length == 1) {
        nextIndex = currentMusicIndex
        changeProgress(0)
        audioPlayer.value.play()
      } else {
        nextIndex = currentMusicIndex + 1 === data.songList.length ? 0 : currentMusicIndex + 1
      }
    } else if (data.playMode == "random") {
      if (data.songList.length == 1) {
        nextIndex = currentMusicIndex;
        changeProgress(0)
        audioPlayer.value.play()
      } else {
        // Math.floor(Math.random()*10); 可均衡获取0到9的随机整数。
        nextIndex = currentMusicIndex;
        while (nextIndex == currentMusicIndex) {
          nextIndex = Math.floor(Math.random() * data.songList.length);
        }
      }
    }

    // store.commit("updateMusicId", this.musicList[nextIndex].id);
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', data.songList[nextIndex].id)
  }
  else if (type == 'pre') {
    let currentMusicIndex = data.currentIndex
    let preIndex = 0;
    if (data.playMode == "order") {
      if (data.songList.length == 1) {
        preIndex = currentMusicIndex
        changeProgress(0)
        audioPlayer.value.play()
      } else {
        preIndex = currentMusicIndex == 0 ? data.songList.length - 1 : currentMusicIndex - 1
      }
    } else if (data.playMode == "random") {
      if (data.songList.length == 1) {
        preIndex = currentMusicIndex;
        changeProgress(0)
        audioPlayer.value.play()
      } else {
        // Math.floor(Math.random()*10); 可均衡获取0到9的随机整数。
        preIndex = currentMusicIndex;
        while (preIndex == currentMusicIndex) {
          preIndex = Math.floor(Math.random() * data.songList.length);
        }
      }
    }
    store.dispatch('songList/updatePlayState', true)
    store.dispatch('songList/getMusicId', data.songList[preIndex].id)
  }
}
const timeupdate = (e: any) => {
  // 不设置这个判断有些歌曲他播放的当前时间总是为0，导致播放不了,但是歌词不太精确
  if (e.target.currentTime === 0) {
    audioPlayer.value.currentTime = 0.6
  }
  // 歌曲的dt比实际的时间少一点，计算差值相减即可
  audioPlayer.value.volume = data.voiceProgress / 100
  let time = e.target.currentTime
  data.currentMusicTime = e.target.duration
  let different = e.target.duration - ((data.currentMusic.dt / 1000))
  // 如果在差值为负数的时候不赋值为0的话，进度条就不是从开始出发
  if (different >= 0) {
  } else {
    different = 0
  }
  time = time - different
  store.dispatch('songList/updateCurrentPlayTime', time)
  if (time !== data.lastSecond) {
    data.lastSecond = time;
    data.currentTime = time;
    // 计算进度条的位置
    data.timeProgress = Math.floor((time / (data.currentMusic.dt / 1000)) * 100);
  }
  if (data.isPlaying) {
    audioPlayer.value.play()
  } else {
    audioPlayer.value.pause()
  }
}

const changePlayState = () => {
  if (data.musicUrl) {
    data.isPlaying = !data.isPlaying
    store.dispatch('songList/updatePlayState', data.isPlaying)
    if (data.isPlaying) {
      audioPlayer.value.play()
    } else {
      audioPlayer.value.pause()
    }
  }
}

const changeProgress = (e: any) => {
  data.currentTime = Math.floor((e / 100) * (data.currentMusicTime));
  audioPlayer.value.currentTime = data.currentTime
}

const input = (e: number) => {
  data.currentTime = Math.floor((e / 100) * (data.currentMusicTime));
  audioPlayer.value.currentTime = data.currentTime
}
const changeVoiceProgress = (e: number) => {
  data.voiceProgress = e
  audioPlayer.value.volume = e / 100
}

const inputVoiceProgress = (e: number) => {
  data.voiceProgress = e
  audioPlayer.value.volume = e / 100
}

const openDrawer = () => {
  data.isShowDrawer = !data.isShowDrawer
}

const clearSongList = () => {
  store.dispatch('songList/clearSongList')
  data.musicUrl = ''
  data.currentMusic = { al: { picUrl: '' }, name: '', alia: [], ar: [], id: '', dt: 0, fee: 0, noCopyrightRcmd: null, }
  data.timeProgress = 0
}

// 添加到已有的歌单
const addToCreatedSongListHandle = (item: any, index: any) => {
  let timestamp = Date.parse(new Date().toString());
  if (data.collectMode) {
    let tracks = ''
    for (let i = data.songList.length - 1; i >= 0; i--) {
      if (i === data.songList.length - 1) {
        tracks += data.songList[i].id
      } else {
        tracks += ',' + data.songList[i].id
      }
    }
    // 如果点的是第一个，需要把全部的歌加上小爱心，但是一次操作多个会操作频繁
    if (index === 0) {
      // 喜欢
      for (let i = data.songList.length - 1; i >= 0; i--) {
        like(data.songList[i].id, true, timestamp)
        store.dispatch('songList/updateLikeMusicList', { type: 'add', id: data.songList[i] })
      }
    }
    addOrDelSongApi('add', item.id, tracks).then((res) => {
      data.dialogVisible = false
      if (res.data.body.code === 200) {
        ElMessage({
          type: 'success',
          message: '歌曲已添加到歌单！'
        })
      } else {
        ElMessage({
          type: 'error',
          message: '歌单内歌曲重复添加！'
        })
      }
    })
  } else {
    // 如果点的是第一个，需要把全部的歌加上小爱心，但是一次操作多个会操作频繁
    if (index === 0) {
      // 喜欢
      like(data.currentMusic.id, true, timestamp)
      store.dispatch('songList/updateLikeMusicList', { type: 'add', id: data.currentMusic.id })
    }
    addOrDelSongApi('add', item.id, data.currentMusic.id).then((res) => {
      data.dialogVisible = false
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
}


// 重新获取歌单的数据
const getAsideListHandle = () => {
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

const openDialog = (type: boolean) => {
  data.collectMode = type
  if (data.songList.length !== 0) {
    data.createdMusicList = []
    getAsideListHandle()
    data.dialogVisible = true
  }
}

const openInputDialog = () => {
  data.dialogVisible = false
  data.songListName = ''
  data.isPrivacy = false
  data.inputDialogVisible = true
}

// 创建新的歌单
const createNewSongListHandle = () => {
  if (data.songListName && data.collectMode) {
    createNewSongList(data.songListName, data.isPrivacy ? 10 : 0).then((res) => {
      if (res.data.code === 200) {
        data.inputDialogVisible = false
        store.dispatch('aside/updateCreatedList', res.data.playlist)
        ElMessage({
          type: 'success',
          message: '歌单已创建成功!'
        })
        let tracks = ''
        for (let i = data.songList.length - 1; i >= 0; i--) {
          if (i === data.songList.length - 1) {
            tracks += data.songList[i].id
          } else {
            tracks += ',' + data.songList[i].id
          }
        }
        addOrDelSongApi('add', res.data.id, tracks)
      }
    })
  } else if (data.songListName && !data.collectMode) {
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

const dbClickRow = (row: any) => {
  let index = data.songList.findIndex((item: { id: any; }, index: any) => {
    return item.id == row.id
  })
  data.currentIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', row.id)
}


const singerClick = (id: any) => {
  data.isShowDrawer = false
  router.push({ name: 'singerdetail', params: { id } })
}

const toMusicDetail = () => {
  data.isShowMusicDetail = !data.isShowMusicDetail
  store.dispatch('songList/updateMusicDetailState', data.isShowMusicDetail)
  data.isShowMask = false
}

watch(() => store.state.songList.songList, (current) => {
  if (current) {
    data.songList = current
  }
})
watch(() => store.state.songList.musicId, (current, last) => {
  if (current) {
    data.lastSecond = 0
    data.songList = store.state.songList.songList
    data.currentIndex = data.songList.findIndex((item: any) => {
      return item.id === current
    })
    data.currentMusic = data.songList[data.currentIndex]
    getMusicUrl(current, 'hires').then((res) => {
      if (res.data.code === 200) {
        data.musicUrl = res.data.data[0].url
        if (data.musicUrl == '') {
          ElMessage({
            type: 'warning',
            message: '该歌曲暂无资源，自动为您播放下一首!'
          })
        }
        data.mark = { 0: '' }
        if (res.data.data[0].freeTrialInfo) {
          let percent = ((1000 * res.data.data[0].freeTrialInfo.end) / data.currentMusic.dt) * 100
          const mapObj: any = {
            0: percent
          }
          const newObj = JSON.parse(JSON.stringify(data.mark).replace(/0/gi, matched => mapObj[matched])
          )
          data.mark = newObj
        } else {
          data.mark = { 0: '' }
        }
      }
    })
  }
})
watch(() => store.state.songList.likeMusicList, (current, last) => {
  data.likeList = current
})
watch(() => store.state.songList.isPlaying, (current) => {
  data.isPlaying = current
})
watch(() => store.state.aside.createdMusicList, (current, last) => {
  data.createdMusicList = current
})
watch(() => store.state.songList.isShowMusicDetail, (current) => {
  data.isShowMusicDetail = current
})
</script>
<template>
  <div class="footer-container">
    <audio :src="data.musicUrl" ref="audioPlayer" autoplay @play="changeState(true)" @pause="changeState(false)"
      @ended="changeMusic('next')" @timeupdate="timeupdate"></audio>
    <div class="left-content" v-if="data.currentMusic.al.picUrl && !data.isShowMusicDetail">
      <div class="image" @mouseenter="data.isShowMask = true" @mouseleave="data.isShowMask = false" title="展开音乐详情页"
        @click="toMusicDetail">
        <img :src="data.currentMusic.al.picUrl">
        <div class="mask" v-if="data.isShowMask"><i class="iconfont icon-arrow-down-bold"></i></div>
      </div>
      <div class="music-info">
        <span class="music-info-top">
          <span class="name" @click="toMusicDetail">{{ data.currentMusic.name }} <span class="sub-head"
              v-if="data.currentMusic.alia[0]">({{ data.currentMusic.alia[0] }})</span></span>
          <span class="vip" v-if="data.currentMusic.fee == 1 && !data.currentMusic.noCopyrightRcmd">VIP</span>
          <span class="vip" v-if="data.currentMusic.fee == 1 && !data.currentMusic.noCopyrightRcmd">试听</span>
          <i v-if="data.likeList.findIndex((item: any) => item == data.currentMusic.id) != -1"
            class="iconfont icon-aixin aixin" title="取消喜欢" @click="likeIt()"></i>
          <i v-else class="iconfont icon-aixin2" @click="likeIt()" title="喜欢"></i>
        </span>
        <span class="music-info-bottom">
          <span v-for="(singer, index) in (data.currentMusic.ar as any)" :key="singer.id">
            <span v-if="index === 0" class="singer-name" @click="toSingerDetail(singer.id)">{{ singer.name }}</span>
            <span v-else>/<span class="singer-name" @click="toSingerDetail(singer.id)">{{ singer.name }}</span></span>
          </span>
        </span>
      </div>
    </div>
    <div class="music-detail-left" v-if="data.isShowMusicDetail">
      <div class="icon-box" @click="toMusicDetail" title="收起音乐详情页"><i class="iconfont icon-arrow-down-bold"></i></div>
      <div class="aixin-box" v-if="data.likeList.findIndex((item: any) => item == data.currentMusic.id) != -1"
        title="取消喜欢" @click="likeIt()"><i class="iconfont icon-aixin aixin"></i>
      </div>
      <div class="aixin-box" v-else title="喜欢" @click="likeIt()"><i class="iconfont icon-aixin2"></i>
      </div>
      <div class="collect-box" title="收藏" @click="openDialog(false)">
        <i class="iconfont icon-folder-add"></i>
      </div>
    </div>
    <div class="center-content">
      <div class="center-content-top">
        <span class="button1" @click="data.playMode = data.playMode == 'order' ? 'random' : 'order'">
          <i class="iconfont icon-xunhuan" v-if="data.playMode == 'order'" title="列表循环"></i>
          <i class="iconfont icon-suiji1" v-else title="随机播放"></i>
        </span>
        <span class="button2" @click="data.songList.length != 0 ? changeMusic('pre') : ''"><i
            class="iconfont icon-shangyishou" title="上一首"></i></span>
        <span class="button3" @click="data.songList.length != 0 ? changePlayState() : ''">
          <i class="iconfont icon-zanting1" v-if="!data.isPlaying"></i>
          <i class="iconfont icon-zantingtingzhi" v-else></i>
        </span>
        <span class="button4" @click="data.songList.length != 0 ? changeMusic('next') : ''"><i
            class="iconfont icon-xiayishou" title="下一首"></i>
        </span>
        <span class="button5" title="打开歌词">词</span>
      </div>
      <!-- 进度条 -->
      <div class="progressBar">
        <span class="currentTime" v-if="data.currentMusic.al.picUrl">{{ handleMusicTime(data.currentTime) }}</span>
        <el-slider class="progressSlider" v-model="data.timeProgress" :show-tooltip="false" @change="changeProgress"
          @input="input" :disabled="data.songList.length == 0" :marks="data.mark"></el-slider>
        <span class="totalTime" v-if="data.currentMusic.al.picUrl">{{ handleMusicTime(data.currentMusic.dt) }}</span>
      </div>
      <div class="fake-container" v-if="!data.currentMusic.al.picUrl"></div>
    </div>
    <div class="right-content" v-if="data.currentMusic.al.picUrl">
      <div class="voice">
        <el-popover placement="top" :width="32" trigger="hover" popper-class="voicePopover">
          <template #reference>
            <i class="iconfont icon-yinliangxiao" v-if="data.voiceProgress" @click="data.voiceProgress = 0"
              title="静音"></i>
            <i class="iconfont icon-jingyin1" v-else @click="data.voiceProgress = 50" title="恢复音量"></i>
          </template>
          <el-slider v-model="data.voiceProgress" vertical class="voiceProgressSlider" :show-tooltip="false"
            @change="changeVoiceProgress" @input="inputVoiceProgress"></el-slider>
        </el-popover>
      </div>
      <div class="playList" @click="openDrawer">
        <i class="iconfont icon-bofangliebiao" title="打开播放列表"></i>
      </div>
      <el-dialog v-model="data.dialogVisible" title="收藏到歌单" width="30%" draggable center :close-on-click-modal="false"
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
      <el-dialog v-model="data.inputDialogVisible" title="新建歌单" width="30%" draggable center
        :close-on-click-modal="false" :modal="false" :destroy-on-close="true" custom-class="input-songlist-name-dialog">
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
    <el-drawer v-model="data.isShowDrawer" :with-header="false">
      <div class="drawer-top">
        <h3>当前播放</h3>
        <div class="controls">
          <span class="count">总{{ data.songList.length }}首</span>
          <span class="add"> <i class="iconfont icon-folder-add" @click="openDialog(true)"></i><span
              @click="openDialog(true)">收藏全部</span></span>
          <span class="clear" @click="clearSongList">清空列表</span>
        </div>
      </div>
      <el-table :data="data.songList" size="mini" style="width: 100%" @row-dblclick="dbClickRow" highlight-current-row
        :show-header="false" row-class-name="album-row" lazy :row-key="
          (row: any) => {
            return row.id
          }
        ">
        <el-table-column prop="name" label="音乐标题" min-width="150">
          <template #default="scope">
            <div class="table-name-col">
              <span class="name"
                :class="{ 'currentRow': scope.$index == data.currentIndex, 'not-online': scope.row.dt === 0 }">{{
                    scope.row.name
                }}</span>
              <span class="no-resource" v-if="scope.row.noCopyrightRcmd">无音源</span>
              <span class="tip" v-if="scope.row.noCopyrightRcmd">{{ scope.row.noCopyrightRcmd.typeDesc }}</span>
              <span class="vip" v-if="scope.row.fee == 1 && !scope.row.noCopyrightRcmd">VIP</span>
              <span class="vip" v-if="scope.row.fee == 1 && !scope.row.noCopyrightRcmd">试听</span>
              <span class="Hi-Res" v-if="scope.row.hr && !scope.row.noCopyrightRcmd">Hi-Res</span>
              <span class="Hi-Res" v-if="scope.row.sq && !scope.row.hr && !scope.row.noCopyrightRcmd">SQ</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ar[0].name" label="歌手" min-width="75">
          <template #default="{ row, $index }">
            <span v-for="(item1, index) in row.ar" :key="index"><span v-if="index != 0"> / </span>
              <span class="singer" :class="{ 'currentRow': $index == data.currentIndex }"
                @click="singerClick(item1.id)">
                {{ item1.name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="dt" label="时长" min-width="50">
          <template #default="scope">
            <span class="time">{{ handleMusicTime(scope.row.dt) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>

</template>
<style lang="less" scoped>
.footer-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .left-content {
    display: flex;
    align-items: center;

    .image {
      position: relative;
      border-radius: 5px;
      cursor: pointer;

      .mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        background-color: rgba(73, 73, 73, 0.8);
        border-radius: 5px;
        text-align: center;
        transform: rotate(180deg);
        display: flex;
        justify-content: center;
        align-items: center;

        i {
          color: white;
        }
      }
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 5px;
      cursor: pointer;
    }

    .music-info {
      margin-left: 10px;
      display: flex;
      flex-direction: column;

      .music-info-top {
        display: flex;
        align-items: center;

        .name {
          text-overflow: clip;
          overflow: hidden;
          white-space: nowrap;
          max-width: 150px;
          cursor: pointer;

          .sub-head {
            color: rgb(110, 110, 110);
            font-size: 14px;
          }
        }

        .vip {
          padding: 0 2px;
          margin-left: 8px;
          font-size: 12px;
          color: rgb(254, 103, 46);
          border: 1px solid rgb(254, 103, 46);
          border-radius: 3px;
        }

        .aixin {
          margin-left: 10px;
          font-size: 20px;
          color: rgb(236, 65, 65);
        }

        .aixin:hover {
          color: rgb(215, 53, 53);
        }

        .icon-aixin2 {
          margin-left: 10px;
          font-size: 20px;
        }

        .icon-aixin2:hover {
          font-weight: 600;
        }
      }

      .music-info-bottom {
        .singer-name {
          cursor: pointer;
          color: rgb(131, 131, 131);
          font-size: 13px;
        }

        .singer-name:hover {
          color: rgb(100, 100, 100);
        }
      }
    }
  }

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;

    .center-content-top {
      display: flex;
      width: 200px;
      justify-content: space-between;
      align-items: center;

      >span {
        cursor: pointer;
      }

      .button1:hover,
      .button2:hover,
      .button4:hover,
      .button5:hover {
        color: #F06767;
      }

      .button3 {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #F5F5F5;
      }

      .button3:hover {
        background-color: #E5E5E5;
      }

      .button5 {
        font-size: 13px;
      }

      .icon-zanting1 {
        font-size: 14px;
        margin-left: 1px;
      }

      .icon-zantingtingzhi {
        font-size: 22px;
      }
    }

    .progressBar {
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    .currentTime,
    .totalTime {
      font-size: 13px;
      /* transform: scale(0.85); */
      color: #aaa;
      margin: 0 20px;
      width: 30px;
      text-align: center;
    }

    .fake-container {
      position: absolute;
      width: 100%;
      height: 100%;
      background-color: #fafafa00;
      top: 0;
      left: 0;
    }
  }

  .right-content {
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .voice {

      .icon-yinliangxiao,
      .icon-jingyin1 {
        font-size: 20px;
        cursor: pointer;
      }
    }

    .icon-bofangliebiao {
      font-size: 20px;
      cursor: pointer;
    }
  }

  .el-dialog {
    .item {
      display: flex;
      align-items: center;
      // margin-bottom: 10px;
      padding: 10px 15px;

      .image {
        display: inline-block;
        width: 60px;
        height: 60px;
        background-color: rgb(238, 239, 241);
        position: relative;
        border-radius: 5px;

        i {
          font-size: 30px;
          color: rgb(236, 65, 65);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        img {
          width: 100%;
          height: 100%;
          border-radius: 5px;
        }
      }

      p {
        margin-left: 15px;
        display: inline;
      }

    }

    .song-list-item-container {
      height: 271px;
    }

    .song-list-item {
      cursor: pointer;

      div {
        display: flex;
        flex-direction: column;

        p {
          line-height: 24px;
        }

        .num {
          font-size: 13px;
          opacity: 0.7;
        }
      }
    }

    .song-list-item:hover {
      background-color: rgb(238, 239, 240);
    }

  }

  .drawer-top {
    margin: 20px 20px 0px;
    height: 75px;
    border-bottom: 1px solid #e3e3e3;
  }


  .controls {
    display: flex;
    position: relative;
    margin-top: 15px;

    .count {
      font-size: 12px;
      color: #aaa;
    }

    .add {
      position: absolute;
      top: 0;
      left: 50%;
      display: flex;
      align-items: center;

      i {
        font-size: 20px;
        color: #777777;
        cursor: pointer;
      }

      i:hover {
        color: #585858;
      }

      span {
        font-size: 14px;
        color: #585858;
        cursor: pointer;
      }
    }

    .clear {
      position: absolute;
      top: 0;
      right: 0;
      color: #7777fd;
      font-size: 14px;
      cursor: pointer;
    }

    .clear:hover {
      color: #5c5cff;
    }
  }

  .singer {
    cursor: pointer;
    color: #8b8b8b;
    font-size: 13px;
  }


  .table-name-col {
    display: flex;
    align-items: center;

    .name {
      max-width: 50%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
    }

    .not-online {
      color: #d5d5d5;
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
      transform: scale(0.9);
    }

    .Hi-Res {
      padding: 0 2px;
      margin-left: 8px;
      font-size: 12px;
      color: rgb(236, 65, 65);
      border: 1px solid rgb(236, 65, 65);
      border-radius: 3px;
      transform: scale(0.9);
    }

    .mv {
      cursor: pointer;
      padding: 0 2px;
      margin-left: 8px;
      font-size: 12px;
      color: rgb(236, 65, 65);
      border: 1px solid rgb(236, 65, 65);
      border-radius: 3px;
      transform: scale(0.9);

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

  .time {
    color: #d7d7d7;
  }
}

.el-table {
  height: calc(100% - 95px);
}

.music-detail-left {
  display: flex;
  align-items: center;

  .icon-box {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .aixin-box {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    border: 1px solid #E7E7E7;
    margin: 0 15px 0 50px;

    .aixin {
      color: rgb(236, 65, 65);
    }
  }

  .aixin-box:hover {
    background-color: #F5F5F5;
  }

  .collect-box {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    border: 1px solid #E7E7E7;

    .icon-folder-add {
      font-size: 18px;
    }
  }

  .collect-box:hover {
    background-color: #F5F5F5;
  }
}
</style>