import { request } from '@/utils/request'

export const getAsideList = (uid: any, timestamp: any) => request("/user/playlist", { uid, timestamp })

// 新建歌单
// '10'则设置成隐私歌单
export const createNewSongList = (name: string, privacy?: number) => request("/playlist/create", { name, privacy })