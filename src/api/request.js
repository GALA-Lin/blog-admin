import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from 'vue-router'

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',  // 通过 Vite 代理转发到后端
    timeout: 10000    // 请求超时时间=10s
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const { code, message, data } = response.data

        // 根据你后端的 Result 结构判断
        if (code === 200) {
            return data  // 直接返回数据部分
        } else {
            ElMessage.error(message || '请求失败')
            return Promise.reject(new Error(message))
        }
    },
    error => {
        if (error.response) {
            const { status } = error.response

            switch (status) {
                case 401:
                    ElMessage.error('未登录或登录已过期')
                    localStorage.removeItem('token')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('没有权限')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器错误')
                    break
                default:
                    ElMessage.error(error.response.data.message || '请求失败')
            }
        } else {
            ElMessage.error('网络错误，请检查网络连接')
        }

        return Promise.reject(error)
    }
)

export default request