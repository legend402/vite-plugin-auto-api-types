// 测试类型生成功能
import { TypeGenerator } from '../src/index';
import { extractValueByPath } from '../src/utils';
import { describe, it, expect } from 'vitest';

describe('TypeGenerator', () => {
  // 测试类型生成功能
  it('should generate correct TypeScript type definitions from data', () => {
    // 用户提供的数据结构示例
    const userData = {
      success: true,
      message: '请求成功',
      code: 200,
      result: {
        records: [
          {
            birthday: null,
            sex_dictText: '男',
            description: '用户描述信息',
            status_dictText: '正常',
            delFlag: 0,
            updateBy: 'admin',
            orgCode: 'OC001',
            id: '123456',
            email: null,
            sex: 1,
            telephone: null,
            updateTime: '2023-10-01 12:00:00',
            avatar: 'https://example.com/avatar.jpg',
            realname: '张三',
            createBy: 'admin',
            phone: null,
            createTime: '2023-10-01 12:00:00',
            username: 'zhangsan',
            status: 1
          }
        ],
        total: 1,
        size: 10,
        current: 1,
        orders: [],
        optimizeCountSql: true,
        searchCount: true,
        countId: null,
        maxLimit: null,
        pages: 1
      },
      timestamp: 1696142400000
    };

    // 生成类型定义
    const typeDef = TypeGenerator.generateType('UserResponse', userData);

    // 验证生成的类型定义包含预期的内容
    expect(typeDef).toContain('export type UserResponse =');
    expect(typeDef).toContain('success: boolean;');
    expect(typeDef).toContain('message: string;');
    expect(typeDef).toContain('code: number;');
    expect(typeDef).toContain('result:');
    expect(typeDef).toContain('records:');
    expect(typeDef).toContain('birthday: null;');
    expect(typeDef).toContain('sex_dictText: string;');
    expect(typeDef).toContain('id: string;');
    expect(typeDef).toContain('status: number;');
    expect(typeDef).toContain('timestamp: number;');
    // 验证嵌套结构
    expect(typeDef).toContain('result: {');
    expect(typeDef).toContain('records: {');
    expect(typeDef).toContain('total: number;');
  });

  // 测试数据路径提取功能
  it('should extract correct data using path', () => {
    // 用户提供的数据结构示例
    const userData = {
      success: true,
      message: '请求成功',
      code: 200,
      result: {
        records: [
          {
            id: '123456',
            username: 'zhangsan',
            realname: '张三',
            status: 1
          }
        ],
        total: 1
      },
      timestamp: 1696142400000
    };

    // 测试提取result.records路径
    const extracted = extractValueByPath(userData, 'result.records');
    expect(Array.isArray(extracted)).toBe(true);
    expect(extracted.length).toBe(1);
    expect(extracted[0]).toHaveProperty('id');
    expect(extracted[0]).toHaveProperty('username');
    expect(extracted[0]).toHaveProperty('realname');
    expect(extracted[0]).toHaveProperty('status');

    // 测试提取result路径
    const resultExtracted = extractValueByPath(userData, 'result');
    expect(resultExtracted).toHaveProperty('records');
    expect(resultExtracted).toHaveProperty('total');

    // 测试提取不存在的路径（返回原对象）
    const notExist = extractValueByPath(userData, 'result.notExist');
    expect(notExist).toEqual(userData);

    // 测试空路径（返回原对象）
    const emptyPath = extractValueByPath(userData, '');
    expect(emptyPath).toEqual(userData);
  });

  // 测试局部类型生成功能
  it('should generate correct type from extracted data', () => {
    // 用户提供的数据结构示例
    const userData = {
      success: true,
      message: '请求成功',
      code: 200,
      result: {
        records: [
          {
            id: '123456',
            username: 'zhangsan',
            realname: '张三',
            status: 1
          }
        ],
        total: 1
      },
      timestamp: 1696142400000
    };

    // 提取result.records部分
    const extracted = extractValueByPath(userData, 'result.records');

    // 生成局部类型定义
    const typeDef = TypeGenerator.generateType('UserRecords', extracted);

    // 验证生成的类型定义只包含records的内容
    expect(typeDef).toContain('export type UserRecords =');
    expect(typeDef).toContain('}[];'); // 验证是数组类型
    expect(typeDef).toContain('id: string;');
    expect(typeDef).toContain('username: string;');
    expect(typeDef).toContain('realname: string;');
    expect(typeDef).toContain('status: number;');
    // 验证不包含其他字段
    expect(typeDef).not.toContain('success:');
    expect(typeDef).not.toContain('message:');
    expect(typeDef).not.toContain('code:');
    expect(typeDef).not.toContain('result:');
    expect(typeDef).not.toContain('total:');
    expect(typeDef).not.toContain('timestamp:');
  });
});
