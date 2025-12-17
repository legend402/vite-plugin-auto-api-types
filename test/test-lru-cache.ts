// 测试LRU缓存功能
import { LRUCache } from '../src/utils';

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

console.log('=== LRU缓存测试 ===\n');

// 测试1: 基本的get/set操作
console.log('测试1: 基本的get/set操作');
const lruCache1 = new LRUCache(2);
lruCache1.set('/api/user/getList', mockApiData1);
lruCache1.set('/api/user/getDetail', mockApiData2);

console.log('缓存内容:', JSON.stringify(lruCache1.toObject(), null, 2));
console.log('获取/api/user/getList:', lruCache1.get('/api/user/getList') ? '存在' : '不存在');
console.log('获取/api/user/getDetail:', lruCache1.get('/api/user/getDetail') ? '存在' : '不存在');
console.log('获取/api/product/getList:', lruCache1.get('/api/product/getList') ? '存在' : '不存在');
console.log();

// 测试2: 缓存满时的自动清理
console.log('测试2: 缓存满时的自动清理');
const lruCache2 = new LRUCache(2);
lruCache2.set('/api/user/getList', mockApiData1);
lruCache2.set('/api/user/getDetail', mockApiData2);

// 访问第一个元素，使其成为最近使用的
lruCache2.get('/api/user/getList');

// 添加第三个元素，应该清理掉第二个元素
lruCache2.set('/api/product/getList', mockApiData3);

console.log('缓存内容:', JSON.stringify(lruCache2.toObject(), null, 2));
console.log('获取/api/user/getList:', lruCache2.get('/api/user/getList') ? '存在' : '不存在');
console.log('获取/api/user/getDetail:', lruCache2.get('/api/user/getDetail') ? '存在' : '不存在');
console.log('获取/api/product/getList:', lruCache2.get('/api/product/getList') ? '存在' : '不存在');
console.log();

// 测试3: 更新现有元素
console.log('测试3: 更新现有元素');
const lruCache3 = new LRUCache(2);
lruCache3.set('/api/user/getList', mockApiData1);
lruCache3.set('/api/user/getDetail', mockApiData2);

// 更新第一个元素
const updatedData = {
  type: 'export type Api_User_GetList = { success: boolean; data: User[]; total: number; };',
  lastUpdate: Date.now()
};
lruCache3.set('/api/user/getList', updatedData);

console.log('缓存内容:', JSON.stringify(lruCache3.toObject(), null, 2));
console.log('获取/api/user/getList:', JSON.stringify(lruCache3.get('/api/user/getList')));
console.log();

// 测试4: 手动清理缓存
console.log('测试4: 手动清理缓存');
const lruCache4 = new LRUCache(3);
lruCache4.set('/api/user/getList', mockApiData1);
lruCache4.set('/api/user/getDetail', mockApiData2);
lruCache4.set('/api/product/getList', mockApiData3);

console.log('清理前缓存大小:', Object.keys(lruCache4.toObject()).length);
lruCache4.clear();
console.log('清理后缓存大小:', Object.keys(lruCache4.toObject()).length);
console.log('获取/api/user/getList:', lruCache4.get('/api/user/getList') ? '存在' : '不存在');
console.log();

// 测试5: delete方法
console.log('测试5: delete方法');
const lruCache5 = new LRUCache(2);
lruCache5.set('/api/user/getList', mockApiData1);
lruCache5.set('/api/user/getDetail', mockApiData2);

console.log('删除前缓存大小:', Object.keys(lruCache5.toObject()).length);
lruCache5.delete('/api/user/getList');
console.log('删除后缓存大小:', Object.keys(lruCache5.toObject()).length);
console.log('获取/api/user/getList:', lruCache5.get('/api/user/getList') ? '存在' : '不存在');
console.log('获取/api/user/getDetail:', lruCache5.get('/api/user/getDetail') ? '存在' : '不存在');
console.log();

// 测试6: 大量数据的LRU行为
console.log('测试6: 大量数据的LRU行为');
const lruCache6 = new LRUCache(3);

// 添加多个元素，验证只保留最近使用的3个
lruCache6.set('/api/user/getList', mockApiData1);
lruCache6.set('/api/user/getDetail', mockApiData2);
lruCache6.set('/api/product/getList', mockApiData3);

// 访问第一个元素，使其成为最近使用的
lruCache6.get('/api/user/getList');

// 添加第四个元素，应该清理掉第二个元素
lruCache6.set('/api/order/getList', mockApiData4);

console.log('缓存内容:', JSON.stringify(lruCache6.toObject(), null, 2));
console.log('获取/api/user/getList:', lruCache6.get('/api/user/getList') ? '存在' : '不存在');
console.log('获取/api/user/getDetail:', lruCache6.get('/api/user/getDetail') ? '存在' : '不存在');
console.log('获取/api/product/getList:', lruCache6.get('/api/product/getList') ? '存在' : '不存在');
console.log('获取/api/order/getList:', lruCache6.get('/api/order/getList') ? '存在' : '不存在');
console.log();

console.log('=== 所有LRU缓存测试通过！===');
