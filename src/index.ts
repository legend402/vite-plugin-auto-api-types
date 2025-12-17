// vite-plugin-auto-api-types.ts
import type { Plugin, IndexHtmlTransformHook } from 'vite';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { getClientScript } from './client';
import { generateSafeTypeName, debounce, TypeWorkerManager, LRUCache } from './utils';
import type { AutoApiTypesPluginOptions } from './types';

// 插件主函数
export default function autoApiTypesPlugin(options: AutoApiTypesPluginOptions = {}): Plugin {
    // 默认配置
    const {
        outputDir = 'types',
        excludeUrls = [],
        typeFileName = 'api-types.d.ts',
        debounceDelay = 1000,
        moduleMap = {},
        moduleDir = '',
        typeNameGenerator = generateSafeTypeName,
        cacheSize = 100
    } = options;

    // 存储API类型记录（使用LRU缓存优化内存使用）
    const apiTypes = new LRUCache(cacheSize);
    let outputPath = '';
    let typeWorker: TypeWorkerManager | null = null;

    // 工具函数：更新API类型
    const updateApiType = debounce(async (url: string, data: any) => {
        if (!typeWorker) return;
        
        // 生成唯一的类型名称（优先使用用户自定义的规则）
        const typeName = typeNameGenerator(url);

        // 使用Worker异步生成类型字符串
        const typeStr = await typeWorker.generateType(typeName, data);

        if (typeStr) {
            // 防抖：1秒内不重复更新
            const now = Date.now();

            // 更新类型记录
            apiTypes.set(url, {
                type: typeStr,
                lastUpdate: now
            });

            // 使用Worker异步写入类型文件
            await typeWorker.writeTypesFile(apiTypes.toObject(), {
                outputDir,
                typeFileName,
                moduleDir,
                moduleMap
            });
        }
    }, debounceDelay);

    // 定义插件对象
    const plugin: Plugin = {
        name: 'vite-plugin-auto-api-types',
        enforce: 'post',

        // 开发服务器配置
        configureServer(server) {
            const root = server.config.root || process.cwd();
            
            // 确保输出目录存在
            const outputDirPath = path.resolve(root, outputDir);
            fs.mkdirSync(outputDirPath, { recursive: true, mode: 0o755 });
            
            // 设置主输出路径
            outputPath = path.resolve(outputDirPath, typeFileName);

            // 创建类型工作线程管理器（延迟初始化）
            if (!typeWorker) {
                typeWorker = new TypeWorkerManager();
            }

            // 初始化类型文件（不存在时创建）
            fsPromises.access(outputPath).catch(async () => {
                await fsPromises.writeFile(
                    outputPath,
                    `// 自动生成的API类型声明\n/* eslint-disable */\n`,
                    'utf-8'
                );
            });

            // ========== 注册服务端API接口 ==========
            server.middlewares.use('/__auto_api_types/update', (req, res) => {
                if (req.method !== 'POST') {
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, msg: '仅支持POST请求' }));
                    return;
                }

                // 读取请求体
                let body = '';
                req.on('data', (chunk) => body += chunk.toString());
                req.on('end', () => {
                    try {
                        const { url, data } = JSON.parse(body);
                        if (url && data) {
                            updateApiType(url, data);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        } else {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, msg: '缺少url或data参数' }));
                        }
                    } catch (err: any) {
                        console.error('处理类型更新请求失败:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, msg: err.message }));
                    }
                });
            });
        },

        // ========== 正确配置HTML转换钩子 ==========
        transformIndexHtml: {
            enforce: 'post',
            handler: (html: string): string => {
                // 将拦截脚本注入到body末尾
                return html.replace('</body>', `${getClientScript(excludeUrls)}</body>`);
            }
        } as unknown as IndexHtmlTransformHook,

        // 构建结束时生成最终类型文件
        async buildEnd() {
            const typesObj = apiTypes.toObject();
            if (Object.keys(typesObj).length > 0 && typeWorker) {
                await typeWorker.writeTypesFile(typesObj, {
                    outputDir,
                    typeFileName,
                    moduleDir,
                    moduleMap
                });
            }
        },

        // 插件卸载时清理资源
        async closeBundle() {
            if (typeWorker) {
                typeWorker.terminate();
                typeWorker = null;
            }
        }
    };

    // 在插件实例上暴露清理缓存的方法
    (plugin as any).clearCache = () => {
        apiTypes.clear();
    };

    return plugin;
}

// 导出所有类型和工具类
export { TypeGenerator } from './generators/TypeGenerator';
export type { AutoApiTypesPluginOptions } from './types';
