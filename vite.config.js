import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
    plugins: [vue()],

    // 路径别名
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },

    // 开发服务器配置
    server: {
        port: 5173,
        // 配置代理，解决跨域问题
        proxy: {
            '/api': {
                target: 'http://47.109.37.230:8081',  // 你的后端地址
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})