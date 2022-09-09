<script setup lang='ts'>
import router from '@/router';
import { formatDate } from '@/utils';
import { reactive, defineProps, defineEmits } from 'vue';

const emits = defineEmits(['bottomLoad'])
const props = defineProps({
  listData: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default() {
      return "album";
    },
  },
  isLoad: {
    type: Boolean,
    default: () => false
  }
})
const data = reactive({
  index: -1,
})

const clickItem = (index: number) => {
  data.index = index
}

const dbClickItemAlbum = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}

const dbClickItemSinger = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const toAlbum = (id: any) => {
  router.push({ name: 'albumdetail', params: { id } })
}

const toSinger = (id: any) => {
  router.push({ name: 'singerdetail', params: { id } })
}

const load = () => {
  emits('bottomLoad')
}
</script>
<template>
  <div class="itemList">
    <div v-if="props.type == 'album'">
      <div v-for="(item, index) in (props.listData as any)" :key="index" class="item" @click="clickItem(index)"
        :class="data.index == index ? 'active' : ''" @dblclick="dbClickItemAlbum(item.id)">
        <img v-lazy="item.picUrl + '?param=200y200'" alt="" @click="toAlbum(item.id)" />
        <span class="name"><span class="name1" @click="toAlbum(item.id)">{{ item.name }}</span></span>
        <span class="singer">
          <span v-for="(artist, index) in item.artists" :key="artist.id" @click="toSinger(artist.id)"><span
              v-if="index != 0"> / </span><span class="singer-name">
              {{ artist.name }}
            </span>
          </span>
        </span>
        <span class="size" :v-if="item.size">{{ item.size }}首</span>
      </div>
    </div>
    <div v-infinite-scroll="load" :infinite-scroll-disabled="props.isLoad" v-else-if="props.type == 'album1'"
      :infinite-scroll-distance="100" :infinite-scroll-immediate="false">
      <div v-for="(item, index) in (props.listData as any)" :key="index" class="item" @click="clickItem(index)"
        :class="data.index == index ? 'active' : ''" @dblclick="dbClickItemAlbum(item.id)">
        <img v-lazy="item.picUrl + '?param=200y200'" alt="" @click="toAlbum(item.id)" />
        <span class="name album-name"><span class="name1" @click="toAlbum(item.id)">{{ item.name }}</span></span>
        <span class="size album-size">{{ item.size }}首</span>
        <span class="time"> 发布时间：{{ formatDate(item.publishTime, 'yyyy-MM-dd') }}</span>
      </div>
    </div>
    <div v-else>
      <div v-for="(item, index) in (props.listData as any)" :key="index" class="item" @click="clickItem(index)"
        :class="data.index == index ? 'active' : ''" @dblclick="dbClickItemSinger(item.id)">
        <img v-lazy="item.picUrl + '?param=200y200'" alt="" @click="toSinger(item.id)" />
        <span class="name"><span class="name1" @click="toSinger(item.id)">{{ item.name }}</span></span>
        <span class="count">专辑：{{ item.albumSize }}</span>
        <span class="count">MV：{{ item.mvSize }}</span>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.item {
  padding: 0 30px;
  height: 90px;
  // width: 100%;
  display: flex;
  align-items: center;

  img {
    height: 70px;
    border-radius: 5px;
    cursor: pointer;
  }

  .name {
    margin-left: 15px;
    width: 55%;
    font-size: 14px;

    .name1 {
      cursor: pointer;
      color: rgb(97, 98, 98);
    }

    .name1:hover {
      color: rgb(8, 8, 8);
    }
  }

  .album-name {
    width: 45%;

  }

  .time {
    font-size: 12px;
    color: #aaa8a8;
  }

  .album-size {
    width: 25%;
  }

  .singer {
    width: 25%;
    font-size: 12px;
    color: #bcbbbb;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .singer-name {
    cursor: pointer;
  }

  .singer-name:hover {
    color: rgb(97, 98, 98);
  }

  .size {
    font-size: 12px;
    color: #aaa8a8;
  }

  .count {
    width: 25%;
    font-size: 12px;
    color: #bcbbbb;
  }
}

.item:nth-of-type(odd) {
  background-color: rgb(249, 249, 249);
}

.item:nth-of-type(even) {
  background-color: rgb(255, 255, 255);
}

.item:hover {
  background-color: rgb(240, 241, 242);
}

.active {
  background-color: rgb(240, 241, 242) !important;
}
</style>