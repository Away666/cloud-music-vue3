import axios from 'axios'
import { ElMessage } from 'element-plus';

export const request = (url: any, params?: any) => {
  const instance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true,
  });
  // 请求拦截
  instance.interceptors.request.use(config => {
    // console.log('请求拦截器');
    return config
  }, err => {
    return err
  });

  // 响应拦截
  instance.interceptors.response.use(config => {
    return config;
  }, err => {
    if (err.response.data.msg == '需要登录') {
      console.log("我需要登录");

      // cookie过期 退出登录
      // console.log(window.localStorage.getItem("userInfo"));
      window.localStorage.setItem("userInfo", "");
      // 刷新页面
      // history.go(0)
      // 修改当前的登录状态
      // vuex.state.isLogin = false;
    } else {
      ElMessage({
        type: 'error', message: err.response.data.message
      })
      return err.response.data.message
    }
  });
  if (params) {
    params = {
      params: params
    }
    return instance.get(url, params)
  } else {
    return instance.get(url)
  }
}