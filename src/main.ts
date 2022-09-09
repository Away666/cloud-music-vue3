import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/assets/css/globle.css'
import '@/styles/index.less'
import App from './App.vue'
import router from './router'
import store from './store'
import { request } from './utils/request'
import VueLazyload from 'vue-lazyload'
import { MouseMenuDirective } from '@howdyjs/mouse-menu'

const app = createApp(App)
app.use(ElementPlus)
app.use(store)
app.use(router)
app.use(VueLazyload, {
  preLoad: 1.3,
  error: require('./assets/images/imgLoading.png'),
  loading: require('./assets/images/imgLoading.png'),
  attempt: 1
})
app.directive('MouseMenu', MouseMenuDirective)


// Icon图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
app.config.globalProperties.$http = request

