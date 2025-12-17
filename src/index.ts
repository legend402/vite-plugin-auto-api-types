// vite-plugin-auto-api-types.ts
import type { Plugin, IndexHtmlTransformHook } from 'vite';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { TypeGenerator } from './generators/TypeGenerator';
import { getClientScript } from './client';
import { generateSafeTypeName, debounce } from './utils';
import type { AutoApiTypesPluginOptions, ApiTypeRecord } from './types';

// 插件主函数
export default function autoApiTypesPlugin(options: AutoApiTypesPluginOptions = {}): Plugin {
    // 默认配置
    const {
        outputDir = 'types',
        excludeUrls = [],
        typeFileName = 'api-types.d.ts',
        debounceDelay = 1000
    } = options;

    // 存储API类型记录
    const apiTypes: ApiTypeRecord = {};
    let outputPath = '';

    // 工具函数：更新API类型
    const updateApiType = debounce((url: string, data: any) => {
        // 生成唯一的类型名称
        const typeName = generateSafeTypeName(url);

        // 生成类型字符串
        const typeStr = TypeGenerator.generateType(typeName, data);

        // 防抖：1秒内不重复更新
        const now = Date.now();

        // 更新类型记录
        apiTypes[url] = {
            type: typeStr,
            lastUpdate: now
        };

        // 写入类型文件
        writeTypesFile();
    }, debounceDelay);

    // 工具函数：写入类型文件
    const writeTypesFile = () => {
        try {
            const typeEntries = Object.values(apiTypes).map(item => item.type);
            const content = [
                `// 自动生成的API类型声明 - ${new Date().toLocaleString()}`,
                `/* eslint-disable */`,
                `declare global {`,
                ...typeEntries.map(t => t.replace(/export /g, '')), // 转为全局类型
                `}`,
                `export {};`
            ].join('\n\n');

            fs.writeFileSync(outputPath, content, 'utf-8');
        } catch (err) {
            console.error('写入API类型文件失败:', err);
        }
    };

    return {
        name: 'vite-plugin-auto-api-types',
        enforce: 'post',

        // 开发服务器配置
        configureServer(server) {
            const root = server.config.root || process.cwd();
            outputPath = path.resolve(root, outputDir, typeFileName);

            // 确保输出目录存在
            fs.mkdirSync(path.dirname(outputPath), { recursive: true, mode: 0o755 });

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
        buildEnd() {
            if (Object.keys(apiTypes).length > 0) {
                writeTypesFile();
            }
        }
    };
}

// 导出所有类型和工具类
export { TypeGenerator } from './generators/TypeGenerator';
export type { AutoApiTypesPluginOptions } from './types';
