// 工具函数

/**
 * 生成安全的类型名称
 * @param url API请求URL
 * @returns 安全的类型名称
 */
export const generateSafeTypeName = (url: string): string => {
    // 生成唯一的类型名称（避免特殊字符）
    const safeUrl = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
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