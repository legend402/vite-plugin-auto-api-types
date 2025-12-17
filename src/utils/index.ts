// 工具函数

/**
 * 根据路径从对象中提取值
 * @param obj 要提取值的对象
 * @param path 提取路径，如 'result.records'
 * @returns 提取的值，如果路径不存在则返回原对象
 */
export const extractValueByPath = (obj: any, path: string): any => {
    if (!path || typeof obj !== 'object' || obj === null) return obj;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = result[key];
        } else {
            // 如果路径不存在，返回原对象
            return obj;
        }
    }
    
    return result;
};

/**
 * 生成安全的类型名称
 * @param url API请求URL
 * @returns 安全的类型名称
 */
export const generateSafeTypeName = (url: string): string => {
    // 生成唯一的类型名称（避免特殊字符）
    const safeUrl = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
        .replace(/^\/api\/?/, '') // 移除/api前缀
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    return safeUrl ? `Api_${safeUrl}` : 'Api_Unknown';
};

/**
 * 检查URL是否在排除列表中
 * @param url 要检查的URL
 * @param excludeUrls 排除的URL正则表达式列表
 * @returns 是否应该排除该URL
 */
export const isUrlExcluded = (url: string, excludeUrls: RegExp[]): boolean => {
    return excludeUrls.some(re => re.test(url));
};

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        if (timeout) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(later, wait);
    };
};

// 导出类型文件写入器
import { TypeFileWriter } from './TypeFileWriter';
export { TypeFileWriter };

// 导出类型工作线程管理器
import { TypeWorkerManager } from './TypeWorker';
export { TypeWorkerManager };

// 导出LRU缓存
import { LRUCache } from './LRUCache';
export { LRUCache };