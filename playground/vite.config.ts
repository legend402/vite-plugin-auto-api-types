import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoApiTypes from '../dist'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    autoApiTypes({
      // 可选配置项
      outputDir: 'src/types',          // 类型文件输出目录，默认：types
      excludeUrls: [/^\/assets/, /\.(svg|png|jpg)$/], // 排除不需要拦截的URL
      typeFileName: 'auto-api-types.d.ts', // 生成的类型文件名，默认：api-types.d.ts
      debounceDelay: 500, // 防抖延迟（ms），默认：500
      moduleMap: {
        '/users': 'users',
      },
      moduleDir: 'autoApi',
      responsePath: 'result',
      typeNameGenerator: (url: string) => {
        const path = url.split('/').filter(Boolean);
        return path.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('_');
      }
    })
  ],
})
