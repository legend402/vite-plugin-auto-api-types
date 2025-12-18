// 测试树形结构边缘情况
import { TypeGenerator } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('Tree Structure Edge Cases', () => {
  // 测试空树形结构
  it('should generate correct TypeScript type for empty tree structure', () => {
    const emptyTree = {
      id: 1,
      name: 'Root',
      children: []
    };

    const typeDef = TypeGenerator.generateType('EmptyTree', emptyTree);

    expect(typeDef).toContain('export type EmptyTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('children?: EmptyTreeNode[];');
    expect(typeDef).toContain('export type EmptyTreeNode =');
  });

  // 测试深层嵌套树形结构
  it('should generate correct TypeScript type for deep nested tree structure', () => {
    const deepTree = {
      id: 1,
      level: 1,
      children: [
        {
          id: 2,
          level: 2,
          children: [
            {
              id: 3,
              level: 3,
              children: [
                {
                  id: 4,
                  level: 4,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    };

    const typeDef = TypeGenerator.generateType('DeepTree', deepTree);

    expect(typeDef).toContain('export type DeepTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('level: number;');
    expect(typeDef).toContain('children?: DeepTreeNode[];');
    expect(typeDef).toContain('export type DeepTreeNode =');
  });

  // 测试复杂属性的树形结构
  it('should generate correct TypeScript type for complex tree structure', () => {
    const complexTree = {
      id: 1,
      name: 'Complex Node',
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      },
      tags: ['tree', 'complex', 'example'],
      active: true,
      value: 123.45,
      children: []
    };

    const typeDef = TypeGenerator.generateType('ComplexTree', complexTree);

    expect(typeDef).toContain('export type ComplexTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('metadata:');
    expect(typeDef).toContain('created: string;');
    expect(typeDef).toContain('updated: string;');
    expect(typeDef).toContain('tags:');
    expect(typeDef).toContain('active: boolean;');
    expect(typeDef).toContain('value: number;');
    expect(typeDef).toContain('children?: ComplexTreeNode[];');
    expect(typeDef).toContain('export type ComplexTreeNode =');
  });

  // 测试树形结构列表
  it('should generate correct TypeScript type for tree list structure', () => {
    const treeList = [
      {
        id: 1,
        name: 'List Item 1',
        children: []
      },
      {
        id: 2,
        name: 'List Item 2',
        children: []
      }
    ];

    const typeDef = TypeGenerator.generateType('TreeList', treeList);

    expect(typeDef).toContain('export type TreeList = TreeListNode[];');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('children?: TreeListNode[];');
    expect(typeDef).toContain('export type TreeListNode =');
  });

  // 测试无children属性的类似树形结构
  it('should generate normal TypeScript type for tree-like structure without children', () => {
    const noChildrenTree = {
      id: 1,
      name: 'Node without children prop'
    };

    const typeDef = TypeGenerator.generateType('NoChildrenTree', noChildrenTree);

    expect(typeDef).toContain('export type NoChildrenTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    // 验证不包含children字段
    expect(typeDef).not.toContain('children?:');
  });
});
