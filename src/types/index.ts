// 类型存储容器
interface ApiTypeRecord {
    [url: string]: {
        type: string;
        lastUpdate: number;
    };
}

// 插件选项接口
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

// 导出类型
export type { ApiTypeRecord };