<script setup lang='ts'>
import { onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import ListCard5 from '@/components/ListCard5/index.vue'
import { getUserPlayListListApi, getUserInfoApi } from '@/api/userDetail';
import router from '@/router';

const route = useRoute()
interface RootObject {
  userInfo: any;
  activeName: string;
  createdList: any[];
  collectedList: any[];
}


const data: RootObject = reactive({
  activeName: 'first',
  userInfo: {},
  createdList: [],
  collectedList: [],
})

// 获取用户的信息
const getUserDetailDataHandle = () => {
  getUserInfoApi(route.params.id).then((res) => {
    if (res.data.code == 200) {
      data.userInfo = res.data
    }
  })
}

// 获取用户歌单列表
const getUserPlayListListHandle = () => {
  getUserPlayListListApi(route.params.id).then((res) => {
    if (res.data.code === 200) {
      data.createdList = res.data.playlist.filter((item: { userId: any; }) => {
        return item.userId == route.params.id
      })
      data.collectedList = res.data.playlist.filter((item: { userId: any; }) => {
        return item.userId != route.params.id
      })
    }
  })
}

const clickListCardItem = (id: any) => {
  router.push({ name: 'songlistdetail', params: { id } })
}


// 切换tab
const clickTab = (tag: any) => {
  data.activeName = tag.props.name
}


onMounted(() => {
  getUserDetailDataHandle()
  getUserPlayListListHandle()
})

</script>
<template>
  <div class="singer-detail-container scroll">
    <!-- 歌单信息 -->
    <div class="listInfo">
      <!-- 歌单封面 -->
      <div class="listAvatar">
        <img :src="data.userInfo.profile?.avatarUrl + '?param=300y300'" alt="" />
      </div>
      <div class="right">
        <!-- 标题 -->
        <div class="title">
          <div class="titleContent">{{ data.userInfo.profile?.nickname }}</div>
        </div>
        <div class="user-info">
          <span v-if="data.userInfo.profile?.vipType" class="vip">vip</span>
          <span class="icon" v-if="data.userInfo.identify"><img :src="data.userInfo.identify?.imageUrl" alt="">
            {{ data.userInfo.identify?.imageDesc }}</span>
          <span class="level">Lv{{ data.userInfo.level }}</span>
          <span class="gender">
            <span v-if="data.userInfo.profile?.gender === 1" class="male"><i class="iconfont icon-male"></i></span>
            <span v-if="data.userInfo.profile?.gender === 2" class="female"><i class="iconfont icon-female"></i></span>
          </span>
        </div>
        <hr>
        <div class="count">
          <div class="eventCount">
            <div class="num">{{ data.userInfo.profile?.eventCount }}</div>
            <div class="type">动态</div>
          </div>
          <div class="follows">
            <div class="num">{{ data.userInfo.profile?.follows }}</div>
            <div class="type">关注</div>
          </div>
          <div class="followeds">
            <div class="num">{{ data.userInfo.profile?.followeds }}</div>
            <div class="type">粉丝</div>
          </div>
        </div>
        <div class="social">
          <span>社交网络:<span class="content">未绑定</span></span>
        </div>
        <div class="intro">
          <span>个人介绍:<span class="content">{{ data.userInfo.profile?.signature ? data.userInfo.profile?.signature :
              '暂无介绍'
          }}</span></span>
        </div>
      </div>
    </div>
    <div class="user-container">
      <el-tabs v-model="data.activeName" @tab-click="clickTab">
        <el-tab-pane label="创建的歌单" name="first">
          <div class="created-container">
            <ListCard5 :list="data.createdList" @clickListCardItem="clickListCardItem" :type="'user'"></ListCard5>
          </div>
        </el-tab-pane>
        <el-tab-pane label="收藏的歌单" name="second">
          <div class="created-container">
            <ListCard5 :list="data.collectedList" @clickListCardItem="clickListCardItem" :type="'user'"></ListCard5>
          </div>
        </el-tab-pane>
        <el-tab-pane label="创建的音乐专栏" name="third">
          <div class="music-container">
            暂无专栏
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<style lang="less" scoped>
.singer-detail-container {
  height: calc(100vh - 120px);

  .listInfo {
    display: flex;
    margin: 20px 30px;
  }

  .listAvatar {
    width: 180px;
    height: 180px;
    overflow: hidden;
    border-radius: 50%;
    margin-right: 15px;
  }

  .listAvatar img {
    width: 100%;
  }

  .right {
    width: calc(100% - 195px);

    .user-info {
      font-size: 13px;
      display: flex;
      margin: 10px 0;

      .vip {
        display: flex;
        align-items: center;
        padding: 0 10px;
        height: 20px;
        background-color: #030303;
        color: antiquewhite;
        border-radius: 10px;
        margin-right: 5px;
      }

      .icon {
        display: flex;
        text-align: center;
        padding-right: 10px;
        height: 20px;
        align-items: center;
        background-color: #FDE4E2;
        color: #F26AA3;
        border-radius: 10px;
        margin-right: 5px;

        img {
          height: 20px;
          width: 20px;
          margin-right: 3px;
        }
      }

      .level {
        display: flex;
        align-items: center;
        padding: 0 10px;
        height: 20px;
        background-color: #F0F0F0;
        border-radius: 10px;
        margin-right: 5px;
      }

      .gender {

        .male {
          height: 20px;
          width: 20px;
          background-color: #BFF3FF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            color: #74C3E3;
          }
        }

        .female {
          height: 20px;
          width: 20px;
          background-color: #FBC8E3;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            color: #EC7BAC;
          }
        }
      }
    }

    hr {
      opacity: 0.3;
    }

    .count {
      margin-top: 10px;
      display: flex;

      .eventCount {
        padding-right: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }

      .follows {
        padding: 0 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-left: 1px solid #E5E5E5;
        border-right: 1px solid #E5E5E5;
        cursor: pointer;
      }

      .followeds {
        padding-left: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }

      .num {
        color: #373737;
        font-size: 18px;
      }

      .type {
        color: #838383;
        font-size: 14px;
      }
    }

    .social,
    .intro {
      margin-top: 5px;

      >span {
        font-size: 13px;

        .content {
          color: #999999;
        }
      }
    }
  }

  .user-container {
    margin: 0 30px;
  }
  .music-container {
    text-align: center;
    margin-top: 100px;
    font-size: 13px;
    color: #373737;
  }
}

.title {
  display: flex;
  align-items: center;
}

.titleTag {
  font-size: 12px;
  color: #ec4141;
  border: 1px solid #ec4141;
  padding: 1px 2px;
  border-radius: 2px;
  margin-right: 5px;
  transform: scale(0.8);
}

.titleContent {
  font-size: 20px;
  font-weight: 600;
  color: #373737;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90%;
}
</style>