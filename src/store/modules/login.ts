export default {
  namespaced: true,
  state: {
    isLogin: false,
    userInfo: {},
  },
  mutations: {
    LOGIN(state: any, payload: any) {
      state.isLogin = payload
    },
    GETUSERINFO(state: any, payload: any) {
      state.userInfo = payload
    }
  },
  actions: {
    login({ commit }: any, payload: any) {
      commit('LOGIN', payload)
    },
    getUserInfo({ commit }: any, payload: any) {
      commit('GETUSERINFO', payload)
    }
  }
}