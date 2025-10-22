import { createRouter, createWebHistory } from 'vue-router'
import ChatPage from '@/views/ChatPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: ChatPage
    },
    // Old pages disabled for now due to slow queries on large dataset
    // Can be re-enabled later with optimized queries
    // {
    //   path: '/overview',
    //   name: 'overview',
    //   component: () => import('@/views/OverviewPage.vue')
    // },
    // {
    //   path: '/timeseries',
    //   name: 'timeseries',
    //   component: () => import('@/views/TimeSeriesPage.vue')
    // },
    // {
    //   path: '/product-origin',
    //   name: 'product-origin',
    //   component: () => import('@/views/ProductOriginPage.vue')
    // }
  ],
})

export default router
