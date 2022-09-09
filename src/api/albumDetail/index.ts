import { request } from "@/utils/request";

// 获取专辑内容
export const getAlbumInfoData = (id: any) => request('/album', { id })

// 获取专辑评论
export const getAlbumCommentData = (id: any, limit: number, offset: number, timestamp: any) => request("/comment/album", { id, limit, offset, timestamp })

// 获取专辑详情
export const getAlbumDetailData = (id: any) => request("/digitalAlbum/detail", { id })