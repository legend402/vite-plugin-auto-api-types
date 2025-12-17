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
    /**
     * 模块化类型文件映射配置
     * 格式：{ '/api/path': 'moduleName' }
     * 符合映射规则的API会生成到对应的模块文件中，其他API会生成到typeFileName中
     */
    moduleMap?: Record<string, string>;
    /**
     * 模块化类型文件存放的子目录名称
     * 如果设置，模块化类型文件会生成到 ${outputDir}/${moduleDir} 目录下
     */
    moduleDir?: string;
}

// 导出类型
export type { ApiTypeRecord };