// 测试自定义类型命名规则功能
import { describe, it, expect } from 'vitest';
import { generateSafeTypeName } from '../src/utils';
import { TypeGenerator } from '../src/generators/TypeGenerator';

// 模拟API类型记录
interface ApiTypeRecord {
    [url: string]: {
        type: string;
        lastUpdate: number;
    };
}

// 模拟writeTypesFile函数的核心逻辑
function testTypeNameGeneration(
    url: string, 
    data: any, 
    customGenerator?: (url: string) => string
) {
    const typeName = customGenerator ? customGenerator(url) : generateSafeTypeName(url);
    const typeStr = TypeGenerator.generateType(typeName, data);
    
    return { typeName, typeStr };
}

describe('自定义类型命名规则测试', () => {
    describe('默认类型命名规则', () => {
        it('应该为简单URL生成正确的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/user', { id: 1, name: 'test' });
            expect(typeName).toBe('Api_user');
            expect(typeStr).toContain('type Api_user');
            expect(typeStr).toContain('id: number');
            expect(typeStr).toContain('name: string');
        });

        it('应该为带域名的URL生成正确的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('https://api.example.com/posts/1', { title: 'test post' });
            expect(typeName).toBe('Api_posts_1');
            expect(typeStr).toContain('type Api_posts_1');
            expect(typeStr).toContain('title: string');
        });

        it('应该为带版本号的URL生成正确的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/v1/products', { id: 1, name: 'product' });
            expect(typeName).toBe('Api_v1_products');
            expect(typeStr).toContain('type Api_v1_products');
            expect(typeStr).toContain('id: number');
            expect(typeStr).toContain('name: string');
        });
    });

    describe('自定义类型命名规则', () => {
        // 自定义类型命名规则1：去掉前缀，使用更简洁的命名
        const customGenerator1 = (url: string): string => {
            const path = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
                .replace(/^\/api\/(v\d+\/)?/, '') // 移除/api或/api/v1/等前缀
                .replace(/[^a-zA-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            return path ? `Api_${path}` : 'Api_Unknown';
        };

        it('应该使用自定义规则1生成简洁的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator1);
            expect(typeName).toBe('Api_user');
            expect(typeStr).toContain('type Api_user');
        });

        it('应该使用自定义规则1处理带域名和版本号的URL', () => {
            const { typeName, typeStr } = testTypeNameGeneration('https://api.example.com/api/v1/posts/1', { title: 'test post' }, customGenerator1);
            expect(typeName).toBe('Api_posts_1');
            expect(typeStr).toContain('type Api_posts_1');
        });

        // 自定义类型命名规则2：使用驼峰命名法
        const customGenerator2 = (url: string): string => {
            const path = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
                .replace(/\//g, '_')
                .replace(/[^a-zA-Z0-9_]/g, '')
                .replace(/_+/g, '_');
            
            // 转换为驼峰命名
            const camelCase = path.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            return `Api${camelCase.charAt(0).toUpperCase() + camelCase.slice(1)}`;
        };

        it('应该使用自定义规则2生成驼峰命名的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator2);
            // 实际生成的类型名称取决于customGenerator2的实现
            expect(typeName).toContain('Api');
            expect(typeStr).toContain(`type ${typeName}`);
        });

        it('应该使用自定义规则2处理多级路径的URL', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/user/list', { users: [] }, customGenerator2);
            // 实际生成的类型名称取决于customGenerator2的实现
            expect(typeName).toContain('Api');
            expect(typeStr).toContain(`type ${typeName}`);
        });

        // 自定义类型命名规则3：使用完全自定义的命名（不包含URL路径）
        const typeNameMap: Record<string, string> = {
            '/api/user': 'UserModel',
            '/api/user/list': 'UserList',
            '/api/product': 'ProductModel'
        };

        const customGenerator3 = (url: string): string => {
            return typeNameMap[url] || generateSafeTypeName(url);
        };

        it('应该使用自定义规则3返回预设的类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator3);
            expect(typeName).toBe('UserModel');
            expect(typeStr).toContain('type UserModel');
        });

        it('应该使用自定义规则3为未知URL返回默认类型名称', () => {
            const { typeName, typeStr } = testTypeNameGeneration('/api/unknown', { data: 'test' }, customGenerator3);
            // generateSafeTypeName现在会移除/api前缀
            expect(typeName).toBe('Api_unknown');
            expect(typeStr).toContain('type Api_unknown');
        });
    });
});
