<script setup lang='ts'>
import { handleMusicTime } from '@/utils';
import useCurrentInstance from '@/utils/useCurrentInstance';
import { nextTick, onMounted, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import TableList from '@/components/TableList/index.vue'
const { proxy } = useCurrentInstance();
const store = useStore()
const data = reactive({
  songlist: [{ dt: '', id: '', }],
  playingIndex: -1
})
const getRecommendSongData = async () => {
  await proxy.$http("/recommend/songs").then((res: any) => {
    if (res.data.code == 200) {
      data.songlist = res.data.data.dailySongs
      // data.songlist.forEach((item, index) => {
      //   data.songlist[index].dt = handleMusicTime(item.dt);
      // });
      data.playingIndex = data.songlist.findIndex(
        (item: any) => item.id == store.state.songList.musicId
      );
    }
  })
}

const playAllHandle = () => {
  data.playingIndex = 0
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', data.songlist[0]?.id)
  store.dispatch('songList/updateSongList', { songList: data.songlist, songListId: '111' }) // 没有歌单id，就随便给一个
}

// 点击添加到播放列表
const addToPlayListHandle = () => {
  if (store.state.songList.allSongListId.length == 0) {
    playAllHandle()
  } else {
    let a = store.state.songList.allSongListId.indexOf('111')
    if ('111' != store.state.songList.songListId && a == -1) {
      store.dispatch('songList/addToSongList', { songList: data.songlist, songListId: '111' })
    }
  }
}

const mouseenter = () => {
  document.querySelector(".play-all-left")?.classList.add("play-all-left-hover")
}

const mouseleave = () => {
  document.querySelector(".play-all-left-hover")?.classList.remove("play-all-left-hover")
}

const dbClickRow = (id: any) => {
  let index = data.songlist.findIndex((item, index) => {
    return item.id == id
  })
  data.playingIndex = index
  store.dispatch('songList/updatePlayState', true)
  store.dispatch('songList/getMusicId', id)
  if ('6460486' != store.state.songList.songListId) {
    store.dispatch('songList/updateSongList', { songList: data.songlist, songListId: '6460486' })
  }
}


onMounted(() => {
  getRecommendSongData()
})

watch(() => store.state.songList.musicId, (current, last) => {
  data.playingIndex = data.songlist.findIndex(
    (item: any) => item.id == current
  );
})
</script>
<template>
  <div class="SongListContainer scroll" v-if="data.songlist[0].id">
    <div class="recommendInfo">
      <div class="title">
        <div class="cover">
          <img src="@/assets/images/recommendMusic.png" alt="" />
        </div>
        <div class="titleInfo">
          <div class="infoTop">每日歌曲推荐</div>
          <div class="infoBottom">根据你的音乐口味生成，每天6:00更新</div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="buttons">
        <div class="buttonItem playAll">
          <div class="play-all-left" @click="playAllHandle">
            <i class="iconfont icon-bofang playAll"></i>
            <span>播放全部</span>
          </div>
          <div class="play-all-right" title="添加全部到播放列表" @mouseenter="mouseenter" @mouseleave="mouseleave"
            @click="addToPlayListHandle">
            <i class="iconfont icon-zengjia"></i>
          </div>
        </div>
      </div>
    </div>
    <div>
      <TableList :songs="data.songlist" @dbClickRow="dbClickRow" :playingIndex="data.playingIndex"></TableList>
    </div>
  </div>
</template>
<style lang="less" scoped>
.SongListContainer {
  height: calc(100vh - 120px);
}

.recommendInfo {
  margin: 0 0 10px 10px;
}

.title {
  display: flex;
}

.cover {
  width: 90px;
}

.cover img {
  width: 100%;
}

.titleInfo {
  padding: 15px 10px;
}

.infoTop {
  font-size: 19px;
  font-weight: bold;
  color: black;
  margin: 3px 0;
}

.infoBottom {
  font-size: 12px;
}

.buttons {
  margin: 8px 0 0 3px;
  display: flex;
}

.buttonItem {
  display: flex;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  padding: 0 15px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  // transform: scale(0.9);
  cursor: pointer;
  align-items: center;

  .icon-folder-checked,
  .icon-folder-add {
    font-size: 20px;
  }
}

.buttonItem i {
  font-size: 16px;
  margin-right: 4px;
  // transform: scale(0.9);
}

.playAll {
  color: white;
  border-radius: unset;
  padding: 0;
  border: unset;

  .play-all-left {
    height: 40px;
    background-color: #ec4141;
    padding-left: 15px;
    padding-right: 10px;
    // border: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    position: relative;
  }

  .play-all-left::after {
    content: '';
    position: absolute;
    right: 0;
    background: #ddd;
    width: 1px;
    height: 38px;
    -webkit-transform: scaleX(0.3);
  }

  .play-all-right {
    height: 40px;
    background-color: #ec4141;
    padding-left: 12px;
    padding-right: 12px;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  .play-all-left:hover {
    background-color: rgb(204, 50, 50);

    +.play-all-right {
      background-color: rgb(215, 53, 53);
    }
  }

  // 不能对兄弟之前的元素产生影响
  .play-all-right:hover {
    background-color: rgb(204, 50, 50);

    +.play-all-left {
      background-color: rgb(215, 53, 53);
    }
  }

  .play-all-left-hover {
    background-color: rgb(215, 53, 53);
  }
}
</style>