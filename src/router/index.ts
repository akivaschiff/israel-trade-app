import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/views/DashboardLayout.vue'
import OverviewPage from '@/views/OverviewPage.vue'
import ProductOriginPage from '@/views/product-origins/ProductOriginPage.vue'
import ChatPage from '@/views/ChatPage.vue'
import WorldMapPage from '@/views/world-map/WorldMapPage.vue'
import TrendsPage from '@/views/trends/TrendsPage.vue'
import HSCodeExplorer from '@/views/HSCodeExplorer.vue'

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
          path: 'product-origin',
          name: 'product-origin',
          component: ProductOriginPage
        },
        {
          path: 'world-map',
          name: 'world-map',
          component: WorldMapPage
        },
        {
          path: 'trends',
          name: 'trends',
          component: TrendsPage
        },
        {
          path: 'hs-explorer',
          name: 'hs-explorer',
          component: HSCodeExplorer
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
