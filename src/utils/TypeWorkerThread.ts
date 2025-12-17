// src/utils/TypeWorkerThread.ts
import { parentPort } from 'worker_threads';
import { TypeGenerator } from '../generators/TypeGenerator';
import { TypeFileWriter } from './TypeFileWriter';
import type { ApiTypeRecord } from '../types';

// 工作线程处理的任务类型
type WorkerTask = 
    | { type: 'generateType'; payload: { typeName: string; data: any } }
    | { type: 'writeTypesFile'; payload: { apiTypes: ApiTypeRecord; options: any } };


// 处理来自主进程的消息
parentPort?.on('message', async (task: WorkerTask) => {
    try {
        let result: any;

        switch (task.type) {
            case 'generateType':
                    const { typeName, data } = task.payload;
                    result = TypeGenerator.generateType(typeName, data);
                    break;

            case 'writeTypesFile':
                    const { apiTypes, options } = task.payload;
                    const { outputDir, typeFileName, moduleDir, moduleMap } = options as {
                        outputDir: string;
                        typeFileName: string;
                        moduleDir: string;
                        moduleMap: Record<string, string>;
                    };
                    
                    // 创建getModuleName函数
                    const getModuleName = (url: string): string => {
                        for (const [pathPattern, moduleName] of Object.entries(moduleMap)) {
                            if (url.startsWith(pathPattern)) {
                                return moduleName;
                            }
                        }
                        return typeFileName.replace('.d.ts', '');
                    };

                    // 创建TypeFileWriter实例并写入文件
                    const typeFileWriter = new TypeFileWriter({
                        outputDir,
                        typeFileName,
                        moduleDir,
                        getModuleName
                    });

                    typeFileWriter.writeTypesFile(apiTypes);
                    result = undefined;
                    break;

            default:
                throw new Error(`Unknown task type: ${task['type']}`);
        }

        // 发送结果回主进程
        parentPort?.postMessage({
            type: 'result',
            payload: result
        });
    } catch (error) {
        // 发送错误回主进程
        parentPort?.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 通知主进程Worker已准备就绪
parentPort?.postMessage({ type: 'ready' });
