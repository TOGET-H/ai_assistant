import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://159.75.169.224:1235/api', // 后端服务器地址
        changeOrigin: true, // 是否改变请求头中的origin字段
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径，将/api替换为空
      }
    }
  }
})