// 测试类型生成功能
import { TypeGenerator } from '../src/index';

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

console.log('生成的类型定义：');
console.log(typeDef);
