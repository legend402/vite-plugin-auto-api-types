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

    // 生成TS类型字符串
    static generateType(name: string, data: any): string {
        if (Array.isArray(data)) {
            const itemType = data.length > 0
                ? this.parseValue(data[0])
                : 'any';
            return `export type ${name} = ${itemType}[];\n`;
        }

        if (typeof data === 'object' && data !== null) {
            const properties = this.getObjectProperties(data);
            return `export type ${name} = {\n${properties}\n};\n`;
        }

        return `export type ${name} = ${this.parseValue(data)};\n`;
    }

    // 获取对象属性的字符串表示
    private static getObjectProperties(obj: any, indent: number = 2): string {
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
                    const itemType = this.parseValue(value[0], nextIndent);
                    typeStr = `${itemType}[]`;
                }
            } else if (typeof value === 'object') {
                const nestedProperties = this.getObjectProperties(value, nextIndent);
                typeStr = `{\n${nestedProperties}\n${' '.repeat(indent)}}`;
            } else {
                typeStr = this.basicTypeMap.get(typeof value) || 'any';
            }
            
            return `${indentStr}${safeKey}: ${typeStr};`;
        }).join('\n');
    }

    // 解析值的类型
    private static parseValue(value: any, indent: number = 2): string {
        if (value === null) return 'null';
        
        if (Array.isArray(value)) {
            if (value.length === 0) return 'any[]';
            const itemType = this.parseValue(value[0], indent + 2);
            return `${itemType}[]`;
        }
        
        if (typeof value === 'object') {
            const nestedProperties = this.getObjectProperties(value, indent);
            return `{\n${nestedProperties}\n${' '.repeat(indent - 2)}}`;
        }
        
        return this.basicTypeMap.get(typeof value) || 'any';
    }
}