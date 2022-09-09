import { request } from "@/utils/request";

// 轮播图数据
export const getBannerList = () => request('/banner')

// 推荐歌单数据
export const getRecommendList = (limit: number) => request("/personalized", { limit })

// 独家放送数据
export const getExclusiveList = (limit: number) => request("/personalized/privatecontent/list", {
  limit,
})

// 最新音乐数据
export const getNewestMusicList = () => request("/top/song")

// 歌单信息
export const getSongListInfo = (tag?: any) => request("/top/playlist/highquality", {
  limit: 1,
  cat: tag,
})

// 获取歌单分类
export const getSongListCategory = () => request("/playlist/catlist")

// 获取热门歌单分类
export const getHotSongListCategory = () => request("/playlist/hot")

// 获取所有歌单列表
export const getSongList = (tag: any, offset: any) => request("/top/playlist", {
  cat: tag,
  offset,
});

// 获取排行榜列表
export const getRankList = () => request("/toplist")

// 根据排行榜的id获取歌单列表
export const getRankSongListById = (id: number) => request("/playlist/detail", { id })

// 获取歌手数据列表
export const getSingerList = (area: any, type: any, initial: any, offset: any) => request("/artist/list", {
  area,
  type,
  initial,
  offset,
})