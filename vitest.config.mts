import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    poolOptions: {
      forks: {
        singleFork: true,
      }
    },
    pool: 'forks',
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
      all: true,
      thresholds: {
        statements: 94,
        branches: 75,
        functions: 97,
        lines: 94
      },
    },
  },
})
