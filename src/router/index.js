// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ChatView from '../views/ChatView.vue'; // Компонент для страницы чата

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true } // Мета-поле для обозначения защищенных роутов
  },
  // Перенаправление на главную страницу, если роут не найден
  {
    path: '/:catchAll(.*)', // Регулярное выражение для всех остальных путей
    redirect: '/',
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'), // Используем BASE_URL если задан (для Vite)
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Позволяет восстановить позицию прокрутки при навигации назад/вперед
    if (savedPosition) {
      return savedPosition;
    }
    // Если есть хеш (якорь), прокручиваем к нему
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    // В остальных случаях прокручиваем наверх страницы
    return { left: 0, top: 0, behavior: 'smooth' };
  }
});

// Навигационный страж (Navigation Guard)
router.beforeEach((to, from, next) => {
  console.log('router.beforeEach: Navigating from', from.name, 'to', to.name);
  const isAuthenticated = !!localStorage.getItem('AccessToken');
  console.log('router.beforeEach: isAuthenticated (from localStorage):', isAuthenticated);

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  console.log('router.beforeEach: Target route', to.name, 'requires auth:', requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    console.log('router.beforeEach: Redirecting to Home (auth required, but not authenticated)');
    next({ name: 'Home' });
  } else {
    console.log('router.beforeEach: Allowing navigation to', to.name);
    next();
  }
});

export default router;
