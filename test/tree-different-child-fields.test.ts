// 测试不同子节点字段的树形结构
import { TypeGenerator } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('Tree Structure with Different Child Fields', () => {
  // 测试默认children字段
  it('should generate correct TypeScript type for tree with children field', () => {
    const childrenTree = {
      id: 1,
      name: 'Root',
      children: [
        { id: 2, name: 'Child', children: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('ChildrenTree', childrenTree);

    expect(typeDef).toContain('export type ChildrenTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('children?: ChildrenTreeNode[];');
    expect(typeDef).toContain('export type ChildrenTreeNode =');
  });

  // 测试subItems字段
  it('should generate correct TypeScript type for tree with subItems field', () => {
    const subItemsTree = {
      id: 1,
      name: 'Root',
      subItems: [
        { id: 2, name: 'Sub Item', subItems: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('SubItemsTree', subItemsTree);

    expect(typeDef).toContain('export type SubItemsTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('subItems?: SubItemsTreeNode[];');
    expect(typeDef).toContain('export type SubItemsTreeNode =');
  });

  // 测试nodes字段
  it('should generate correct TypeScript type for tree with nodes field', () => {
    const nodesTree = {
      id: 1,
      name: 'Root',
      nodes: [
        { id: 2, name: 'Node', nodes: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('NodesTree', nodesTree);

    expect(typeDef).toContain('export type NodesTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('nodes?: NodesTreeNode[];');
    expect(typeDef).toContain('export type NodesTreeNode =');
  });

  // 测试items字段
  it('should generate correct TypeScript type for tree with items field', () => {
    const itemsTree = {
      id: 1,
      name: 'Root',
      items: [
        { id: 2, name: 'Item', items: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('ItemsTree', itemsTree);
    
    expect(typeDef).toContain('export type ItemsTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('items?: ItemsTreeNode[];');
    expect(typeDef).toContain('export type ItemsTreeNode =');
  });

  // 测试subNodes字段
  it('should generate correct TypeScript type for tree with subNodes field', () => {
    const subNodesTree = {
      id: 1,
      name: 'Root',
      subNodes: [
        { id: 2, name: 'Sub Node', subNodes: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('SubNodesTree', subNodesTree);

    expect(typeDef).toContain('export type SubNodesTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('subNodes?: SubNodesTreeNode[];');
    expect(typeDef).toContain('export type SubNodesTreeNode =');
  });

  // 测试subCategories字段
  it('should generate correct TypeScript type for tree with subCategories field', () => {
    const subCategoriesTree = {
      id: 1,
      name: 'Root Category',
      subCategories: [
        { id: 2, name: 'Sub Category', subCategories: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('SubCategoriesTree', subCategoriesTree);

    expect(typeDef).toContain('export type SubCategoriesTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('subCategories?: SubCategoriesTreeNode[];');
    expect(typeDef).toContain('export type SubCategoriesTreeNode =');
  });

  // 测试childNodes字段
  it('should generate correct TypeScript type for tree with childNodes field', () => {
    const childNodesTree = {
      id: 1,
      name: 'Root',
      childNodes: [
        { id: 2, name: 'Child Node', childNodes: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('ChildNodesTree', childNodesTree);

    expect(typeDef).toContain('export type ChildNodesTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('childNodes?: ChildNodesTreeNode[];');
    expect(typeDef).toContain('export type ChildNodesTreeNode =');
  });

  // 测试subChildren字段
  it('should generate correct TypeScript type for tree with subChildren field', () => {
    const subChildrenTree = {
      id: 1,
      name: 'Root',
      subChildren: [
        { id: 2, name: 'Sub Child', subChildren: [] }
      ]
    };

    const typeDef = TypeGenerator.generateType('SubChildrenTree', subChildrenTree);

    expect(typeDef).toContain('export type SubChildrenTree =');
    expect(typeDef).toContain('id: number;');
    expect(typeDef).toContain('name: string;');
    expect(typeDef).toContain('subChildren?: SubChildrenTreeNode[];');
    expect(typeDef).toContain('export type SubChildrenTreeNode =');
  });

  // 测试混合多个可能的子节点字段
    it('should generate correct TypeScript type for tree with multiple child fields', () => {
        const mixedTree = {
            id: 1,
            name: 'Root',
            items: [], // 这个会被优先识别
            nodes: [],
            children: []
        };

        const typeDef = TypeGenerator.generateType('MixedTree', mixedTree);

        expect(typeDef).toContain('export type MixedTree =');
        expect(typeDef).toContain('id: number;');
        expect(typeDef).toContain('name: string;');
        expect(typeDef).toContain('items?: MixedTreeNode[];');
        expect(typeDef).toContain('nodes: any[];');
        expect(typeDef).toContain('children: any[];');
        expect(typeDef).toContain('export type MixedTreeNode =');
    });
});
