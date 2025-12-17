import fs from 'fs';
import path from 'path';
import type { ApiTypeRecord } from '../types';

/**
 * 类型文件写入器类
 * 负责API类型文件的生成和写入操作
 */
export class TypeFileWriter {
    private outputDir: string;
    private typeFileName: string;
    private moduleDir: string;
    private getModuleName: (url: string) => string;

    /**
     * 构造函数
     * @param options 配置选项
     */
    constructor(options: {
        outputDir: string;
        typeFileName: string;
        moduleDir: string;
        getModuleName: (url: string) => string;
    }) {
        this.outputDir = options.outputDir;
        this.typeFileName = options.typeFileName;
        this.moduleDir = options.moduleDir;
        this.getModuleName = options.getModuleName;
    }

    /**
     * 按模块分组API类型
     * @param apiTypes API类型记录
     * @returns 按模块分组的类型记录
     */
    groupTypesByModule(apiTypes: ApiTypeRecord): Record<string, string[]> {
        const moduleTypes: Record<string, string[]> = {};
        
        for (const [url, { type }] of Object.entries(apiTypes)) {
            const moduleName = this.getModuleName(url);
            if (!moduleTypes[moduleName]) {
                moduleTypes[moduleName] = [];
            }
            moduleTypes[moduleName].push(type);
        }
        
        return moduleTypes;
    }

    /**
     * 确定模块文件的输出路径
     * @param moduleName 模块名称
     * @returns 文件路径
     */
    getModuleFilePath(moduleName: string): string {
        const isMainModule = moduleName === this.typeFileName.replace('.d.ts', '');
        const fileName = isMainModule ? this.typeFileName : `${moduleName}.d.ts`;
        
        if (isMainModule) {
            return path.resolve(this.outputDir, fileName);
        } else if (this.moduleDir) {
            const moduleDirPath = path.resolve(this.outputDir, this.moduleDir);
            fs.mkdirSync(moduleDirPath, { recursive: true, mode: 0o755 });
            return path.resolve(moduleDirPath, fileName);
        } else {
            return path.resolve(this.outputDir, fileName);
        }
    }

    /**
     * 生成类型文件内容
     * @param typeEntries 类型条目数组
     * @returns 文件内容
     */
    generateTypeFileContent(typeEntries: string[]): string {
        return [
            `// 自动生成的API类型声明 - ${new Date().toLocaleString()}`,
            `/* eslint-disable */`,
            `declare global {`,
            ...typeEntries.map(t => t.replace(/export /g, '')), // 转为全局类型
            `}`,
            `export {};`
        ].join('\n\n');
    }

    /**
     * 写入类型文件
     * @param apiTypes API类型记录
     */
    writeTypesFile(apiTypes: ApiTypeRecord): void {
        try {
            const moduleTypes = this.groupTypesByModule(apiTypes);
            
            for (const [moduleName, typeEntries] of Object.entries(moduleTypes)) {
                const filePath = this.getModuleFilePath(moduleName);
                const content = this.generateTypeFileContent(typeEntries);
                fs.writeFileSync(filePath, content, 'utf-8');
            }
        } catch (err) {
            console.error('写入API类型文件失败:', err);
        }
    }
}
