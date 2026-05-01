import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RiesgoCardiovascularView from '../views/EnCardio.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'inicio',
      component: HomeView,
    },
    {
      path: '/riesgo-cardiovascular',
      name: 'riesgo-cardiovascular',
      component: RiesgoCardiovascularView,
    },
  ],
})

export default router