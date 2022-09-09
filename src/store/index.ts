import { createStore } from 'vuex'
import aside from './modules/aside'
import login from './modules/login'
import songList from './modules/songList'
import video from './modules/video'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    aside,
    login,
    songList,
    video
  }
})
