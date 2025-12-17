// 测试LRU缓存功能
import { LRUCache } from '../src/utils';
import { describe, it, expect } from 'vitest';

// 模拟API类型数据
const mockApiData1 = {
  type: 'export type Api_User_GetList = { success: boolean; data: User[]; };',
  lastUpdate: Date.now()
};

const mockApiData2 = {
  type: 'export type Api_User_GetDetail = { success: boolean; data: User; };',
  lastUpdate: Date.now()
};

const mockApiData3 = {
  type: 'export type Api_Product_GetList = { success: boolean; data: Product[]; };',
  lastUpdate: Date.now()
};

const mockApiData4 = {
  type: 'export type Api_Order_GetList = { success: boolean; data: Order[]; };',
  lastUpdate: Date.now()
};

describe('LRUCache', () => {
  // 测试1: 基本的get/set操作
  it('should handle basic get/set operations', () => {
    const lruCache = new LRUCache(2);
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);

    expect(lruCache.get('/api/user/getList')).toBeDefined();
    expect(lruCache.get('/api/user/getDetail')).toBeDefined();
    expect(lruCache.get('/api/product/getList')).toBeUndefined();
    
    const cacheContents = lruCache.toObject();
    expect(Object.keys(cacheContents)).toHaveLength(2);
    expect(cacheContents['/api/user/getList']).toEqual(mockApiData1);
    expect(cacheContents['/api/user/getDetail']).toEqual(mockApiData2);
  });

  // 测试2: 缓存满时的自动清理
  it('should automatically evict least recently used items when cache is full', () => {
    const lruCache = new LRUCache(2);
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);

    // 访问第一个元素，使其成为最近使用的
    lruCache.get('/api/user/getList');

    // 添加第三个元素，应该清理掉第二个元素
    lruCache.set('/api/product/getList', mockApiData3);

    expect(lruCache.get('/api/user/getList')).toBeDefined();
    expect(lruCache.get('/api/user/getDetail')).toBeUndefined();
    expect(lruCache.get('/api/product/getList')).toBeDefined();
  });

  // 测试3: 更新现有元素
  it('should update existing elements correctly', () => {
    const lruCache = new LRUCache(2);
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);

    // 更新第一个元素
    const updatedData = {
      type: 'export type Api_User_GetList = { success: boolean; data: User[]; total: number; };',
      lastUpdate: Date.now()
    };
    lruCache.set('/api/user/getList', updatedData);

    expect(lruCache.get('/api/user/getList')).toEqual(updatedData);
    expect(lruCache.get('/api/user/getDetail')).toBeDefined();
  });

  // 测试4: 手动清理缓存
  it('should clear all items when clear() is called', () => {
    const lruCache = new LRUCache(3);
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);
    lruCache.set('/api/product/getList', mockApiData3);

    expect(Object.keys(lruCache.toObject())).toHaveLength(3);
    
    lruCache.clear();
    
    expect(Object.keys(lruCache.toObject())).toHaveLength(0);
    expect(lruCache.get('/api/user/getList')).toBeUndefined();
  });

  // 测试5: delete方法
  it('should delete specific items when delete() is called', () => {
    const lruCache = new LRUCache(2);
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);

    expect(Object.keys(lruCache.toObject())).toHaveLength(2);
    
    lruCache.delete('/api/user/getList');
    
    expect(Object.keys(lruCache.toObject())).toHaveLength(1);
    expect(lruCache.get('/api/user/getList')).toBeUndefined();
    expect(lruCache.get('/api/user/getDetail')).toBeDefined();
  });

  // 测试6: 大量数据的LRU行为
  it('should maintain correct LRU behavior with multiple items', () => {
    const lruCache = new LRUCache(3);

    // 添加多个元素，验证只保留最近使用的3个
    lruCache.set('/api/user/getList', mockApiData1);
    lruCache.set('/api/user/getDetail', mockApiData2);
    lruCache.set('/api/product/getList', mockApiData3);

    // 访问第一个元素，使其成为最近使用的
    lruCache.get('/api/user/getList');

    // 添加第四个元素，应该清理掉第二个元素
    lruCache.set('/api/order/getList', mockApiData4);

    expect(lruCache.get('/api/user/getList')).toBeDefined();
    expect(lruCache.get('/api/user/getDetail')).toBeUndefined();
    expect(lruCache.get('/api/product/getList')).toBeDefined();
    expect(lruCache.get('/api/order/getList')).toBeDefined();
  });
});
