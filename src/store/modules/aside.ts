export default {
  namespaced: true,
  state: {
    createdMusicList: [],
    collectedMusicList: []
  },
  mutations: {
    GETCREATEDLIST(state: any, payload: any) {
      state.createdMusicList = payload
    },
    GETCOLLECTEDLIST(state: any, payload: any) {
      state.collectedMusicList = payload
    },
    UPDATECREATEDLIST(state: any, payload: any) {
      const list = JSON.parse(JSON.stringify(state.createdMusicList))
      // list.push(payload)
      list.splice(1, 0, payload)
      state.createdMusicList = list
    }
  },
  actions: {
    getCreatedList({ commit }: any, payload: any) {
      commit('GETCREATEDLIST', payload)
    },
    getCollectedList({ commit }: any, payload: any) {
      commit('GETCOLLECTEDLIST', payload)
    },
    updateCreatedList({ commit }: any, payload: any) {
      commit('UPDATECREATEDLIST', payload)
    }
  }
}

