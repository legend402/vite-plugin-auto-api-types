import type { ApiTypeRecord } from '../types';

// LRU缓存节点接口
interface LRUNode {
    key: string;
    value: ApiTypeRecord[string];
    prev: LRUNode | null;
    next: LRUNode | null;
}

/**
 * LRU缓存类，用于优化API类型记录的内存使用
 */
export class LRUCache {
    private capacity: number;
    private cache: Map<string, LRUNode>;
    private head: LRUNode;
    private tail: LRUNode;
    
    constructor(capacity: number = 100) {
        this.capacity = capacity;
        this.cache = new Map();
        
        // 初始化双向链表的头和尾哨兵节点
        this.head = { key: '', value: { type: '', lastUpdate: 0 }, prev: null, next: null };
        this.tail = { key: '', value: { type: '', lastUpdate: 0 }, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    
    /**
     * 获取缓存值
     */
    get(key: string): ApiTypeRecord[string] | undefined {
        const node = this.cache.get(key);
        if (!node) return undefined;
        
        // 移动到链表头部表示最近使用
        this.removeNode(node);
        this.addToHead(node);
        
        return node.value;
    }
    
    /**
     * 设置缓存值
     */
    set(key: string, value: ApiTypeRecord[string]): void {
        let node = this.cache.get(key);
        
        if (node) {
            // 更新现有节点
            node.value = value;
            this.removeNode(node);
            this.addToHead(node);
        } else {
            // 创建新节点
            node = { key, value, prev: null, next: null };
            this.cache.set(key, node);
            this.addToHead(node);
            
            // 如果超过容量，移除最久未使用的节点（链表尾部）
            if (this.cache.size > this.capacity) {
                const tailNode = this.tail.prev!;
                this.removeNode(tailNode);
                this.cache.delete(tailNode.key);
            }
        }
    }
    
    /**
     * 删除缓存值
     */
    delete(key: string): boolean {
        const node = this.cache.get(key);
        if (!node) return false;
        
        this.removeNode(node);
        return this.cache.delete(key);
    }
    
    /**
     * 清空所有缓存
     */
    clear(): void {
        this.cache.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    
    /**
     * 获取当前缓存大小
     */
    size(): number {
        return this.cache.size;
    }
    
    /**
     * 获取当前缓存的所有键值对
     */
    entries(): [string, ApiTypeRecord[string]][] {
        return Array.from(this.cache.entries()).map(([key, node]) => [key, node.value]);
    }
    
    /**
     * 获取当前缓存的所有值
     */
    values(): ApiTypeRecord[string][] {
        return Array.from(this.cache.values(), node => node.value);
    }
    
    /**
     * 获取当前缓存的所有键
     */
    keys(): string[] {
        return Array.from(this.cache.keys());
    }
    
    /**
     * 转换为普通对象格式，兼容原有的ApiTypeRecord类型
     */
    toObject(): ApiTypeRecord {
        const obj: ApiTypeRecord = {};
        this.cache.forEach((node, key) => {
            obj[key] = node.value;
        });
        return obj;
    }
    
    /**
     * 添加节点到链表头部
     */
    private addToHead(node: LRUNode): void {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next!.prev = node;
        this.head.next = node;
    }
    
    /**
     * 从链表中移除节点
     */
    private removeNode(node: LRUNode): void {
        node.prev!.next = node.next;
        node.next!.prev = node.prev;
    }
}
