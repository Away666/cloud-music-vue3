import { request } from "@/utils/request";

// 获取歌单的信息
export const getSongListInfo = (id: any, timestamp: any) => request("/playlist/detail", {
  id,
  timestamp,
})

// 获取收藏的歌单
export const subSongList = (id: any, t: any, timestamp: any,) => request("/playlist/subscribe", {
  id, t, timestamp,
})

// 修改歌单名
export const updateSongListName = (id: any, name: any) => request("/playlist/name/update", { id, name })

// 删除歌单
export const delSongList = (id: any) => request("/playlist/delete", { id })

// 获取歌单的歌曲
export const getMusics = (ids: any) => request("/song/detail", { ids })

// 获取我喜欢的音乐
export const getLikeMusics = (uid: any, timestamp: any) => request("/likelist", {
  uid,
  timestamp,
})

// 取消喜欢或者喜欢
export const like = (id: any, like: any, timestamp: any) => request("/like", { id, like, timestamp })

// 获取歌单的评论
export const getSongListComment = (id: any, offset: number, limit: number, timestamp: any) => request("/comment/playlist", {
  id,
  offset,
  limit,
  timestamp
})

// 评论或者回复
export const sendCommentApi = (t: any, id: any, type: any, content: any, commentId?: any) => request("/comment", {
  t, id, type, content, commentId
})

// 给评论点赞
export const likeCurrentCommentApi = (id: any, cid: any, t: any, type: any, timestamp: any) => request("/comment/like", {
  id, cid, t, type, timestamp,
})

// 获取收藏者
export const getSubscribersApi = (id: any, offset: any, limit: any) => request("/playlist/subscribers", {
  id, offset, limit
});

// 对歌单添加或删除歌曲  op: 从歌单增加单曲为 add, 删除为 del
export const addOrDelSongApi = (op: any, pid: any, tracks: any) => request("/playlist/tracks", { op, pid, tracks })

// 获取音乐的url
export const getMusicUrl = (id: any, level: any) => request("/song/url/v1", { id, level })

// 获取歌词
export const getIyricApi = (id: any) => request("/lyric", { id })

// 获取某首歌曲的评论
export const getMusicComment = (id: any, offset: number, limit: number, timestamp: any) => request("/comment/music", {
  id,
  offset,
  limit,
  timestamp
})