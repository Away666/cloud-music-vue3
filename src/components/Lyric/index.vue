<script setup lang='ts'>
import { getIyricApi } from '@/api/songlistDetail';
import { onMounted, reactive, ref, watch } from 'vue';
import { useStore } from 'vuex';
const store = useStore()
const scrollView: any = ref(null)
interface RootObject {
  lyricList: any[];
  currentLyricIndex: number;
  goBackCurrentLyric: boolean;
}
const data: RootObject = reactive({
  lyricList: [],
  currentLyricIndex: 0,
  goBackCurrentLyric: true,
})

const getIyricListHandle = (id: any) => {
  data.lyricList = [[0, "正在加载歌词"]]
  getIyricApi(id).then((res) => {
    if (res.data.code === 200) {
      let lyrics = res.data.lrc.lyric;
      // 对获取到的歌词进行处理
      let arr = lyrics.split("\n");
      let time = "";
      let value = "";
      let result: (string | number)[][] = [];

      arr.forEach((item: string) => {
        time = item.split("]")[0];
        value = item.split("]")[1];
        //去掉时间里的中括号得到xx:xx.xx
        var t = time.slice(1).split(":");
        // 去除歌词为空的数组
        if (value != '') {
          //将结果压入最终数组
          result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
        }
      });
      data.lyricList = result
    }
  })
}

//获取当前歌词索引
const getCurrentLyricsIndex = (currentTime: number) => {
  data.lyricList.forEach((item: any, index: number) => {
    if (item[0] <= currentTime) {
      data.currentLyricIndex = index
    }
  })
}

let placeholderHeight = 0;

// 实现歌词滚动
const lyricScroll = (currentLyric: number) => {
  // 获取歌词item
  let lyricsArr: any = document.querySelectorAll(".lyricsItem");
  // 获取歌词框
  let lyrics: any = document.querySelector(".lyrics");
  // placeholder的高度
  if (placeholderHeight == 0) {
    placeholderHeight = lyricsArr[0].offsetTop
  }
  //   歌词item在歌词框的高度 = 歌词框的offsetTop - 歌词item的offsetTop
  if (lyricsArr[currentLyric - 1]) {
    let distance = lyricsArr[currentLyric - 1].offsetTop
    lyrics.scrollTo({
      behavior: "smooth",
      top: distance - placeholderHeight,
    });
  }
}
let timer: any
const scrolling = (e: any) => {
  clearTimeout(timer)
  let lyrics: any = document.querySelector(".lyrics");
  let currentLyric: any = document.querySelector(".currentLyric")
  if (lyrics?.scrollTop >= 0) {
    if (lyrics?.scrollTop + currentLyric?.offsetHeight * 4 > currentLyric?.offsetTop) {
      data.goBackCurrentLyric = false
      timer = setTimeout(() => {
        data.goBackCurrentLyric = true
      }, 2500)
    } else if (lyrics?.scrollTop - currentLyric?.offsetHeight * 3 < currentLyric?.offsetTop) {
      data.goBackCurrentLyric = false
      timer = setTimeout(() => {
        data.goBackCurrentLyric = true
      }, 2500)
    }
  }
}

onMounted(() => {
  scrollView.value.addEventListener('scroll', scrolling, true);
})

watch(() => store.state.songList.musicId, (current: any) => {
  if (current) {
    // 获取歌词框
    let lyrics: any = document.querySelector(".lyrics");
    lyrics.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  }
  data.goBackCurrentLyric = true
  clearTimeout(timer)
  data.currentLyricIndex = -1
  data.lyricList = [[0, "正在加载歌词"]]
  getIyricListHandle(current)
})
watch(() => store.state.songList.currentPlayTime, (current, last) => {
  getCurrentLyricsIndex(current)
  if (current > last + 1) {
    clearTimeout(timer)
    data.goBackCurrentLyric = true
  }
  if (data.goBackCurrentLyric) {
    lyricScroll(data.currentLyricIndex)
  }
})
</script>
<template>
  <div class="lyrics scroll" ref="scrollView">
    <!-- 占位 -->
    <div class="placeholder"></div>
    <div class="lyricsItem" :class="data.currentLyricIndex == index ? 'currentLyric' : ''"
      v-for="(item, index) in data.lyricList" :key="index">
      {{ item[1] }}
    </div>
    <!-- 占位 -->
    <div class="placeholder"></div>
  </div>
</template>
<style lang="less" scoped>
.lyrics {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: center;
  overflow-y: scroll;
}

.lyrics::-webkit-scrollbar {
  // display: none;
  width: 5px;
}

.lyrics::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
  background: rgba(0, 0, 0, 0);
}

.lyrics::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0);
}

.lyrics:hover::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.fake-lyrics {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: center;
  overflow-y: scroll;
  z-index: -1;
}

.fake-lyrics::-webkit-scrollbar {
  display: none;
}



.lyricsItem {
  font-size: 12px;
  height: 15%;
  // margin: 25px 20px;
  transition: all 0.25s;
  // line-height: 20%;
}

.currentLyric {
  font-weight: 600;
  font-size: 14px;
  color: black;
}

.placeholder {
  width: 100%;
  height: 30%;
}
</style>