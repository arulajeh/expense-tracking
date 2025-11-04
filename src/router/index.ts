import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: () => import('@/views/Tabs.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('@/views/Transactions.vue')
      },
      {
        path: 'add-transaction',
        name: 'AddTransaction',
        component: () => import('@/views/AddTransaction.vue')
      },
      {
        path: 'edit-transaction/:id',
        name: 'EditTransaction',
        component: () => import('@/views/EditTransaction.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  const isAuthenticated = !!token;

  // Route yang butuh auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Route untuk guest (login/register) - kalo udah login redirect ke dashboard
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard');
    return;
  }

  next();
});

export default router;