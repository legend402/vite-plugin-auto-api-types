// 测试字典项类型生成功能
import { TypeGenerator } from '../src/index';
import { describe, it, expect } from 'vitest';

describe('Dict Items Type Generation', () => {
  it('should extract repeated object structures into separate types', () => {
    // 用户提供的字典项数据结构
    const dictData = {
      sysAllDictItems: {
        ol_form_biz_type: [
          { id: null, value: 'type1', text: '类型1', description: null, title: '表单业务类型' },
          { id: null, value: 'type2', text: '类型2', description: null, title: '表单业务类型2' }
        ],
        bus_community_correction_task_status: [
          { id: null, value: 'status1', text: '状态1', description: null, title: '矫正任务状态' },
          { id: null, value: 'status2', text: '状态2', description: null, title: '矫正任务状态2' }
        ],
        data_housing_type: [
          { id: null, value: 'house1', text: '住宅1', description: null, title: '住房类型' },
          { id: null, value: 'house2', text: '住宅2', description: null, title: '住房类型2' }
        ]
      }
    };

    // 生成类型定义
    const typeDef = TypeGenerator.generateType('DictResponse', dictData);

    // 验证生成的类型定义包含预期的内容
    expect(typeDef).toContain('export type DictResponse =');
    expect(typeDef).toContain('sysAllDictItems:');
    expect(typeDef).toContain('ol_form_biz_type: DictResponse0[]');
    expect(typeDef).toContain('bus_community_correction_task_status: DictResponse0[]');
    expect(typeDef).toContain('data_housing_type: DictResponse0[]');
    
    // 验证重复结构已被提取为单独的类型
    expect(typeDef).toContain('export type DictResponse0 =');
    expect(typeDef).toContain('id: null');
    expect(typeDef).toContain('value: string');
    expect(typeDef).toContain('text: string');
    expect(typeDef).toContain('description: null');
    expect(typeDef).toContain('title: string');
  });
});
