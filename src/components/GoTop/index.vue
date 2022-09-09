<script setup lang='ts'>
import { inject, onMounted, reactive } from 'vue'
interface RootObject {
  isGoTopShow: boolean;
  isFirstLoad: boolean;
  el: El;
}

interface El {
[x: string]: any;
  scrollTop: number;
}
const data: RootObject = reactive({
  // 是否显示改组件
  isGoTopShow: false,
  // 是否是第一次加载  第一次加载组件不需要添加hideBtn类
  isFirstLoad: true,
  el: { scrollTop: 0 }
})

const props = defineProps({
  scrollObj: {
    type: String,
    default: () => ""
  }
})

// const scrollObj = inject('scrollObj')
// console.log(window.document.getElementsByClassName('discover-content'));


const goTop = () => {
  data.el.scrollTo({
    behavior: "smooth",
    top: 0,
  });
}
onMounted(() => {
  let obj: any = {}
  if (props.scrollObj == "") {
    obj = document;
    data.el = document.documentElement;
  } else {
    obj = document.querySelector(props.scrollObj);
    data.el = obj;
  }

  obj.onscroll = (e: any) => {
    // console.log(e);
    // console.log(obj.scrollTop);
    if (data.el.scrollTop >= 500 && data.isGoTopShow == false) {
      data.isGoTopShow = true;
      data.isFirstLoad ? (data.isFirstLoad = false) : "";
    } else if (data.el.scrollTop < 500 && data.isGoTopShow) {
      data.isGoTopShow = false;
    }
  };

})
</script>
<template>
  <!-- 使用注意：滚动的盒子必须有个固定的高度，且设有 overflow-y:scroll; 否则会出现scrollTop=0的情况 -->
  <div class="GoTop" :class="data.isGoTopShow ? 'showBtn' : data.isFirstLoad ? '' : 'hideBtn'" @click="goTop">
    <i class="iconfont icon-fanhuidingbu"></i>
  </div>
</template>
<style scoped>
.GoTop {
  position: fixed;
  background-color: #f8f8f8;
  border-radius: 50%;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  cursor: pointer;
  bottom: -50px;
  right: 40px;
}

.showBtn {
  animation: showBtn 0.7s ease;
  animation-fill-mode: forwards;
}

.hideBtn {
  animation: hideBtn 0.3s ease-in;
  animation-fill-mode: forwards;
}

.GoTop i {
  font-size: 16px;
  color: #888;
}

.GoTop:hover {
  box-shadow: 0 20px 25px -8px rgba(0, 0, 0, 0.1),
    0 10px 10px -8px rgba(0, 0, 0, 0.04);
}

@keyframes showBtn {
  0% {
    bottom: -50px;
  }

  50% {
    bottom: 110px;
  }

  100% {
    bottom: 85px;
  }
}

@keyframes hideBtn {
  from {
    bottom: 85px;
  }

  to {
    bottom: -50px;
  }
}
</style>