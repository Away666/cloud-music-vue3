<script setup lang='ts'>
import { defineProps, defineEmits, reactive, ref, watch } from 'vue'
const emits = defineEmits(['clickSongListTag'])
const props: any = defineProps({
  allTag: {
    type: Array,
    default: () => []
  },
  currentTag: {
    type: Object,
    default: () => { }
  }
})
const data = reactive({
  isSortPopShow: false
})
const inputRef: any = ref(null)
const clickActive = () => {
  data.isSortPopShow = true
  inputRef.value.focus()
}

const clickItem = (item: any) => {
  data.isSortPopShow = false
  emits('clickSongListTag', item)
}

</script>
<template>
  <div class="navContainer">
    <el-popover placement="bottom-start" width="350" popper-class="sortPop" trigger="click" :show-arrow="false"
      :hide-after="0" :visible="data.isSortPopShow">
      <template #reference>
        <div class="SortBox" @click.capture="clickActive">
          <span>
            <el-input :value="props.currentTag.name" type="button" @blur="data.isSortPopShow = false" ref="inputRef"
              @focus="data.isSortPopShow = true">
            </el-input><i class="iconfont icon-arrow-right-bold"></i>
          </span>
        </div>
      </template>
      <div class="tips" v-if="props.allTag.length == 0">正在加载分类数据...</div>
      <div class="sortList" v-else>
        <div class="sortItme" :class="props.currentTag.name == item.name ? 'currentItem' : ''"
          v-for="(item, index) in props.allTag" :key="index" @click="clickItem(item)">
          {{ item.name }}
        </div>
      </div>
    </el-popover>
  </div>
</template>
<style lang="less">
.SortBox {
  width: 110px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;

  .el-input {
    width: unset;
    height: 20px;
    line-height: 20px;
    font-size: 16px;

    .el-input__wrapper {
      padding: 0;
      box-shadow: none;

      .el-input__inner {
        height: 20px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;

      }
    }
  }
}


.tips {
  width: 100%;
  text-align: center;
  font-size: 12px;
  padding: 20px 0;
  color: rgb(145, 145, 145);
}

.sortList {
  display: flex;
  flex-wrap: wrap;
}

.sortItme {
  font-size: 13px;
  width: 25%;
  text-align: center;
  color: rgb(85, 85, 85);
  padding: 5px 0;
  margin: 5px 0;
  cursor: pointer;
  border-radius: 30px;
  // transform: scale(0.9);
}

.sortItme:hover {
  color: #eb4f4f;
}

.currentItem {
  color: #eb4f4f;
  background-color: #fcebeb;
}

.sortPop {
  height: 160px;
  overflow: scroll;
  margin-top: -10px !important;
  width: 320px !important;
}

.sortPop::-webkit-scrollbar {
  width: 0px;
}

.el-popover {
  padding: 0 !important;
}
</style>