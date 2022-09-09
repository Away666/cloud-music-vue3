import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/index.vue'),
    redirect: '/discover',
    children: [
      {
        path: '/discover',
        name: 'discover',
        component: () => import('@/views/DisCover/index.vue'),
        redirect: '/discover/recommend',
        children: [
          {
            path: '/discover/recommend',
            name: 'recommend',
            component: () => import('@/views/DisCover/Recommend/index.vue')
          },
          {
            path: '/discover/songlist',
            name: 'songlist',
            component: () => import('@/views/DisCover/SongList/index.vue')
          },
          {
            path: '/discover/rank',
            name: 'rank',
            component: () => import('@/views/DisCover/Rank/index.vue')
          },
          {
            path: '/discover/singer',
            name: 'singer',
            component: () => import('@/views/DisCover/Singer/index.vue')
          },
        ]
      },
      {
        path: '/video',
        name: 'video',
        component: () => import('@/views/Video/index.vue'),
        redirect: '/video/videoList',
        children: [
          {
            path: '/video/videoList',
            name: 'videoList',
            component: () => import('@/views/Video/VideoList/index.vue')
          },
          {
            path: '/video/mvList',
            name: 'mvList',
            component: () => import('@/views/Video/MvList/index.vue')
          },
        ]
      },
      {
        path: '/videodetail/:id/:type',
        name: 'videodetail',
        component: () => import('@/views/VideoDetail/index.vue')
      },
      {
        path: '/songlistdetail/:id',
        name: 'songlistdetail',
        component: () => import('@/views/SongListDetail/index.vue')
      },
      {
        path: '/searchdetail/:keyWord',
        name: 'searchdetail',
        component: () => import('@/views/SearchDetail/index.vue')
      },
      {
        path: '/singerdetail/:id',
        name: 'singerdetail',
        component: () => import('@/views/SingerDetail/index.vue')
      },
      {
        path: '/userdetail/:id',
        name: 'userdetail',
        component: () => import('@/views/UserDetail/index.vue')
      },
      {
        path: '/albumdetail/:id',
        name: 'albumdetail',
        component: () => import('@/views/AlbumDetail/index.vue')
      },
      {
        path: '/allMvList',
        name: 'allmvlist',
        component: () => import('@/views/AllMvList/index.vue')
      },
      {
        path: '/allMvRank',
        name: 'allmvrank',
        component: () => import('@/views/AllMvRank/index.vue')
      },
      {
        path: '/collected',
        name: 'collected',
        component: () => import('@/views/Collected/index.vue'),
        redirect: '/collected/album',
        children: [
          {
            path: '/collected/album',
            name: 'collectedalbum',
            component: () => import('@/views/Collected/Album/index.vue')
          },
          {
            path: '/collected/singer',
            name: 'collectedsinger',
            component: () => import('@/views/Collected/Singer/index.vue')
          },
          {
            path: '/collected/video',
            name: 'collectedvideo',
            component: () => import('@/views/Collected/Video/index.vue')
          },
        ]
      },
      {
        path: '/recommend_music',
        name: 'recommendmusic',
        component: () => import('@/views/RecommendMusic/index.vue')
      },
      {
        path: '/history',
        name: 'history',
        component: () => import('@/views/History/index.vue')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
