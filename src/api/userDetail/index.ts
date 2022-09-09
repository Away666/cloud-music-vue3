import { request } from "@/utils/request";

// 获取用户信息
export const getUserInfoApi = (uid: any) => request("/user/detail", { uid })

// 获取用户歌单
export const getUserPlayListListApi = (uid: any) => request("/user/playlist", { uid })