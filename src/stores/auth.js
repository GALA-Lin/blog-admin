import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, logout as logoutApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    // 状态
    const token = ref(localStorage.getItem('token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

    // 计算属性
    const isLoggedIn = computed(() => !!token.value)
    const userId = computed(() => userInfo.value?.id)
    const username = computed(() => userInfo.value?.username)
    const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username)
    const avatar = computed(() => userInfo.value?.avatarUrl)

    // 登录
    const login = async (loginForm) => {
        try {
            const data = await loginApi(loginForm)

            // 保存 token 和用户信息
            token.value = data.token
            userInfo.value = data.userInfo

            localStorage.setItem('token', data.token)
            localStorage.setItem('userInfo', JSON.stringify(data.userInfo))

            ElMessage.success('登录成功')

            // 跳转到之前的页面或首页
            const redirect = router.currentRoute.value.query.redirect || '/'
            router.push(redirect)

            return data
        } catch (error) {
            ElMessage.error(error.message || '登录失败')
            throw error
        }
    }

    // 注册
    const register = async (registerForm) => {
        try {
            await registerApi(registerForm)
            ElMessage.success('注册成功，请登录')
            router.push('/login')
        } catch (error) {
            ElMessage.error(error.message || '注册失败')
            throw error
        }
    }

    // 登出
    const logout = async () => {
        try {
            if (token.value) {
                await logoutApi()
            }
        } catch (error) {
            console.error('登出失败', error)
        } finally {
            // 清除本地数据
            token.value = ''
            userInfo.value = null
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')

            ElMessage.success('已退出登录')
            router.push('/login')
        }
    }

    // 更新用户信息
    const updateUserInfo = (newUserInfo) => {
        userInfo.value = { ...userInfo.value, ...newUserInfo }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    return {
        token,
        userInfo,
        isLoggedIn,
        userId,
        username,
        nickname,
        avatar,
        login,
        register,
        logout,
        updateUserInfo
    }
})