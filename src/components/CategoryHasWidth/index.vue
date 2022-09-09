<script setup lang='ts'>
import { defineProps, defineEmits, reactive, computed } from 'vue'
const emits = defineEmits(['clickSongListTag'])
const props: any = defineProps({
  hotTag: {
    type: Array,
    default: () => []
  },
  activeIndex: {
    type: Number,
    default: () => -1
  }
})

const data = reactive({
  activeindex: computed(() => {
    return props.activeIndex
  })
})

const clickItem = (item: any, index: any) => {
  emits("clickSongListTag", { item, index })
}


</script>
<template>
  <div class="navBar">
    <div class="item" v-for="(item, index) in props.hotTag" :key="index" @click="clickItem(item, index)">
      <div class="barItem" :class="index == data.activeindex ? 'active' : ''"><span class="name">{{ item.name }}</span>
      </div>
      <div v-if="props.hotTag.length > index + 1" class="item-line"><span class="line"></span></div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.navBar {
  display: flex;
  flex-wrap: wrap;

  .item {
    // margin-right: 5px;
    width: 75px;
    height: 30px;
    text-align: center;
    position: relative;
  }

  .item-line {
    position: absolute;
    top: 0;
    left: 0;
    height: 30px;

    .line {
      padding-top: 5px;
      display: inline-block;
      height: 20px;
      width: 75px;
      position: relative;
    }

    .line::after {
      content: '';
      position: absolute;
      right: 0;
      background: #ddd;
      width: 1px;
      height: 100%;
      -webkit-transform: scaleX(0.6);
    }

  }
}

.barItem {
  display: inline;
  padding: 5px 10px;
  line-height: 30px;
  font-size: 13px;
  text-align: center;
  box-sizing: content-box;
  cursor: pointer;

  .name {
    display: inline-block;
    height: 20px;
  }
}


.active {
  background-color: #fdf5f5;
  color: #ec4747;
  border-radius: 11px;
}
</style>