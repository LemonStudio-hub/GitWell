import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('../pages/Compare.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL ?? '/'),
  routes,
})

export default router