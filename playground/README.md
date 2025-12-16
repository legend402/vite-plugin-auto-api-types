# API Type Generator Playground

这是一个用于测试和演示 `vite-plugin-auto-api-types` 插件的React + TypeScript + Vite项目。

## 快速开始

### 1. 安装依赖

```bash
# 在playground目录下运行
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
playground/
├── src/
│   ├── api/           # API服务文件
│   │   ├── userApi.ts      # 用户API
│   │   └── productApi.ts   # 产品API
│   ├── types/         # 自动生成的API类型（由插件生成）
│   ├── App.tsx        # 主应用组件
│   ├── App.css        # 应用样式
│   └── main.tsx       # 应用入口
├── vite.config.ts     # Vite配置（包含插件配置）
└── package.json       # 项目依赖
```
```typescript
import autoApiTypes from '../src'

export default defineConfig({
  plugins: [
    react(),
    autoApiTypes({
      // 可选配置项
      outputDir: 'src/types',          // 类型文件输出目录，默认：types
      excludeUrls: [/^\/assets/, /\.(svg|png|jpg)$/], // 排除不需要拦截的URL
      typeFileName: 'auto-api-types.d.ts', // 生成的类型文件名，默认：api-types.d.ts
      debounceDelay: 500 // 防抖延迟（ms），默认：500
    })
  ],
})
```

## 如何测试插件功能

1. 运行开发服务器：`npm run dev`
2. 观察 `src/types` 目录，插件会自动生成API类型文件
3. 修改 `src/api` 目录下的API文件，查看类型是否自动更新
4. 在 `App.tsx` 中使用API，体验类型提示和自动补全

## React + TypeScript + Vite 基础信息

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
