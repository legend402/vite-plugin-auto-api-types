// 测试自定义类型命名规则功能
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
    
    console.log(`URL: ${url}`);
    console.log(`Generated Type Name: ${typeName}`);
    console.log(`Generated Type: ${typeStr}`);
    console.log('---');
    
    return { typeName, typeStr };
}

// 测试用例
console.log('=== 测试默认类型命名规则 ===');
testTypeNameGeneration('/api/user', { id: 1, name: 'test' });
testTypeNameGeneration('https://api.example.com/posts/1', { title: 'test post' });
testTypeNameGeneration('/api/v1/products', { id: 1, name: 'product' });

console.log('\n=== 测试自定义类型命名规则 ===');

// 自定义类型命名规则1：去掉前缀，使用更简洁的命名
const customGenerator1 = (url: string): string => {
    const path = url.replace(/^https?:\/\/[^\/]+/, '') // 移除域名
        .replace(/^\/api\/(v\d+\/)?/, '') // 移除/api或/api/v1/等前缀
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    return path ? `Api_${path}` : 'Api_Unknown';
};

testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator1);
testTypeNameGeneration('https://api.example.com/api/v1/posts/1', { title: 'test post' }, customGenerator1);
testTypeNameGeneration('/api/v1/products', { id: 1, name: 'product' }, customGenerator1);

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

testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator2);
testTypeNameGeneration('/api/user/list', { users: [] }, customGenerator2);
testTypeNameGeneration('/api/v1/products', { id: 1, name: 'product' }, customGenerator2);

// 自定义类型命名规则3：使用完全自定义的命名（不包含URL路径）
const typeNameMap: Record<string, string> = {
    '/api/user': 'UserModel',
    '/api/user/list': 'UserList',
    '/api/product': 'ProductModel'
};

const customGenerator3 = (url: string): string => {
    return typeNameMap[url] || generateSafeTypeName(url);
};

testTypeNameGeneration('/api/user', { id: 1, name: 'test' }, customGenerator3);
testTypeNameGeneration('/api/user/list', { users: [] }, customGenerator3);
testTypeNameGeneration('/api/product', { id: 1, name: 'product' }, customGenerator3);
testTypeNameGeneration('/api/unknown', { data: 'test' }, customGenerator3);

console.log('✅ 自定义类型命名规则测试完成');
