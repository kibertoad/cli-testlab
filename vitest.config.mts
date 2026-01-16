import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    maxWorkers: 1,
    watch: false,
    environment: 'node',
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: [
        "lib/utils/runNodeCLIApp.ts"
      ],
      reporter: ['text'],
      thresholds: {
        statements: 91,
        branches: 73,
        functions: 97,
        lines: 92
      },
    },
  },
})
