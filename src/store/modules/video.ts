export default {
  namespaced: true,
  state: {
    videoList: [], // 播放列表 
  },
  mutations: {
    GETMUSICID(state: any, payload: any) {
      state.musicId = payload
    },
    UPDATEVIDEOLIST(state: any, payload: any) {
      state.videoList = payload
    },
    ADDTOSONGLIST(state: any, payload: any) {
      state.allSongListId.push(payload.songListId)
      let currentIndex: number
      state.songList.forEach((item: any, i: number) => {
        if (item.id == state.musicId)
          currentIndex = i
      })
      payload.songList.forEach((item: any, i: number) => {
        state.songList.splice(currentIndex + i + 1, 0, item)
      })

      // state.songList = state.songList.splice(currentIndex, 0, payload.songList)
      // 这个是把新的歌单加到旧的歌单的最后一首的下面,而需求是把新歌单加到正在播放的那首歌的下面
      // const arr = state.songList.concat(payload.songList)
      // state.songList = arr
    }
  },
  actions: {
    getMusicId({ commit }: any, payload: any) {
      commit('GETMUSICID', payload)
    },
    updateVideoList({ commit }: any, payload: any) {
      commit('UPDATEVIDEOLIST', payload)
    },
    addToSongList({ commit }: any, payload: any) {
      commit('ADDTOSONGLIST', payload)
    }
  }
}
