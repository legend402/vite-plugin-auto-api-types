// src/utils/TypeWorker.ts
import { Worker } from 'worker_threads';
import path from 'path';
import type { ApiTypeRecord } from '../types';

// 获取当前文件目录，兼容ES模块和CommonJS
const getCurrentDir = () => {
    // 由于tsup会将代码编译为两种格式，我们需要处理两种情况
    // 在CJS中，__dirname是可用的
    // 在ESM中，我们使用不同的方式获取路径
    // 注意：使用条件编译指令来避免构建警告
    // @ts-ignore
    if (typeof __dirname !== 'undefined') {
        // @ts-ignore
        return __dirname;
    } else {
        // 对于ESM，我们使用一种不会在CJS构建时被处理的方式
        // 这里我们通过创建一个URL对象来获取当前文件路径
        // @ts-ignore
        const __filename = new URL('', import.meta.url).pathname;
        // @ts-ignore
        return path.dirname(__filename);
    }
};

// 工作线程处理的任务类型
type WorkerTask = {
    type: 'generateType' | 'writeTypesFile';
    payload: any;
};

// 主进程接口
export class TypeWorkerManager {
    private worker: Worker | null = null;
    private taskQueue: ((result: any) => void)[] = [];
    private isReady = false;

    constructor() {
        this.initializeWorker();
    }

    private initializeWorker() {
        // 始终使用 CJS 版本的 Worker，因为它在两种环境中都应该能正常工作
        const workerPath = path.join(getCurrentDir(), 'utils', 'TypeWorkerThread.cjs');
        this.worker = new Worker(workerPath);

        this.worker.on('message', (message) => {
            if (message.type === 'ready') {
                this.isReady = true;
                // 处理队列中的任务
                this.processTaskQueue();
            } else if (message.type === 'result') {
                const resolve = this.taskQueue.shift();
                if (resolve) {
                    resolve(message.payload);
                }
            } else if (message.type === 'error') {
                const resolve = this.taskQueue.shift();
                if (resolve) {
                    resolve(null);
                }
                console.error('TypeWorker error:', message.error);
            }
        });

        this.worker.on('error', (error) => {
            console.error('TypeWorker failed:', error);
            this.taskQueue.forEach(resolve => resolve(null));
            this.taskQueue = [];
            // 重新初始化Worker
            this.initializeWorker();
        });
    }

    private processTaskQueue() {
        if (!this.isReady || !this.worker || this.taskQueue.length === 0) {
            return;
        }

        const task = this.taskQueue[0];
        // 任务将在收到message时处理
    }

    // 发送任务到Worker线程
    private sendTask(task: WorkerTask): Promise<any> {
        return new Promise((resolve) => {
            this.taskQueue.push(resolve);

            if (this.isReady && this.worker) {
                this.worker.postMessage(task);
            }
        });
    }

    // 生成类型
    async generateType(typeName: string, data: any): Promise<string> {
        return this.sendTask({
            type: 'generateType',
            payload: { typeName, data }
        });
    }

    // 写入类型文件
    async writeTypesFile(
        apiTypes: ApiTypeRecord,
        options: {
            outputDir: string;
            typeFileName: string;
            moduleDir: string;
            moduleMap: Record<string, string>;
        }
    ): Promise<void> {
        return this.sendTask({
            type: 'writeTypesFile',
            payload: { apiTypes, options }
        });
    }

    // 终止Worker
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
