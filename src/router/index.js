import { createRouter, createWebHistory } from 'vue-router'

const backendRoutes = [
  {
    path: '/back',
    name: 'back',
    redirect: '/back/dashboard',
    component: () => import('@/components/BackEndLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }
      },
      {
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare'
        }
      },
      {
        path: 'consultations',
        name: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        name: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'UserFilled'
        }
      }
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/components/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/Login.vue')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/Register.vue')
      }
    ]
  }
]

const frontRoutes = [
  {
    path: '/',
    name: 'front',
    component: () => import('@/components/FrontLayout.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...backendRoutes, ...frontRoutes]
})

// 路由前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isBackRoute = to.path.startsWith('/back')
  const isAuthRoute = to.path.startsWith('/auth')

  if (!token) {
    if (isBackRoute) {
      next('/auth/login')
      return
    }
    next()
    return
  }

  // 已登录后访问登录/注册页，重定向到后台首页
  if (isAuthRoute) {
    next('/back/dashboard')
    return
  }

  next()
})

export default router
