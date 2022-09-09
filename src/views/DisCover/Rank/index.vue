<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import { useStore } from 'vuex'
import { getRankList, getRankSongListById } from '@/api/discover'
import { handleMusicTime } from '@/utils'
import ListTable from '@/components/ListTable/index.vue';
import ListCard5 from '@/components/ListCard5/index.vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const store = useStore()
const router = useRouter()
interface RootObject {
  officialList: any[];
  officialListDetail: any[];
  globalList: any[];
}
const data: RootObject = reactive({
  officialList: [],
  officialListDetail: [],
  globalList: [],
})

// 获取排行榜列表
const getRankListHandle = () => {
  getRankList().then((res) => {
    if (res.data.code == 200) {
      data.officialList = res.data.list.slice(0, 4);
      data.globalList = res.data.list.slice(4);
      // 遍历排行榜获取对应的数据
      data.officialList.forEach((item) => {
        getRankSongListByIdHandle(item.id)
      })
    }
  })
}

// 根据排行榜的id获取歌单列表
const getRankSongListByIdHandle = (id: number) => {
  getRankSongListById(id).then(res => {
    if (res.data.code == 200) {
      let result = res.data.playlist
      // 对时间进行处理
      // result.tracks.forEach((item: { dt: any; }, index: string | number) => {
      //   result.tracks[index].dt = handleMusicTime(item.dt);
      // });
      data.officialListDetail.push(result);
    }
  })
}

// 双击tableRow的事件
const handleRowDbClick = (item: any) => {
  let { id, index } = item
  let musicListIndex = data.officialListDetail.findIndex(
    (item) => item.id == id
  );
  store.dispatch('songList/getMusicId', data.officialListDetail[musicListIndex].tracks[index].id)
  // 如果歌单发生变化,则提交歌单到vuex
  if (id != store.state.songList.songListId) {
    // 将歌单传到vuex
    store.dispatch("songList/updateSongList", {
      songList: data.officialListDetail[musicListIndex].tracks,
      songListId: id,
    });
  }
}

// 点击查看全部
const clickCheckAll = (item: any) => {
  let id
  if (!store.state.login.isLogin) {
    ElMessage({
      message: '登录后才能查看全部歌曲哦!',
      type: 'error',
    })
    return;
  }
  if (item.id) {
    id = item.id;
  }
  router.push({ name: "songlistdetail", params: { id } });
}

const clickListCardItem = (id: any) => {
  router.push({ name: "songlistdetail", params: { id } });
}
onMounted(() => {
  getRankListHandle()

})
</script>
<template>
  <div class="ranking" v-if="data.officialListDetail.length != 0">
    <div class="offical">
      <div class="title">官方榜</div>
      <ListTable :list="item" v-for="(item, index) in data.officialListDetail" :key="index"
        @handleRowDbClick="handleRowDbClick" @clickCheckAll="clickCheckAll">
      </ListTable>
    </div>
    <div class="global">
      <div class="title">全球榜</div>
      <!-- 展示歌单列表 -->
      <ListCard5 :list="data.globalList" @clickListCardItem="clickListCardItem"></ListCard5>
    </div>
  </div>
</template>
<style lang="less" scoped>
.global {
  .title {
    padding-bottom: 10px;
  }
}

.title {
  font-size: 18px;
}
</style>