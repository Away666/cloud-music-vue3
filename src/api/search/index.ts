import { request } from '@/utils/request'

export const getSearchList = (keywords: any) => request("/search/suggest", { keywords })

// 获取你可能感兴趣的数据
export const getInterestData = (keywords: any) => request("/search/multimatch", { keywords })

// 获取数据列表
// 默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户,  1014: 视频
export const getAllData = (keywords: any, limit: any, offset: any, type: any) => request("/cloudsearch", { keywords, limit, offset, type })