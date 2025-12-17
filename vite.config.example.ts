import { defineConfig } from 'vite'
import autoApiTypes from './src'

export default defineConfig({
  plugins: [
    autoApiTypes({
      // 可选配置项
      outputDir: 'src/types',          // 类型文件输出目录，默认：types
      excludeUrls: [/^\/assets/, /\.(svg|png|jpg)$/], // 排除不需要拦截的URL
      typeFileName: 'auto-api-types.d.ts', // 生成的类型文件名，默认：api-types.d.ts
      debounceDelay: 500, // 防抖延迟（ms），默认：500
      // 局部类型生成示例：只提取API响应中的result.records部分
      // 对于响应格式：{ success: true, result: { records: [] } }，只生成records的类型
      responsePath: 'result.records'
    })
  ]
})