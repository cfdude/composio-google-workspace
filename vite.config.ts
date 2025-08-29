import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ComposioGoogleWorkspace',
      formats: ['es'],
      fileName: 'index'
    },
    target: 'node18',
    rollupOptions: {
      external: [
        '@composio/core',
        '@composio/anthropic', 
        '@anthropic-ai/sdk',
        'dotenv',
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