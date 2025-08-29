import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        service: resolve(__dirname, 'src/service.ts')
      },
      name: 'ComposioGoogleWorkspace',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    target: 'node18',
    rollupOptions: {
      external: [
        '@composio/core',
        '@composio/anthropic', 
        '@anthropic-ai/sdk',
        'dotenv',
        'express',
        /^node:/
      ]
    },
    sourcemap: true,
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  esbuild: {
    target: 'node18'
  }
})