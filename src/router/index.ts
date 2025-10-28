import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/views/DashboardLayout.vue'
import OverviewPage from '@/views/OverviewPage.vue'
import TimeSeriesPage from '@/views/TimeSeriesPage.vue'
import ProductOriginPage from '@/views/ProductOriginPage.vue'
import ChatPage from '@/views/ChatPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview'
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: 'overview',
          name: 'overview',
          component: OverviewPage
        },
        {
          path: 'timeseries',
          name: 'timeseries',
          component: TimeSeriesPage
        },
        {
          path: 'product-origin',
          name: 'product-origin',
          component: ProductOriginPage
        },
        {
          path: 'chat',
          name: 'chat',
          component: ChatPage
        },
        {
          path: 'chat/:conversationId',
          name: 'chat-conversation',
          component: ChatPage
        }
      ]
    },
    {
      path: '/test-selector',
      name: 'test-selector',
      component: () => import('@/views/ProductSelectorTest.vue')
    }
  ],
})

export default router
