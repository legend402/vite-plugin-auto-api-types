// vite-plugin-auto-api-types.ts
import type { Plugin, IndexHtmlTransformHook } from 'vite';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

// 类型存储容器
interface ApiTypeRecord {
    [url: string]: {
        type: string;
        lastUpdate: number;
    };
}

// 类型生成工具函数
class TypeGenerator {
    // 基础类型映射
    private static basicTypeMap = new Map([
        ['string', 'string'],
        ['number', 'number'],
        ['boolean', 'boolean'],
        ['object', 'object'],
        ['undefined', 'undefined'],
        ['null', 'null'],
        ['function', 'Function'],
    ]);

    // 生成TS类型字符串
    static generateType(name: string, data: any): string {
        if (Array.isArray(data)) {
            const itemType = data.length > 0
                ? this.parseValue(data[0])
                : 'any';
            return `export type ${name} = ${itemType}[];\n`;
        }

        if (typeof data === 'object' && data !== null) {
            const properties = Object.entries(data).map(([key, value]) => {
                const type = this.parseValue(value);
                return `  ${key}: ${type};`;
            }).join('\n');
            return `export type ${name} = {\n${properties}\n};\n`;
        }

        return `export type ${name} = ${this.parseValue(data)};\n`;
    }

    // 解析值的类型
    private static parseValue(value: any, indent: number = 2): string {
        const indentStr = ' '.repeat(indent); // 当前层级缩进字符串
        const nextIndent = indent + 2; // 下一层级缩进（+2空格）

        // null 类型
        if (value === null) return 'null';

        // 数组类型
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            const itemType = this.parseValue(value[0], nextIndent);
            return `${itemType}[]`;
        }

        // 对象类型（递归生成带缩进的属性）
        if (typeof value === 'object' && value !== null) {
            const entries = Object.entries(value);
            if (entries.length === 0) return '{}';

            const properties = entries.map(([key, val]) => {
                // 处理特殊属性名（如包含空格/特殊字符）
                const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
                    ? key
                    : `"${key}"`;
                const propType = this.parseValue(val, nextIndent);
                return `${indentStr}${safeKey}: ${propType};`;
            }).join('\n');

            return `{\n${properties}\n${' '.repeat(indent - 2)}}`;
        }

        // 基础类型
        return this.basicTypeMap.get(typeof value) || 'any';
    }
}

export interface AutoApiTypesPluginOptions {
    /**
     * 类型文件输出目录
     * @default 'types'
     */
    outputDir?: string;
    /**
     * 排除的URL
     */
    excludeUrls?: RegExp[];
    /**
     * 生成的类型文件名
     * @default 'api-types.d.ts'
     */
    typeFileName?: string;
    /**
     * 防抖延迟（毫秒）
     * @default 1000
     */
    debounceDelay?: number;
}

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
    // let devServer: ViteDevServer | null = null;
    let outputPath = '';

    // 工具函数：更新API类型
    const updateApiType = (url: string, data: any) => {
        // 生成唯一的类型名称（避免特殊字符）
        const safeUrl = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        const typeName = safeUrl ? `Api_${safeUrl}` : 'Api_Unknown';

        // 生成类型字符串
        const typeStr = TypeGenerator.generateType(typeName, data);

        // 防抖：1秒内不重复更新
        const now = Date.now();
        if (apiTypes[url]?.lastUpdate && now - apiTypes[url].lastUpdate < debounceDelay) {
            return;
        }

        // 更新类型记录
        apiTypes[url] = {
            type: typeStr,
            lastUpdate: now
        };

        // 写入类型文件
        writeTypesFile();

        // ========== 核心修复：移除全量刷新，仅通知类型文件变更 ==========
        // if (devServer) {
        //     // 通知Vite类型文件已变更，触发TS重新解析但不刷新页面
        //     devServer.moduleGraph.invalidateModule(
        //         devServer.moduleGraph.createFileOnlyEntry(outputPath)
        //     );
        //     // 仅刷新类型文件，不刷新页面
        //     devServer.ws.send({
        //         type: 'update',
        //         updates: [{
        //             type: 'js-update',
        //             path: outputPath,
        //             acceptedPath: outputPath,
        //             timestamp: now
        //         }]
        //     });
        // }
    };

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

    // 生成客户端注入脚本
    const getClientScript = () => {
        // 将排除的URL正则转为字符串（避免序列化问题）
        const excludeUrlSources = excludeUrls.map(re => re.source);

        return `
      <script>
        // 自动生成的请求拦截脚本
        (() => {
          // 避免重复注入
          if (window.__autoApiTypesInjected) return;
          window.__autoApiTypesInjected = true;

          // 排除的URL列表
          const excludeUrls = ${JSON.stringify(excludeUrlSources)}.map(src => new RegExp(src));
          excludeUrls.push(new RegExp('/__auto_api_types/update'));
          // 向服务端发送类型数据
          const sendTypeData = (url, data) => {
            url = new URL(url)
            fetch('/__auto_api_types/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: url.pathname, data })
            }).catch(err => console.debug('更新API类型失败:', err));
          };

          // ========== 拦截Fetch API ==========
          const originalFetch = window.fetch;
          window.fetch = async function(...args) {
            const [input] = args;
            const url = typeof input === 'string' ? input : input?.url || '';
            
            // 排除指定URL
            if (excludeUrls.some(re => re.test(url))) {
              return originalFetch.apply(this, args);
            }

            try {
              const response = await originalFetch.apply(this, args);
              // 克隆响应避免消费
              const clone = response.clone();
              
              // 只处理JSON响应
              if (clone.headers.get('content-type')?.includes('application/json')) {
                const data = await clone.json();
                sendTypeData(url, data);
              }
              
              return response;
            } catch (err) {
              console.debug('Fetch拦截错误:', err);
              throw err;
            }
          };

          // ========== 拦截XHR请求 ==========
          const originalXHR = window.XMLHttpRequest;
          window.XMLHttpRequest = class extends originalXHR {
            open(method, url, async = true, user = null, password = null) {
              this._apiUrl = typeof url === 'string' ? url : url.toString();
              super.open(method, url, async, user, password);
            }

            send(body = null) {
              const url = this._apiUrl;
              
              if (excludeUrls.some(re => re.test(url))) {
                super.send(body);
                return;
              }

              this.addEventListener('load', () => {
                try {
                  if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                    const contentType = this.getResponseHeader('content-type');
                    if (contentType?.includes('application/json')) {
                      let data;
                      try {
                        data = this.responseType === 'json' ? this.response : JSON.parse(this.responseText);
                      } catch (e) {
                        console.debug('解析XHR响应失败:', e);
                        return;
                      }
                      sendTypeData(url, data);
                    }
                  }
                } catch (err) {
                  console.debug('XHR拦截错误:', err);
                }
              });

              super.send(body);
            }
          };
        })();
      </script>
    `;
    };

    return {
        name: 'vite-plugin-auto-api-types',
        enforce: 'post',

        // 开发服务器配置
        configureServer(server) {
            // devServer = server;
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
                return html.replace('</body>', `${getClientScript()}</body>`);
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
