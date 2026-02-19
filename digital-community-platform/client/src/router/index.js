import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 无需登录的页面
    { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/Login.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/Register.vue') },
    { path: '/function', name: 'function', component: () => import('@/views/Function.vue') },
    
    // 需要登录的页面
    { path: '/friend', name: 'friend', component: () => import('@/views/Friend.vue'), meta: { requiresAuth: true } },
    { path: '/forum', name: 'forum', component: () => import('@/views/Forum.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('@/views/Profile.vue'), meta: { requiresAuth: true } },
    
    // 404页面
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

// 路由守卫：检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login'); // 未登录跳转到登录页
  } else {
    next(); // 已登录/无需登录，放行
  }
});

export default router;