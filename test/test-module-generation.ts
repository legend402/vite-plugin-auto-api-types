// 测试模块化类型文件生成功能
import { TypeGenerator } from '../src/generators/TypeGenerator';
import fs from 'fs';
import path from 'path';

// 模拟API类型记录
const mockApiTypes = {
  '/user/getList': {
    type: TypeGenerator.generateType('UserGetList', {
      success: true,
      data: [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ]
    }),
    lastUpdate: Date.now()
  },
  '/user/getDetail': {
    type: TypeGenerator.generateType('UserGetDetail', {
      success: true,
      data: { id: 1, name: 'John', email: 'john@example.com', age: 30 }
    }),
    lastUpdate: Date.now()
  },
  '/product/getList': {
    type: TypeGenerator.generateType('ProductGetList', {
      success: true,
      data: [
        { id: 1, name: 'Product 1', price: 100 },
        { id: 2, name: 'Product 2', price: 200 }
      ]
    }),
    lastUpdate: Date.now()
  },
  '/order/getList': {
    type: TypeGenerator.generateType('OrderGetList', {
      success: true,
      data: [
        { id: 1, productId: 1, userId: 1, quantity: 2 },
        { id: 2, productId: 2, userId: 2, quantity: 1 }
      ]
    }),
    lastUpdate: Date.now()
  }
};

// 模拟模块化配置
const moduleMap = {
  '/user': 'user',
  '/product': 'product'
};

// 模拟getModuleName函数
const getModuleName = (url: string, typeFileName: string): string => {
  // 遍历moduleMap，找到匹配的URL前缀
  for (const [pathPattern, moduleName] of Object.entries(moduleMap)) {
    if (url.startsWith(pathPattern)) {
      return moduleName;
    }
  }
  // 默认返回主文件
  return typeFileName.replace('.d.ts', '');
};

// 模拟writeTypesFile函数（支持moduleDir）
const writeTypesFile = (apiTypes: any, outputDir: string, typeFileName: string, moduleDir?: string) => {
  try {
    // 按模块分组类型
    const moduleTypes: Record<string, string[]> = {};
    
    // 遍历所有API类型
    for (const [url, { type }] of Object.entries(apiTypes)) {
      const moduleName = getModuleName(url, typeFileName);
      if (!moduleTypes[moduleName]) {
        moduleTypes[moduleName] = [];
      }
      moduleTypes[moduleName].push(type);
    }
    
    console.log('按模块分组结果:', JSON.stringify(moduleTypes, null, 2));
    
    // 为每个模块生成类型文件
    for (const [moduleName, typeEntries] of Object.entries(moduleTypes)) {
      // 确定文件名
      const fileName = moduleName === typeFileName.replace('.d.ts', '') ? 
          typeFileName : `${moduleName}.d.ts`;
      
      // 确定输出路径
      let filePath;
      if (moduleName === typeFileName.replace('.d.ts', '')) {
        // 默认文件直接放在outputDir中
        filePath = path.resolve(outputDir, fileName);
      } else {
        // 模块化文件根据moduleDir配置决定路径
        if (moduleDir) {
          // 如果设置了moduleDir，则放在子目录中
          filePath = path.resolve(outputDir, moduleDir, fileName);
        } else {
          // 否则和默认文件放在同一目录
          filePath = path.resolve(outputDir, fileName);
        }
      }
      
      console.log(`生成文件: ${filePath}`);
      console.log('包含的类型:', typeEntries.map(t => t.match(/export type (\w+)/)?.[1]).filter(Boolean));
    }
    
    console.log('\n模块化类型文件生成测试成功！');
  } catch (err) {
    console.error('写入API类型文件失败:', err);
  }
};

// 执行测试
console.log('=== 模块化类型文件生成测试（无moduleDir） ===\n');
writeTypesFile(mockApiTypes, 'types', 'api-types.d.ts');

// 执行带moduleDir的测试
console.log('\n=== 模块化类型文件生成测试（带moduleDir="modules"） ===\n');
writeTypesFile(mockApiTypes, 'types', 'api-types.d.ts', 'modules');
