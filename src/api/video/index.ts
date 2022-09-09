import { request } from '@/utils/request'

// 获取全部视频的标签
export const getVideoAllTag = () => request("/video/group/list")

// 获取热门视频的标签
export const getVideoHotTag = () => request("/video/category/list")

// 获取全部视频的数据
export const getVideoAllData = (offset: number, timestamp?: any) => request("/video/timeline/all", {
  offset, timestamp
})

// 获取某个标签的视频数据
export const getVideoTagData = (id: any, offset: any, timestamp?: any) => request("/video/group", {
  id, offset, timestamp
})

// 获取最新mv的数据
export const getNewestMvData = (area?: any) => request("/mv/first", {
  area,
  limit: 8,
});

// 获取推荐MV的数据
export const getExclusiveMvData = () => request("/mv/exclusive/rcmd", {
  limit: 8
})

// 获取MV排行榜的数据
export const getRankMvData = (limit: number, area?: any) => request("/top/mv", {
  limit, area
})

// 获取全部mv数据
export const getAllMvData = (area: any, type: any, order: any, limit: any, offset: any) => request("/mv/all", {
  area, type, order, limit, offset
})

// 获取mv详情
export const getMvDetailData = (mvid: any) => request("/mv/detail", {
  mvid,
})

// 获取mv播放路径
export const getMvUrl = (id: any) => request("/mv/url", { id })

// 获取mv的评论
export const getMvComment = (id: any, offset: any, timestamp: any) => request("/comment/mv", {
  id, offset, timestamp,
})

// 获取视频详情
export const getVideoDetailData = (id: any) => request("/video/detail", {
  id,
});

// 获取video播放路径
export const getVideoUrl = (id: any) => request("/video/url", {
  id
})

// 获取视频的评论
export const getVideoComment = (id: any, offset: any, timestamp: any) => request("/comment/video", {
  id, offset, timestamp,
})

// 获取收藏的视频和MV
export const getMvSubList = (timestamp: any) => request("/mv/sublist", { limit: 1000, timestamp })

// 获取点赞过的视频
export const getMvLikeList = (timestamp: any) => request("/playlist/mylike", {
  limit: 1000,
  timestamp,
})

// 将 mlog id 转为视频 id
export const mlogToVideoId = (id: any, timestamp: any) => request("/mlog/to/video", { id, timestamp })

// 点击video里的收藏
export const videoSub = (id: any, t: any, timestamp: any) => request("/video/sub", {
  id, t, timestamp
});

// mv收藏
export const mvSub = (mvid: any, t: any, timestamp: any) => request("/mv/sub", {
  mvid, t, timestamp,
})

// 点赞
export const videoLike = (type: any, id: any, t: any, timestamp: any) => request("/resource/like", {
  type, id, t, timestamp,
})

// 获取相关视频
export const getRelatedVideo = (id: any) => request("/related/allvideo", {
  id
});