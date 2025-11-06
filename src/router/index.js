import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 路由配置
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
    },
    {
        path: '/posts',
        name: 'PostList',
        component: () => import('@/views/PostList.vue'),
        meta: { title: '文章列表' }
    },
    {
        path: '/posts/:id',
        name: 'PostDetail',
        component: () => import('@/views/PostDetail.vue'),
        meta: { title: '文章详情' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: { title: '注册' }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true }
    },
    {
        path: '/my-posts',
        name: 'MyPosts',
        component: () => import('@/views/MyPosts.vue'),
        meta: { title: '我的文章', requiresAuth: true }
    },
    {
        path: '/editor',
        name: 'PostEditor',
        component: () => import('@/views/PostEditor.vue'),
        meta: { title: '写文章', requiresAuth: true }
    },
    {
        path: '/editor/:id',
        name: 'PostEdit',
        component: () => import('@/views/PostEditor.vue'),
        meta: { title: '编辑文章', requiresAuth: true }
    },
    // {
    //     path: '/favorites',
    //     name: 'Favorites',
    //     component: () => import('@/views/Favorites.vue'),
    //     meta: { title: '我的收藏', requiresAuth: true }
    // },
    // {
    //     path: '/notifications',
    //     name: 'Notifications',
    //     component: () => import('@/views/Notifications.vue'),
    //     meta: { title: '通知中心', requiresAuth: true }
    // }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 码农小胡的技术栈` : '我的博客'

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.warning('请先登录')
            next({ name: 'Login', query: { redirect: to.fullPath } })
            return
        }
    }

    next()
})

export default router