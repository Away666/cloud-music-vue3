import { request } from '@/utils/request'

// 获取收藏的专辑的数据
export const getAlbumData = (timestamp: any) => request("/album/sublist", {
  limit: 1000,
  timestamp,
})

// 收藏/取消收藏专辑
export const subAlbumApi = (id: any, t: number) => request("/album/sub", { id, t })

// 获取收藏的歌手的数据
export const getSingerData = (timestamp: any) => request("/artist/sublist", { timestamp })

// 获取收藏的视频的数据
export const getVideoData = (limit: any, offset: any, timestamp: any) => request("/mv/sublist", {
  limit, offset, timestamp
});