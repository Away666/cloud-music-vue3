<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import useCurrentInstance from '@/utils/useCurrentInstance';
const { proxy } = useCurrentInstance()
const data = reactive({
  list: []
})

const getRecentSongData = () => {
  proxy.$http('/record/recent/song', { limit: 100 }).then((res: any) => {
    console.log(res);

  })
}
onMounted(() => {
  getRecentSongData()
})
</script>
<template>
  <div>暂无数据</div>
</template>
<style scoped>
</style>