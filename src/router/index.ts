import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/views/DashboardLayout.vue'
import HomePage from '@/views/HomePage.vue'
import WorldMapPage from '@/views/world-map/WorldMapPage.vue'
import TrendsPage from '@/views/trends/TrendsPage.vue'
import AIPage from '@/views/AIPage.vue'
import InsightsPage from '@/views/InsightsPage.vue'
import AboutPage from '@/views/AboutPage.vue'
import ContactPage from '@/views/ContactPage.vue'
import { usePostHog } from '@/composables/usePostHog'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: HomePage
        },
        {
          path: 'world-map',
          name: 'world-map',
          component: WorldMapPage
        },
        {
          path: 'trade-lookup',
          name: 'trade-lookup',
          component: TrendsPage
        },
        {
          path: 'ai-chat',
          name: 'ai-chat',
          component: AIPage
        },
        {
          path: 'insights',
          name: 'insights',
          component: InsightsPage
        },
        {
          path: 'about',
          name: 'about',
          component: AboutPage
        },
        {
          path: 'contact',
          name: 'contact',
          component: ContactPage
        },
      ]
    },
    {
      path: '/test-selector',
      name: 'test-selector',
      component: () => import('@/views/ProductSelectorTest.vue')
    }
  ],
})

const { posthog } = usePostHog()

export default router
