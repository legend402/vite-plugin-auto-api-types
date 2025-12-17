# Changelog

所有版本的变更记录都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [1.0.5] - 2025-12-17

### 新增
- 添加 CHANGELOG.md 文件以跟踪版本变更
- 更新 package.json 中的 test 脚本，使用 npx tsx 运行测试文件

## [1.0.6] - 2025-12-17
### Added
- 实现模块化类型文件生成功能
- 在AutoApiTypesPluginOptions中添加moduleMap配置项
- 支持根据URL前缀将API类型分组到不同的模块文件中

## [1.0.7] - 2025-12-17
### Added
- 支持将模块化类型文件单独放到指定的子目录中
- 新增moduleDir配置项，用于指定模块化类型文件存放的文件夹名称
- 保持默认类型文件在原目录，只将模块化文件移动到子目录

## [1.0.4] - 2025-12-17

### 变更
- 重构代码结构，将代码拆分到 src/types、src/generators、src/utils 和 src/client 目录
- 优化项目文件组织，使代码结构更清晰、职责更明确
- 更新 README.md 和 README_EN.md 文档，添加语言切换功能

## [1.0.3] - 2025-12-17

### 修复
- 修复类型生成时的格式化问题

## [1.0.2] - 2025-12-17

### 新增
- 支持 CommonJS 模块格式

## [1.0.1] - 2025-12-16

### 修复
- 修复一些小的 bug

## [1.0.0] - 2025-12-16

### 新增
- 发布 vite-plugin-auto-api-types 插件
- 实现根据 API 响应自动生成 TypeScript 类型定义功能
- 支持自定义配置项
- 支持排除指定 URL
- 提供完整的中文文档
