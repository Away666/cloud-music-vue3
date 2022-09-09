<script setup lang='ts'>
import { defineProps, defineEmits, reactive, defineExpose, onMounted } from 'vue'
import { sendCommentApi, likeCurrentCommentApi } from '@/api/songlistDetail'
import { formatDate } from '@/utils/index'
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import router from '@/router';
const store = useStore()
const emits = defineEmits(['transToHotComment', 'scrollToComment', 'getSongListCommentHandle']);

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  },
  // 评论的类型 0: 歌曲 1: mv 2: 歌单 3: 专辑 4: 电台 5: 视频
  commentType: {
    type: String,
    default: () => ''
  },
  commentId: {
    type: String,
    default: () => ''
  },
  // 歌曲评论需要歌曲名称
  musicTitle: {
    type: String,
    default() {
      return "";
    },
  },
  // 是否是热门评论
  isHotComment: {
    type: Boolean,
    default() {
      return false;
    },
  },
  musicName: {
    type: String,
    default: () => ''
  }
})
const data = reactive({
  commentInput: '',
  // 评论模式   true是常规评论   false是回复评论
  commentMode: true,
  floorCommentInputLength: 0,
  floorCommentId: '',
  isShowButton: false,
  dialogVisible: false,
  dialogInput: '',
  isReplyMode: true,
})

const inputComment = () => {
  // 如果是楼层回复
  if (data.commentMode == false) {
    if (data.commentInput.length < data.floorCommentInputLength) {
      // 当长度小于当前回复评论的长度时，相当于是正常评论，而不是回复别人了
      data.commentMode = true;
    }
  }
}

// 发送评论
const submitComment = () => {
  // 判断是否登录
  if (!store.state.login.isLogin) {
    ElMessage({
      type: 'warning',
      message: "只有登陆后才能评论哦!"
    })
    return;
  }
  // 先判断评论内容是否为空
  if (data.commentInput == "" && data.dialogInput == "") {
    ElMessage({
      type: 'warning',
      message: "评论内容不能为空哦!"
    })
    return;
  }
  // t: 1 发送, 2 回复
  sendCommentApi(1, props.commentId, props.commentType, data.dialogInput ? data.dialogInput : data.commentInput).then((res) => {
    if (res.data.code == 200) {
      if (props.commentType == '0') {
        data.dialogVisible = false
      }
      emits('getSongListCommentHandle')
      data.commentInput = ''
      data.dialogInput = ''
    }
  })
}

// 回复评论
const submitFloorComment = () => {
  // 判断是否登录
  if (!store.state.login.isLogin) {
    ElMessage({
      type: 'warning',
      message: "只有登陆后才能评论哦!"
    })
    return;
  }
  // 先判断评论内容是否为空
  if (data.commentInput.length == data.floorCommentInputLength && data.dialogInput == "") {
    ElMessage({
      type: 'warning',
      message: "评论内容不能为空哦!"
    })
    return;
  }
  // t: 1 发送, 2 回复
  sendCommentApi(2, props.commentId, props.commentType, data.dialogInput ? data.dialogInput : data.commentInput.slice(data.floorCommentInputLength), data.floorCommentId).then((res) => {
    if (res.data.code == 200) {
      if (props.commentType == '0') {
        data.dialogVisible = false
      }
      emits('getSongListCommentHandle')
      data.commentInput = ''
      data.dialogInput = ''
      data.floorCommentInputLength = 0;
      data.floorCommentId = "";
    }
  })
}

const openDialog = () => {
  data.dialogInput = ''
  data.commentInput = ''
  data.isReplyMode = true
  data.dialogVisible = true
}

const closeCommentDialog = () => {

}

// 给该条评论点赞
const likeCurrentComment = (like: any, id: any) => {
  let timestamp = Date.parse(new Date().toString());
  likeCurrentCommentApi(props.commentId, id, like ? 0 : 1, props.commentType, timestamp).then((res) => {
    if (res.data.code == 200) {
      emits('getSongListCommentHandle')
    }
  })

}

// 点击回复评论
const floorComment = (id: any, nickname: any) => {
  if (props.isHotComment == false) {
    emits('transToHotComment', { id, nickname })
  }
  if (props.commentType != "0") {
    // 让父元素滚动到评论框
    emits('scrollToComment')
    // 让评论框获得焦点
    let input: any = document.querySelector(".commentArea");
    // 阻止focus定位
    input.children[0].focus({ preventScroll: true });
  } else {
    openDialog();
  }
  data.commentInput = "回复" + nickname + "：";
  data.floorCommentInputLength = data.commentInput.length;
  // 将评论模式改为楼层评论
  data.commentMode = false;
  data.isReplyMode = false;
  data.floorCommentId = id;

}

const toUserDetail = (id: any) => {
  store.dispatch('songList/updateMusicDetailState', false)
  router.push({ name: 'userdetail', params: { id } })
}

const goTop = () => {
  let songDetailContainer: any = document.querySelector(".song-detail-container");
  songDetailContainer.scrollTo({
    behavior: "smooth",
    top: 0,
  });
}

defineExpose({ floorComment })

onMounted(() => {
  // 如果点击了楼层回复，摁下了删除键就会把变为评论模式
  document.getElementsByTagName('body')[0].addEventListener('keydown', function (e) {
    if (!data.commentMode && e.keyCode === 8 && data.floorCommentInputLength > 0 && data.floorCommentInputLength == data.commentInput.length) {
      data.commentInput = ''
      data.commentMode = true
    }
  });
  let songDetailContainer: any = document.querySelector(".song-detail-container");
  songDetailContainer.addEventListener('scroll', function (e: any) {
    if (e.path[0].scrollTop > 40) {
      data.isShowButton = true
    } else {
      data.isShowButton = false
    }
  });

})
</script>
<template>
  <div class="comment-container">
    <div class="comments" v-if="props.commentType != '0' && props.isHotComment">
      <el-input type="textarea" class="commentArea" maxlength="140" show-word-limit v-model="data.commentInput"
        placeholder="留下你的评论" @input="inputComment"></el-input>
      <div class="submitCommentButton">
        <el-button size="small" round @click="data.commentMode ? submitComment() : submitFloorComment()"
          class="submitComment">评论</el-button>
      </div>
    </div>
    <!-- 音乐单曲评论 -->
    <Teleport to="body" :disabled="!store.state.songList.isShowMusicDetail">
      <div v-if="props.commentType == '0' && !props.isHotComment">
        <el-button class="commentCardSwitch" :class="[data.isShowButton ? 'showButton' : '']" size="small" round
          @click="openDialog"><i class="iconfont icon-ziyuan"></i>
          发表我的音乐评论</el-button>
      </div>
    </Teleport>
    <Teleport to="body" :disabled="!store.state.songList.isShowMusicDetail">
      <div v-if="props.commentType == '0' && !props.isHotComment">
        <el-button class="writeComment" :class="[data.isShowButton ? 'showButton1' : '']" size="small" round
          @click="openDialog"><i class="iconfont icon-ziyuan"></i>
          写评论</el-button>
      </div>
    </Teleport>
    <Teleport to="body" :disabled="!store.state.songList.isShowMusicDetail">
      <div v-if="props.commentType == '0' && !props.isHotComment" class="GoTop"
        :class="[data.isShowButton ? 'showButton' : '']" @click="goTop">
        <i class="iconfont icon-fanhuidingbu"></i>
      </div>
    </Teleport>
    <Teleport to="body">
      <el-dialog v-model="data.dialogVisible" width="30%" draggable center :close-on-click-modal="false" :modal="false"
        :destroy-on-close="true" custom-class="comment-dialog">
        <div class="musicTitle" v-if="data.isReplyMode">歌曲：{{ props.musicName }}</div>
        <div class="musicTitle" v-else>评论</div>
        <el-input type="textarea" class="commentArea musicCommentArea" maxlength="140" show-word-limit
          v-model="data.dialogInput" @input="inputComment" :placeholder="data.isReplyMode ? '发表评论':data.commentInput">
        </el-input>
        <!-- 提交评论 -->
        <div class="submitCommentButton">
          <el-button size="small" round @click="data.isReplyMode ? submitComment() : submitFloorComment()"
            class="submitComment musicSubmitComment" :class="data.dialogInput ? '':'opacity-button'">评论</el-button>
        </div>
      </el-dialog>
    </Teleport>
    <div class="commentHeader" v-if="props.comments.length != 0">
      <slot name="title"></slot>
    </div>
    <div class="commentItem" v-for="(item, index) in (props.comments as any)" :key="index">
      <div class="commentCreatorAvatar">
        <img v-lazy="item.user.avatarUrl + '?param=100y100'" alt="" />
      </div>
      <div class="commentMain">
        <div class="commentContent">
          <span class="commentUserNickName" @click="toUserDetail(item.user.userId)">{{ item.user.nickname
          }}:&nbsp;</span>
          <span>{{ item.content }}</span>
        </div>
        <div class="replied">
          <div class="repliedItem" v-for="(item1, index1) in item.beReplied" :key="index1">
            <span class="repliedUser">@{{ item1.user.nickname }}:&nbsp;</span>
            <span class="repliedContent">{{ item1.content }}</span>
          </div>
        </div>
        <div class="commentBottom">
          <div class="commentCreatedTime">
            {{ formatDate(item.time, "yyyy-MM-dd hh:mm") }}
          </div>
          <div class="commentButtons">
            <div @click="likeCurrentComment(item.liked, item.commentId)"
              :class="item.liked ? 'likeCurrentComment' : ''">
              <i class="iconfont icon-good"></i> {{ item.likedCount }}
            </div>
            <div><i class="iconfont icon-zhuanfa"></i></div>
            <div>
              <i class="iconfont icon-pinglun" @click="floorComment(item.commentId, item.user.nickname)"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.comment-container {
  padding: 0 30px;
}

.comments {
  margin-top: 15px;
}

.commentHeader {
  font-size: 14px;
  color: rgb(26, 26, 26);
  font-weight: 600;
  padding: 10px 0;
}

.commentItem {
  display: flex;
  margin: 5px 0;
  padding: 10px 0 20px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}

.commentCreatorAvatar {
  width: 35px;
  height: 35px;
  margin: 0px 10px 0 0;
}

.commentCreatorAvatar img {
  width: 100%;
  border-radius: 50%;
  cursor: pointer;
}

.commentMain {
  width: calc(100% - 50px);
}

.commentUserNickName {
  color: #5a8ab9;
  cursor: pointer;
}

.commentBottom {
  margin-top: 2px;
  color: rgb(172, 172, 172);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commentButtons {
  display: flex;
  align-items: center;
}

.commentButtons div {
  margin-top: -3px;
  padding: 0 8px;
  transform: scale(0.85);
}

.commentButtons div:nth-child(1) {
  font-size: 14px;
}

.replied {
  background-color: #f4f4f4;
  margin: 7px 0;
  border-radius: 5px;
}

.repliedItem {
  padding: 7px 10px;
  line-height: 20px;
}

.repliedUser {
  color: #5a8ab9;
  cursor: pointer;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.commentContent>span {
  line-height: 20px;
}

.el-textarea /deep/ .el-textarea__inner {
  height: 65px !important;
  font-size: 12px;
  resize: none;
}

.el-textarea /deep/ .el-textarea__inner:focus {
  border-color: #aaa;
}

.el-textarea /deep/ .el-input__count {
  transform: scale(0.9);
}

.submitCommentButton {
  width: 100%;
  text-align: right;
  margin: 10px 0;
}

.el-button:hover {
  background-color: #f2f2f2;
}

.el-button {
  transform: scale(0.9) translateX(5%);
}

.submitComment:focus {
  background-color: #fff;
}

.commentCardSwitch {
  position: fixed;
  left: 50%;
  bottom: -80px;
  transform: translateX(-50%) scale(0.9);
  border: none;
  background-color: #f1f1f1;
  line-height: 15px;
  padding: 15px 10px 15px 30px;
  z-index: 1000;
  transition: all 0.35s ease;
}

.writeComment {
  position: fixed;
  left: 80%;
  bottom: 80px;
  transform: translateX(-50%) scale(0.9);
  border: none;
  background-color: #f1f1f1;
  line-height: 15px;
  padding: 15px 10px 15px 10px;
  z-index: 1000;
  transition: all 0.35s ease;
}

.GoTop {
  position: fixed;
  background-color: #f1f1f1;
  border-radius: 50%;
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  cursor: pointer;
  left: 80%;
  bottom: -80px;
  transition: all 0.35s ease;
}

.showButton {
  bottom: 80px;
}

.showButton1 {
  bottom: -80px;
}

.commentCardSwitch:hover {
  background-color: #e1e1e1;
}

.commentCardSwitch i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.musicTitle {
  width: 100%;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
}

.musicCommentArea /deep/ .el-textarea__inner {
  height: 110px !important;
}

.musicSubmitComment {
  padding: 8px 20px;
  font-size: 13px;
  background-color: #ec4141;
  color: white;
  border: none;
}

.musicSubmitComment:hover {
  background-color: #eb2e2e;
  color: white;
}

.musicSubmitComment:focus {
  color: white;
  background-color: #ec4141;
}

.commentDialog /deep/ .el-dialog__body {
  padding-bottom: 5px !important;
}

.likeCurrentComment,
.likeCurrentComment i {
  color: #ec4141 !important;
}

.iconfont {
  cursor: pointer;
}
</style>