// 测试树形结构提取功能
import { TypeGenerator } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('Tree Structure Extraction', () => {
  // 测试单个树形结构
  it('should generate correct TypeScript type for single tree structure', () => {
    // 测试树形结构数据
    const treeData = {
      id: 1,
      name: 'Root',
      children: [
        {
          id: 2,
          name: 'Child 1',
          children: [
            {
              id: 3,
              name: 'Grandchild 1',
              children: []
            }
          ]
        },
        {
          id: 4,
          name: 'Child 2',
          children: []
        }
      ]
    };

    // 生成类型定义
    const typeDef = TypeGenerator.generateType('TreeData', treeData);

    // 验证生成的类型定义包含预期的内容
    expect(typeDef).toContain('export type TreeData =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('children?: TreeDataNode[];');
    expect(typeDef).toContain('export type TreeDataNode =');
  });

  // 测试树形结构数组
  it('should generate correct TypeScript type for tree array structure', () => {
    // 测试树形结构数组
    const treeArray = [
      {
        id: 1,
        name: 'Node 1',
        children: []
      },
      {
        id: 2,
        name: 'Node 2',
        children: [
          {
            id: 3,
            name: 'Node 3',
            children: []
          }
        ]
      }
    ];

    // 生成类型定义
    const typeDef = TypeGenerator.generateType('TreeArray', treeArray);

    // 验证生成的类型定义包含预期的内容
    expect(typeDef).toContain('export type TreeArray = TreeArrayNode[];');
    expect(typeDef).toContain('export type TreeArrayNode =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('children?: TreeArrayNode[];');
  });

  // 测试非树形结构
  it('should generate normal TypeScript type for non-tree structure', () => {
    // 测试非树形结构
    const normalData = {
      name: 'Test',
      value: 123
    };

    // 生成类型定义
    const typeDef = TypeGenerator.generateType('NormalData', normalData);

    // 验证生成的类型定义包含预期的内容
    expect(typeDef).toContain('export type NormalData =');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('value: number;');
    // 验证不包含children字段
    expect(typeDef).not.toContain('children?:');
  });
});
