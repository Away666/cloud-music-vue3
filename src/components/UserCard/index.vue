<script setup lang='ts'>
import { defineProps, defineEmits, reactive } from 'vue'
const emits = defineEmits(['bottomLoad'])
const props = defineProps({
  userList: {
    type: Array,
    default: () => []
  },
  // 是否使用上拉触底事件
  isLoad: {
    type: Boolean,
    default: () => false
  },
  userType: {
    type: String,
    default: () => "personalPage"
  },
})

interface RootObject {
  disabled: boolean;
}
const data: RootObject = reactive({
  disabled: false
})

const load = () => {
  emits('bottomLoad')
  data.disabled = true
}
</script>
<template>
  <div class="UserListCard" v-infinite-scroll="load" :infinite-scroll-disabled="data.disabled"
    :infinite-scroll-distance="300" :infinite-scroll-immediate="false">
    <div class="userItem" v-for="(item, index) in (props.userList as any)" :key="index">
      <div class="user-item-left">
        <img v-lazy="item.avatarUrl + '?param=200y200'" alt="" class="avatar" />
      </div>
      <div class="user-item-right">
        <div class="nickName">{{ item.nickname }}</div>
        <div class="signature" v-if="item.signature">
          {{ item.signature }}
        </div>
        <div class="nums" v-if="userType == 'personalPage'">
          <div class="musicListNum">{{ "歌单: " + item.playlistCount }}</div>
          <div class="fenge">|</div>
          <div class="followedsNum">{{ "粉丝: " + item.followeds }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.UserListCard {
  padding: 10px 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.userItem {
  display: flex;
  width: 24.5%;
  height: 90px;
  padding: 10px 10px;
  border-radius: 10px;

  margin: 10px 0;
}

.userItem:hover {
  // background-color: #f9f9f9;
}

.avatar {
  height: 70px;
  width: 70px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #eee;
  margin-right: 10px;
  cursor: pointer;
}

.user-item-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: calc(100% - 80px);
}

.nickName {
  margin: 10px 0 5px;
  font-size: 13px;
  color: #373737;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.8;
}

.nickName:hover {
  opacity: 1;
}

.signature {
  font-weight: lighter;
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 13px;
  margin: 5px 0;
  opacity: 0.9;
}

.nums {
  display: flex;
  font-size: 12px;
  transform: scale(0.9) translateX(-5%);
  color: #888;
}

.fenge {
  color: #ddd;
  margin: 0 10px;
}
</style>