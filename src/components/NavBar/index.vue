<script setup lang='ts'>
import { onMounted, reactive, defineProps } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter()
const route = useRoute()
const props = defineProps({
  navBarList: {
    type: Array,
    default: () => []
  }
})
const data = reactive({
  activeNum: 0,
})

const clickBarItem = (path: any, index: any) => {
  data.activeNum = index
  router.push(path)
}

onMounted(() => {
  // 根据地址判断 activeNum
  props.navBarList.forEach((item: any, index) => {
    if (decodeURI(route.path).search(item.path) != -1) {
      data.activeNum = index;
    }
  });
})

</script>
<template>
  <div class="navBarContainer">
    <div class="navBar">
      <div class="barItem" :class="index == data.activeNum ? 'active' : ''"
        v-for="(item, index) in (props.navBarList as any)" :key="index" @click="clickBarItem(item.path, index)">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.navBarContainer {
  padding-top: 5px;
  height: 45px;
  width: 100%;
  position: relative;
}

.navBar {
  display: flex;
  position: relative;
  left: 0px;
  top: 0;
  background-color: #fff;
  // z-index: 100;
  width: 100%;
  color: rgb(49, 49, 49);
  align-items: center;
}

.barItem {
  font-size: 18px;
  margin: 0 10px;
  text-align: center;
  cursor: pointer;
}

.active {
  font-size: 18px;
  color: black;
  font-weight: 600;
  padding-bottom: 5px;
  border-bottom: 3px solid #ec4141;
  transform: translateY(4px);
}
</style>