import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/utils/TypeWorkerThread.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  outExtension: (ctx) => {
    return {
      js: ctx.format === 'cjs' ? '.cjs' : '.js'
    }
  }
})