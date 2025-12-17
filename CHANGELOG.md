# Changelog

所有版本的变更记录都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.0.4] - 2024-10-27

### 变更
- 重构代码结构，将代码拆分到 src/types、src/generators、src/utils 和 src/client 目录
- 优化项目文件组织，使代码结构更清晰、职责更明确
- 更新 README.md 和 README_EN.md 文档，添加语言切换功能

## [1.0.3] - 2024-10-27

### 修复
- 修复类型生成时的格式化问题

## [1.0.2] - 2024-10-27

### 新增
- 支持 CommonJS 模块格式

## [1.0.1] - 2024-10-27

### 修复
- 修复一些小的 bug

## [1.0.0] - 2024-10-27

### 新增
- 发布 vite-plugin-auto-api-types 插件
- 实现根据 API 响应自动生成 TypeScript 类型定义功能
- 支持自定义配置项
- 支持排除指定 URL
- 提供完整的中文文档
