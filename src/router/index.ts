import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/views/DashboardLayout.vue'
import WorldMapPage from '@/views/world-map/WorldMapPage.vue'
import AboutPage from '@/views/AboutPage.vue'

// Hidden imports (kept for later):
// import ProductOriginPage from '@/views/product-origins/ProductOriginPage.vue'
// import ChatPage from '@/views/ChatPage.vue'
// import TrendsPage from '@/views/trends/TrendsPage.vue'
// import HSCodeLookupPage from '@/views/HSCodeLookupPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/world-map'
    },
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: 'world-map',
          name: 'world-map',
          component: WorldMapPage
        },
        {
          path: 'about',
          name: 'about',
          component: AboutPage
        },
        // Hidden routes (kept for later):
        // {
        //   path: 'product-origin',
        //   name: 'product-origin',
        //   component: ProductOriginPage
        // },
        // {
        //   path: 'trends',
        //   name: 'trends',
        //   component: TrendsPage
        // },
        // {
        //   path: 'hs-lookup',
        //   name: 'hs-lookup',
        //   component: HSCodeLookupPage
        // },
        // {
        //   path: 'hs-lookup/:conversationId',
        //   name: 'hs-lookup-conversation',
        //   component: HSCodeLookupPage
        // },
        // {
        //   path: 'chat',
        //   name: 'chat',
        //   component: ChatPage
        // },
        // {
        //   path: 'chat/:conversationId',
        //   name: 'chat-conversation',
        //   component: ChatPage
        // }
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
