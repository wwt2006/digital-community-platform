// client/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 引入 path 模块（用于解析路径）
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 注册 Vue 插件
  plugins: [vue()],
  // 配置路径别名
  resolve: {
    alias: {
      // 把 @ 映射到 src 目录（解决找不到 @/utils/request 的问题）
      '@': resolve(__dirname, 'src')
    }
  },
  // 配置前端服务端口（可选，避免和后端冲突）
  server: {
    port: 5173, // 前端启动端口
    open: true, // 启动后自动打开浏览器
    // 解决跨域（前端请求后端接口时用）
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端接口地址
        changeOrigin: true, // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径（可选）
      }
    }
  }
})