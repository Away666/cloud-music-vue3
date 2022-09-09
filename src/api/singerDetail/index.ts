import { request } from "@/utils/request";

// 获取歌手的详细信息
export const getSingerDetailData = (id: any) => request("/artist/detail", {
  id
});

// 获取收藏的歌手列表
export const getSubSingerList = (limit: any, timestamp: any) => request("/artist/sublist", {
  limit, timestamp,
})

// 收藏获取取消收藏歌手
export const updateSubSinger = (id: any, t: any) => request("/artist/sub", {
  id, t,
})

// 获取歌手描述
export const getSingerDescData = (id: any) => request("/artist/desc", { id })

// 获取歌手专辑
export const getSingerAlbumData = (id: any, offset: number, timestamp: any) => request("/artist/album", { id, offset, timestamp })

// 获取歌手热门50首歌曲
export const getSingerTop50Data = (id: any) => request("/artist/top/song", { id })

// 获取歌手专辑内容
export const getSingerAlbumDetail = (id: any) => request("/album", { id })

// 获取歌手mv列表
export const getSingerMvList = (id: any) => request("/artist/mv", { id })

// 获取相似歌手
export const getSimiSingerList = (id: any) => request("/simi/artist", { id })