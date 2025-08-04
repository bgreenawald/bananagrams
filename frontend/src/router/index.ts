import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
  },
  {
    path: '/lobby/:id',
    name: 'lobby',
    component: () => import('@/views/LobbyView.vue'),
  },
  {
    path: '/game/:id',
    name: 'game',
    component: () => import('@/views/GameView.vue'),
  },
  {
    path: '/gameover/:id',
    name: 'gameover',
    component: () => import('@/views/GameOverView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

export default router
