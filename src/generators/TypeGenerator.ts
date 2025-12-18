// 类型生成工具类
export class TypeGenerator {
    // 基础类型映射
    private static basicTypeMap = new Map([
        ['string', 'string'],
        ['number', 'number'],
        ['boolean', 'boolean'],
        ['object', 'object'],
        ['undefined', 'undefined'],
        ['null', 'null'],
        ['function', 'Function'],
    ]);
    
    // 结构注册表，用于存储已检测的对象结构和对应的类型名称
    private static structureRegistry: Map<string, { typeName: string, typeDef: string }> = new Map();
    
    // 类型名称计数器，用于生成唯一的类型名称
    private static typeCounter: number = 0;

    // 生成对象结构的唯一哈希值
    private static getStructureHash(obj: any): string {
        if (obj === null) return 'null';
        if (Array.isArray(obj)) {
            if (obj.length === 0) return 'empty_array';
            return `array[${this.getStructureHash(obj[0])}]`;
        }
        if (typeof obj !== 'object') {
            return typeof obj;
        }
        
        // 生成对象结构的哈希
        const keys = Object.keys(obj).sort();
        const keyValuePairs = keys.map(key => `${key}:${this.getStructureHash(obj[key])}`);
        return `object{${keyValuePairs.join(',')}}`;
    }
    
    // 生成TS类型字符串
    static generateType(name: string, data: any): string {
        // 重置结构注册表和类型计数器，避免多次调用之间的污染
        this.structureRegistry.clear();
        this.typeCounter = 0;
        
        // 检测循环引用，使用Set记录已处理的对象
        const processedObjects = new Set<object>();
        
        // 检查是否为树形结构
        if (Array.isArray(data) && data.length > 0 && this.isTreeStructure(data[0])) {
            // 对于树形结构数组，我们需要特殊处理
            return this.generateTreeType(name, data, processedObjects, true);
        } else if (this.isTreeStructure(data)) {
            return this.generateTreeType(name, data, processedObjects, false);
        }
        
        const typeStr = this.generateTypeInternal(name, data, processedObjects);
        return typeStr;
    }

    // 检查是否为树形结构
    private static isTreeStructure(data: any): boolean {
        // 树形结构必须是对象且不为null
        if (typeof data !== 'object' || data === null) return false;
        
        // 可能的子节点字段名称列表
        const possibleChildFields = [
            'children', 'subItems', 'nodes', 'items', 
            'subNodes', 'subCategories', 'childNodes', 'subChildren'
        ];
        
        // 检查是否有任何可能的子节点字段是数组
        for (const field of possibleChildFields) {
            if (Array.isArray(data[field])) {
                // 如果数组不为空，检查第一个元素是否为对象
                if (data[field].length > 0) {
                    const firstChild = data[field][0];
                    if (typeof firstChild === 'object' && firstChild !== null) {
                        return true;
                    }
                } else {
                    // 空数组也视为树形结构
                    return true;
                }
            }
        }
        
        return false;
    }

    // 生成树形结构类型
    private static generateTreeType(name: string, data: any, processedObjects: Set<object>, isArray: boolean): string {
        // 生成基础树节点类型名
        // 对于树形结构，我们希望生成的节点类型名能够反映其结构
        let nodeTypeName: string;
        
        // 获取实际的数据（如果是数组，取第一个元素）
        const actualData = isArray ? data[0] : data;
        
        if (name.toLowerCase().includes('tree')) {
            // 如果名称已经包含Tree，直接添加Node后缀
            nodeTypeName = name + 'Node';
        } else if (name.toLowerCase().includes('array') || name.toLowerCase().includes('list')) {
            // 如果是数组/列表类型，生成更具描述性的节点名称
            nodeTypeName = name.replace(/(Array|List)$/i, '') + 'TreeNode';
        } else {
            // 其他情况，直接添加TreeNode后缀
            nodeTypeName = name + 'TreeNode';
        }
        
        // 检测实际使用的子节点字段名
        const childField = this.findChildField(actualData);
        if (!childField) {
            // 如果没有找到子节点字段，返回普通对象类型
            return this.generateTypeInternal(name, data, processedObjects);
        }
        
        // 处理节点数据，暂时移除子节点字段以生成基础节点类型
        const nodeData = { ...actualData };
        delete nodeData[childField];
        
        // 生成节点类型定义
        processedObjects.add(actualData);
        const nodeProperties = this.getObjectProperties(nodeData, processedObjects, nodeTypeName);
        processedObjects.delete(actualData);
        
        const nodeTypeDef = `export type ${nodeTypeName} = {\n${nodeProperties}\n${' '.repeat(2)}${childField}?: ${nodeTypeName}[];\n};\n`;
        
        // 生成主类型定义
        const mainTypeDef = isArray 
            ? `export type ${name} = ${nodeTypeName}[];\n`
            : `export type ${name} = ${nodeTypeName};\n`;
        
        return nodeTypeDef + mainTypeDef;
    }

    // 查找树形结构中的子节点字段名
    private static findChildField(data: any): string | null {
        // 可能的子节点字段名称列表
        const possibleChildFields = [
            'items', 'nodes', 'children', 'subItems', 'child',
            'subNodes', 'subCategories', 'childNodes', 'subChildren'
        ];
        
        // 检查数据中是否包含这些字段，并且是数组类型
        for (const field of possibleChildFields) {
            if (Array.isArray(data[field])) {
                return field;
            }
        }
        
        return null;
    }

    // 内部类型生成方法，支持循环引用检测
    private static generateTypeInternal(name: string, data: any, processedObjects: Set<object>): string {
        let mainTypeDef: string;
        
        if (Array.isArray(data)) {
            if (data.length === 0) {
                mainTypeDef = `export type ${name} = any[];\n`;
            } else {
                // 检查数组元素是否为树形结构
                if (this.isTreeStructure(data[0])) {
                    return this.generateTreeType(name, data, processedObjects, true);
                }
                
                processedObjects.add(data);
                
                // 统一处理数组类型，通过parseValue自动检测重复结构
                const itemType = this.parseValue(data[0], processedObjects, name);
                mainTypeDef = `export type ${name} = ${itemType}[];\n`;
                
                processedObjects.delete(data);
            }
        } else if (typeof data === 'object' && data !== null) {
            processedObjects.add(data);
            const properties = this.getObjectProperties(data, processedObjects, name);
            processedObjects.delete(data);
            
            mainTypeDef = `export type ${name} = {\n${properties}\n};\n`;
        } else {
            mainTypeDef = `export type ${name} = ${this.parseValue(data, processedObjects, name)};\n`;
        }
        
        // 收集所有注册的结构化类型定义
        const structuredTypeDefs = Array.from(this.structureRegistry.values())
            .map(entry => entry.typeDef)
            .join('');
        
        return structuredTypeDefs + mainTypeDef;
    }

    // 获取对象属性的字符串表示
    private static getObjectProperties(obj: any, processedObjects: Set<object>, parentTypeName: string, indent: number = 2): string {
        const indentStr = ' '.repeat(indent);
        const nextIndent = indent + 2;
        const entries = Object.entries(obj);
        
        return entries.map(([key, value]) => {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
                ? key
                : `"${key}"`;
            
            let typeStr: string;
            
            if (value === null) {
                typeStr = 'null';
            } else if (Array.isArray(value)) {
                if (value.length === 0) {
                    typeStr = 'any[]';
                } else {
                    // 检查数组元素是否为树形结构
                    if (this.isTreeStructure(value[0])) {
                        // 为树形结构生成特殊的节点类型
                        const treeTypeName = key.charAt(0).toUpperCase() + key.slice(1);
                        const nodeTypeName = treeTypeName + 'TreeNode';
                        
                        // 提取节点数据结构
                        const nodeData = { ...value[0] };
                        const childField = this.findChildField(nodeData);
                        if (childField) {
                            delete nodeData[childField];
                        }
                        
                        // 生成节点类型定义
                        processedObjects.add(value[0]);
                        const nodeProperties = this.getObjectProperties(nodeData, processedObjects, nodeTypeName);
                        processedObjects.delete(value[0]);
                        
                        // 生成完整的节点类型定义
                        const nodeTypeDef = `export type ${nodeTypeName} = {\n${nodeProperties}\n  ${childField}?: ${nodeTypeName}[];\n};\n`;
                        
                        // 使用结构哈希作为键添加到结构注册表
                        const structureHash = this.getStructureHash(value[0]);
                        this.structureRegistry.set(structureHash, { typeName: nodeTypeName, typeDef: nodeTypeDef });
                        
                        typeStr = nodeTypeName;
                    } else if (typeof value[0] === 'object' && value[0] !== null) {
                        // 检查数组元素是否为对象且可能存在重复结构
                        const structureHash = this.getStructureHash(value[0]);
                        
                        // 如果结构已存在，直接使用已注册的类型
                        if (this.structureRegistry.has(structureHash)) {
                            typeStr = `${this.structureRegistry.get(structureHash)!.typeName}[]`;
                        } else {
                            // 检查是否有其他属性也使用了相同的结构
                            let hasDuplicate = false;
                            for (const [otherKey, otherValue] of entries) {
                                if (otherKey !== key && Array.isArray(otherValue) && otherValue.length > 0) {
                                    const otherHash = this.getStructureHash(otherValue[0]);
                                    if (otherHash === structureHash) {
                                        hasDuplicate = true;
                                        break;
                                    }
                                }
                            }
                            
                            if (hasDuplicate) {
                                // 存在重复结构，生成并注册结构化类型
                                const counter = this.typeCounter++;
                                const typeName = parentTypeName.charAt(0).toUpperCase() + parentTypeName.slice(1) + counter;
                                
                                processedObjects.add(value[0]);
                                const properties = this.getObjectProperties(value[0], processedObjects, typeName, nextIndent);
                                processedObjects.delete(value[0]);
                                
                                // 生成类型定义
                                const typeDef = `export type ${typeName} = {\n${properties}\n};\n`;
                                
                                // 将结构和类型定义添加到注册表
                                this.structureRegistry.set(structureHash, { typeName, typeDef });
                                
                                typeStr = `${typeName}[]`;
                            } else {
                                // 不存在重复结构，内联对象结构
                                typeStr = `${this.parseValue(value[0], processedObjects, parentTypeName, nextIndent)}[]`;
                            }
                        }
                    } else {
                        // 非对象数组元素，直接使用基本类型
                        typeStr = `${this.parseValue(value[0], processedObjects, parentTypeName)}[]`;
                    }
                }
            } else if (typeof value === 'object') {
                // 为对象生成结构化类型
                typeStr = this.parseValue(value, processedObjects, parentTypeName, nextIndent);
            } else {
                typeStr = this.basicTypeMap.get(typeof value) || 'any';
            }
            
            return `${indentStr}${safeKey}: ${typeStr};`;
        }).join('\n');
    }


    
    // 解析值的类型
    private static parseValue(value: any, processedObjects: Set<object>, parentTypeName: string, indent: number = 2): string {
        if (value === null) return 'null';
        
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            
            // 检查数组是否包含已处理的对象（循环引用）
            if (processedObjects.has(value)) {
                return parentTypeName;
            }
            
            processedObjects.add(value);
            const itemType = this.parseValue(value[0], processedObjects, parentTypeName, indent + 2);
            processedObjects.delete(value);
            
            return `${itemType}[]`;
        }
        
        if (typeof value === 'object') {
            // 检查对象是否已处理（循环引用）
            if (processedObjects.has(value)) {
                return parentTypeName;
            }
            
            const structureHash = this.getStructureHash(value);
            
            // 检查结构注册表中是否已存在相同结构
            if (this.structureRegistry.has(structureHash)) {
                // 如果已经存在相同结构，直接返回类型名称
                return this.structureRegistry.get(structureHash)!.typeName;
            }
            
            // 否则，内联对象结构
            processedObjects.add(value);
            const nestedProperties = this.getObjectProperties(value, processedObjects, parentTypeName, indent);
            processedObjects.delete(value);
            
            return `{\n${nestedProperties}\n${' '.repeat(indent - 2)}}`;
        }
        
        return this.basicTypeMap.get(typeof value) || 'any';
    }
}