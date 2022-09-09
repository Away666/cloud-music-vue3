export default {
  namespaced: true,
  state: {
    musicId: '', // 歌曲的id
    songListId: '', // 歌单的id
    songList: [], // 播放列表 
    allSongListId: [], // 收集所有添加歌单的id，避免重复添加歌单
    isPlaying: false, // 是否是播放
    likeMusicList: [], // 喜欢的歌曲列表
    isShowMusicDetail: false,
    currentPlayTime: 0
  },
  mutations: {
    GETMUSICID(state: any, payload: any) {
      state.musicId = payload
    },
    UPDATESONGLIST(state: any, payload: any) {
      state.songList = payload.songList
      state.songListId = payload.songListId
      const a = state.allSongListId.indexOf(payload.songListId)
      if (a == -1) {
        state.allSongListId.push(payload.songListId)
      }
    },
    ADDTOSONGLIST(state: any, payload: any) {
      state.allSongListId.push(payload.songListId)
      let currentIndex = 0
      // 使用深拷贝，不然会污染歌单的数据
      const list = JSON.parse(JSON.stringify(state.songList))
      // 找到正在播放的歌的位置
      list.forEach((item: any, i: number) => {
        if (item.id == state.musicId)
          currentIndex = i
      })
      payload.songList.forEach((item: any, i: number) => {
        list.splice(currentIndex + i + 1, 0, item)
      })
      state.songList = list

      // state.songList = state.songList.splice(currentIndex, 0, payload.songList)
      // 这个是把新的歌单加到旧的歌单的最后一首的下面,而需求是把新歌单加到正在播放的那首歌的下面
      // const arr = state.songList.concat(payload.songList)
      // state.songList = arr
    },
    UPDATEPLAYSTATE(state: any, payload: any) {
      state.isPlaying = payload
    },
    GETLIKEMUSICLIST(state: any, payload: any) {
      state.likeMusicList = payload
    },
    UPDATELIKEMUSICLIST(state: any, payload: any) {
      if (payload.type === 'add') {
        const list = JSON.parse(JSON.stringify(state.likeMusicList))
        list.push(payload.id)
        state.likeMusicList = list
      } else {
        state.likeMusicList = state.likeMusicList.filter((item: any, index: number) => {
          return item !== payload.id
        })
      }
    },
    CLEARSONGLIST(state: any, payload: any) {
      state.musicId = ''
      state.songListId = ''
      state.isPlaying = false
      state.songList = []
      state.allSongListId = []
    },
    UPDATEMUSICDETAILSTATE(state: any, payload: any) {
      state.isShowMusicDetail = payload
    },
    UPDATECURRENTPLAYTIME(state: any, payload: any) {
      state.currentPlayTime = payload
    },
  },
  actions: {
    getMusicId({ commit }: any, payload: any) {
      commit('GETMUSICID', payload)
    },
    updateSongList({ commit }: any, payload: any) {
      commit('UPDATESONGLIST', payload)
    },
    addToSongList({ commit }: any, payload: any) {
      commit('ADDTOSONGLIST', payload)
    },
    updatePlayState({ commit }: any, payload: any) {
      commit('UPDATEPLAYSTATE', payload)
    },
    getLikeMusicList({ commit }: any, payload: any) {
      commit('GETLIKEMUSICLIST', payload)
    },
    updateLikeMusicList({ commit }: any, payload: any) {
      commit('UPDATELIKEMUSICLIST', payload)
    },
    clearSongList({ commit }: any, payload: any) {
      commit('CLEARSONGLIST', payload)
    },
    updateMusicDetailState({ commit }: any, payload: any) {
      commit('UPDATEMUSICDETAILSTATE', payload)
    },
    updateCurrentPlayTime({ commit }: any, payload: any) {
      commit('UPDATECURRENTPLAYTIME', payload)
    }
  }
}
