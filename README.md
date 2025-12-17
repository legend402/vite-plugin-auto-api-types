# vite-plugin-auto-api-types

<div align="right">
  <a href="./README.md">中文</a> | <a href="./README_EN.md">English</a>
</div>

一个自动拦截前端请求、解析响应数据结构并生成 TypeScript 全局类型声明的 Vite 插件。无需手动编写 API 接口类型，开发过程中自动生成，大幅提升前端开发效率。

## 🌟 核心特性
- 🚀 **自动请求拦截**：支持拦截 `fetch` 和 `XMLHttpRequest` 发起的所有请求
- 📝 **自动类型生成**：解析 JSON 响应数据结构，自动生成对应的 TypeScript 类型
- 🌍 **全局类型声明**：生成 `.d.ts` 全局类型文件，无需手动导入即可使用类型提示
- ⚡ **无感知开发**：类型更新不触发页面刷新，不打断开发流程
- 🎯 **灵活配置**：支持排除指定 URL、自定义输出目录/文件名、防抖延迟等
- 🛡️ **稳定可靠**：完善的错误处理，拦截逻辑不影响原请求执行

## 📦 安装

```bash
# npm
npm install vite-plugin-auto-api-types --save-dev

# yarn
yarn add vite-plugin-auto-api-types -D

# pnpm
pnpm add vite-plugin-auto-api-types -D
```

## 🚀 使用

### 1. 基本配置（vite.config.ts）
```typescript
import { defineConfig } from 'vite';
import autoApiTypesPlugin from 'vite-plugin-auto-api-types';

export default defineConfig({
  plugins: [
    autoApiTypesPlugin({
      // 可选配置项
      outputDir: 'src/types',          // 类型文件输出目录，默认：types
      excludeUrls: [/^\/assets/, /\.(svg|png|jpg)$/], // 排除不需要拦截的URL
      typeFileName: 'auto-api-types.d.ts', // 生成的类型文件名，默认：api-types.d.ts
      debounceDelay: 1000 // 防抖延迟（ms），默认：1000
    })
  ]
});
```

### 2. 配置 tsconfig.json
确保 TypeScript 能识别生成的类型文件：
```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      "./src/types" // 对应插件的 outputDir 配置
    ],
    "types": ["auto-api-types"], // 显式引入生成的类型文件
    "strict": true // 建议开启严格模式，获得更好的类型提示
  },
  "include": [
    "src/**/*",
    "src/types/**/*.d.ts" // 包含生成的类型文件
  ]
}
```

### 3. 开发中使用
插件会自动拦截请求并生成类型，在代码中可直接使用生成的全局类型：
```typescript
// 假设请求了 /api/user 接口，会自动生成 Api_api_user 类型
async function getUser() {
  const res = await fetch('/api/user');
  const data = await res.json() as Api_api_user; // 自动提示类型
  
  // 可直接访问data的属性，拥有完整的TS类型提示
  console.log(data.id, data.name, data.age);
}

// 数组类型示例（如 /api/user/list）
async function getUserList() {
  const res = await fetch('/api/user/list');
  const data = await res.json() as Api_api_user_list; // 自动生成数组类型
  
  // 数组项拥有完整类型提示
  data.forEach(user => {
    console.log(user.id, user.name);
  });
}
```

## ⚙️ 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `outputDir` | `string` | `types` | 类型文件输出目录（相对于项目根目录） |
| `excludeUrls` | `RegExp[]` | `[]` | 排除拦截的 URL 正则列表（如静态资源、图片等） |
| `typeFileName` | `string` | `api-types.d.ts` | 生成的类型声明文件名 |
| `debounceDelay` | `number` | `1000` | 防抖延迟（ms），避免短时间内多次请求导致频繁写入文件 |

## 🎨 类型生成规则
1. **类型命名**：基于请求 URL 生成，规则如下：
    - 移除域名部分：`https://api.example.com/user` → `user`
    - 特殊字符替换为下划线：`/api/user/list?page=1` → `api_user_list`
    - 最终生成：`Api_${处理后的URL}` → `Api_api_user_list`
2. **基础类型映射**：
   | JavaScript 类型 | TypeScript 类型 |
   |----------------|----------------|
   | string | string |
   | number | number |
   | boolean | boolean |
   | null | null |
   | undefined | undefined |
   | object | 递归生成接口类型 |
   | array | 生成数组类型（如 `Type[]`） |
3. **复杂类型**：自动递归解析嵌套对象/数组结构，生成完整的类型声明。

## 🚫 排除URL示例
```typescript
autoApiTypesPlugin({
  excludeUrls: [
    /^\/assets/, // 排除/assets开头的请求
    /\.(svg|png|jpg|woff2)$/, // 排除图片/字体文件
    /^https?:\/\/cdn\.example\.com/, // 排除CDN请求
    /^\/api\/health/, // 排除健康检查接口
  ]
})
```

## 🛠️ 常见问题解决

### 1. 类型文件不更新
- 检查请求是否返回合法的 JSON 响应（响应头需包含 `Content-Type: application/json`）
- 确认请求 URL 未被 `excludeUrls` 排除
- 查看浏览器控制台是否有 `API类型更新通知失败` 调试日志
- 重启 Vite 开发服务器，确保插件正常加载

### 2. 类型提示不生效
- 执行 VS Code 命令：`TypeScript: Restart TS Server`（Ctrl+Shift+P）
- 检查 `tsconfig.json` 是否正确包含类型文件目录
- 手动打开生成的 `.d.ts` 文件，确认类型已正确生成

### 3. 页面意外刷新
- 插件已移除所有可能触发页面刷新的逻辑，若仍刷新：
    - 确保使用的是最新版本插件
    - 检查是否有其他插件/代码触发了页面刷新
    - 降低 `debounceDelay` 配置值（如 300ms）

### 4. 拦截逻辑影响请求正常执行
- 插件采用「克隆响应」方式解析数据，不会消费原响应
- 若请求异常，可通过 `excludeUrls` 临时排除该接口

## 📋 兼容性
- **Vite 版本**：支持 Vite 3.x / 4.x / 5.x
- **浏览器**：支持所有现代浏览器（Chrome/Firefox/Safari/Edge）
- **Node 版本**：Node 14+

## 📄 许可证
MIT License

## 📞 反馈与贡献
- 如有问题/建议，欢迎提交 Issue 或 PR
- 插件源码地址：[[GitHub 仓库地址]](https://github.com/legend402/vite-plugin-auto-api-types)

## ✨ 最佳实践
1. 仅在开发环境使用该插件（生产环境无需自动生成类型）
2. 开发完成后，可将生成的类型文件提交到代码仓库，供团队使用
3. 结合接口文档工具（如 Swagger）使用，双重保障类型准确性
4. 定期清理过时的类型声明，保持类型文件简洁
