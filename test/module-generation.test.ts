// 测试模块化类型文件生成功能
import { TypeGenerator } from '../src/generators/TypeGenerator';
import { describe, it, expect, vi } from 'vitest';
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

describe('模块化类型文件生成功能', () => {
  // 模拟writeTypesFile函数（支持moduleDir）
  const writeTypesFile = (apiTypes: any, outputDir: string, typeFileName: string, moduleDir?: string) => {
    // 按模块分组类型
    const moduleTypes: Record<string, string[]> = {};
    
    // 遍历所有API类型
    for (const [url, { type }] of Object.entries<{ type: string }>(apiTypes)) {
      const moduleName = getModuleName(url, typeFileName);
      if (!moduleTypes[moduleName]) {
        moduleTypes[moduleName] = [];
      }
      moduleTypes[moduleName].push(type);
    }
    
    // 为每个模块生成类型文件路径
    const generatedFiles: Array<{ filePath: string; types: string[] }> = [];
    
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
      
      generatedFiles.push({
        filePath,
        types: typeEntries.map(t => t.match(/export type (\w+)/)?.[1]).filter(Boolean) as string[]
      });
    }
    
    return generatedFiles;
  };

  it('should generate module types without moduleDir', () => {
    const generatedFiles = writeTypesFile(mockApiTypes, 'types', 'api-types.d.ts');
    
    // 验证生成的文件数量和内容
    expect(generatedFiles).toHaveLength(3); // user, product, api-types
    
    // 验证user模块
    const userFile = generatedFiles.find(f => f.filePath.includes('user.d.ts'));
    expect(userFile).toBeDefined();
    expect(userFile?.types).toContain('UserGetList');
    expect(userFile?.types).toContain('UserGetDetail');
    
    // 验证product模块
    const productFile = generatedFiles.find(f => f.filePath.includes('product.d.ts'));
    expect(productFile).toBeDefined();
    expect(productFile?.types).toContain('ProductGetList');
    
    // 验证默认模块
    const defaultFile = generatedFiles.find(f => f.filePath.includes('api-types.d.ts'));
    expect(defaultFile).toBeDefined();
    expect(defaultFile?.types).toContain('OrderGetList');
  });

  it('should generate module types with moduleDir', () => {
    const generatedFiles = writeTypesFile(mockApiTypes, 'types', 'api-types.d.ts', 'modules');
    
    // 验证生成的文件数量和内容
    expect(generatedFiles).toHaveLength(3); // user, product, api-types
    
    // 验证模块化文件路径包含moduleDir (兼容Windows和Unix路径分隔符)
    const userFile = generatedFiles.find(f => 
        f.filePath.includes('modules\\user.d.ts') || 
        f.filePath.includes('modules/user.d.ts')
    );
    expect(userFile).toBeDefined();
    expect(userFile?.types).toContain('UserGetList');
    expect(userFile?.types).toContain('UserGetDetail');
    
    const productFile = generatedFiles.find(f => 
        f.filePath.includes('modules\\product.d.ts') || 
        f.filePath.includes('modules/product.d.ts')
    );
    expect(productFile).toBeDefined();
    expect(productFile?.types).toContain('ProductGetList');
    
    // 验证默认文件不包含moduleDir
    const defaultFile = generatedFiles.find(f => f.filePath.includes('api-types.d.ts'));
    expect(defaultFile).toBeDefined();
    expect(defaultFile?.filePath).not.toContain('modules');
    expect(defaultFile?.types).toContain('OrderGetList');
  });
});
