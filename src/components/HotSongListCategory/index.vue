<script setup lang='ts'>
import { defineProps, defineEmits, reactive, watch } from 'vue'
const emits = defineEmits(['clickSongListTag'])
const props: any = defineProps({
  hotTag: {
    type: Array,
    default: () => []
  },
  currentTag: {
    type: Object,
    default: () => { }
  }
})
const data = reactive({
  activeNum: -1,
})

const clickItem = (item: any, index: any) => {
  data.activeNum = index
  emits("clickSongListTag", item)
}

watch(() => props.currentTag, (newValue, oldValue) => {
  data.activeNum = props.hotTag.findIndex((item: any) => {
    return item.name == newValue.name
  })
})
</script>
<template>
  <div class="navBar">
    <div class="barItem" :class="index == data.activeNum ? 'active' : ''" v-for="(item, index) in props.hotTag"
      :key="index" @click="clickItem(item, index)">
      {{ item.name }}
    </div>
  </div>
</template>
<style scoped>
.navBar {
  display: flex;
  flex-wrap: wrap;
}

.barItem {
  /* margin: 4px -2px; */
  padding: 5px 10px;
  font-size: 14px;
  /* width: 40px; */
  text-align: center;
  box-sizing: content-box;
  cursor: pointer;
}

.active {
  background-color: #fdf5f5;
  color: #ec4747;
  border-radius: 11px;
}
</style>