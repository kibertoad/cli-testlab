# cli-testlab

[![NPM Version][npm-image]][npm-url]

A test framework for Node.js CLI applications. It provides utilities to execute commands, assert on their output, and manage test files with automatic cleanup.

## Installation

```bash
npm install cli-testlab --save-dev
```

## Quick Start

Testing a CLI application typically involves running commands and checking their output. Here's a simple example:

```typescript
import { execCommand } from 'cli-testlab'

// Run a command and verify it outputs the expected text
await execCommand('node my-cli.js --version', {
  expectedOutput: '1.0.0'
})

// Run a command and verify it fails with a specific error
await execCommand('node my-cli.js unknown-command', {
  expectedErrorMessage: 'Unknown command'
})
```

## Core Concepts

### Command Execution

The `execCommand` function is the primary way to test CLI applications. It spawns a child process, captures stdout and stderr, and provides built-in assertions for common testing patterns.

When a command exits with code 0 (success), any `expectedOutput` assertions are checked against stdout. When a command exits with a non-zero code (failure), you can use `expectedErrorMessage` to assert on stderr content.

### Output Assertions

There are three types of output assertions:

1. **Positive assertions** (`expectedOutput`) - verify that specific text appears in the output
2. **Negative assertions** (`notExpectedOutput`) - verify that specific text does NOT appear
3. **Error assertions** (`expectedErrorMessage`) - verify error messages when commands fail

All assertions support both single strings and arrays of strings for multiple checks.

### Environment Variables

CLI applications often rely on environment variables for configuration. You can pass custom environment variables that will be merged with the current `process.env`:

```typescript
await execCommand('node my-cli.js migrate', {
  env: { DATABASE_URL: 'postgres://localhost/test' },
  expectedOutput: 'Migration complete'
})
```

### File Management

Many CLI tools create, modify, or delete files. The `FileTestHelper` class helps manage test files by tracking what was created and cleaning up after tests complete.

## API Reference

### execCommand(command, params?)

Executes a shell command and optionally asserts on its output.

**Parameters:**

- `command` (string) - The command to execute, exactly as you would type it in a terminal
- `params` (object, optional) - Configuration and assertions

**Available options:**

| Option | Type | Description |
|--------|------|-------------|
| `expectedOutput` | string, string[], or object | Text that must appear in stdout |
| `expectedErrorMessage` | string or string[] | Text that must appear in stderr (for failed commands) |
| `notExpectedOutput` | string or string[] | Text that must NOT appear in stdout |
| `env` | object | Environment variables to set for this command |
| `baseDir` | string | Working directory for the command |
| `description` | string | Custom label for error messages |

**Returns:** A promise that resolves to `{ stdout: string, stderr: string }`

**Examples:**

```typescript
import { execCommand } from 'cli-testlab'

// Simple output check
await execCommand('echo hello', {
  expectedOutput: 'hello'
})

// Multiple output checks - all must pass
await execCommand('node status.js', {
  expectedOutput: ['connected', 'ready', 'healthy']
})

// Verify something is NOT in the output
await execCommand('node build.js', {
  expectedOutput: 'Build complete',
  notExpectedOutput: 'warning'
})

// Check exact number of occurrences
await execCommand('node list-users.js', {
  expectedOutput: { expectedText: 'user:', exactlyTimes: 5 }
})

// Test error handling
await execCommand('node app.js --invalid-flag', {
  expectedErrorMessage: 'Unknown option: --invalid-flag'
})

// Pass environment variables
await execCommand('node deploy.js', {
  env: {
    NODE_ENV: 'production',
    API_KEY: 'test-key'
  },
  expectedOutput: 'Deployed successfully'
})

// Change working directory
await execCommand('npm test', {
  baseDir: './packages/core'
})

// Get raw output for custom assertions
const result = await execCommand('node info.js')
const data = JSON.parse(result.stdout)
expect(data.version).toBe('2.0.0')
```

---

### FileTestHelper

A utility class for managing files created during tests. It tracks files and directories so they can be automatically cleaned up, preventing test pollution.

**Why use FileTestHelper?**

When testing CLI tools that generate files, you need to:
1. Verify the files were created correctly
2. Clean up after each test to avoid interference between tests
3. Handle cleanup even when tests fail

FileTestHelper solves all of these by providing file operations with built-in cleanup tracking.

**Creating an instance:**

```typescript
import { FileTestHelper } from 'cli-testlab'

const files = new FileTestHelper({
  basePath: './test-output',  // Base directory for relative paths
  maxRetries: 10,             // Retry count for locked file deletion
  retryDelay: 5               // Milliseconds between retries
})
```

**Typical test pattern:**

```typescript
describe('file generation', () => {
  let files: FileTestHelper

  beforeEach(() => {
    files = new FileTestHelper({ basePath: './test-output' })
  })

  afterEach(() => {
    files.cleanup()  // Deletes all tracked files
  })

  it('generates a config file', async () => {
    // Register files that will be created by the CLI
    files.registerGlobForCleanup('test-output/*.json')

    await execCommand('node generate-config.js --output test-output/', {
      expectedOutput: 'Config generated'
    })

    // Verify the file exists
    expect(files.fileExists('config.json')).toBe(true)

    // Check its contents
    const content = files.getFileTextContent('config.json')
    expect(JSON.parse(content)).toHaveProperty('version')
  })
})
```

**Available methods:**

#### Checking existence

```typescript
// Check if a specific file exists
files.fileExists('output/data.json')  // returns boolean

// Check if a directory exists
files.dirExists('output/logs')  // returns boolean

// Count files matching a glob pattern
files.fileGlobExists('output/*.json')  // returns number
```

#### Reading content

```typescript
// Read a single file
const content = files.getFileTextContent('output/data.json')

// Read all files matching a pattern
const allContents = files.getFileGlobTextContent('output/*.json')  // returns string[]
```

#### Creating files and directories

Files created through these methods are automatically registered for cleanup:

```typescript
// Create a file (parent directories are created automatically)
files.createFile('output/test.json', '{"test": true}')

// Create without auto-cleanup registration
files.createFile('output/keep.json', 'data', { willBeCleanedUp: false })

// Create a directory
files.createDir('output/logs')
```

#### Deleting files

```typescript
// Delete a specific file
files.deleteFile('output/temp.json')

// Delete a directory and its contents
files.deleteDir('output/cache')

// Delete files matching a glob pattern
files.deleteFileGlob('output/*.tmp')
```

#### Cleanup registration

```typescript
// Register a file for cleanup (done automatically by createFile/createDir)
files.registerForCleanup('output/generated.json')

// Register a glob pattern for cleanup
files.registerGlobForCleanup('output/**/*.log')

// Execute cleanup - removes all registered files and globs
files.cleanup()
```

---

## TypeScript Support

All functions and classes are fully typed. You can import types for use in your own code:

```typescript
import { execCommand, FileTestHelper } from 'cli-testlab'
import type { CommandParams, FileTestHelperConfig } from 'cli-testlab'

const options: CommandParams = {
  env: { DEBUG: 'true' },
  expectedOutput: 'success'
}

await execCommand('node app.js', options)
```

## Common Patterns

### Testing a CLI with subcommands

```typescript
describe('my-cli', () => {
  const cli = 'node ./bin/my-cli.js'

  it('shows help', async () => {
    await execCommand(`${cli} --help`, {
      expectedOutput: ['Usage:', 'Commands:', 'Options:']
    })
  })

  it('shows version', async () => {
    await execCommand(`${cli} --version`, {
      expectedOutput: '1.0.0'
    })
  })

  it('handles unknown commands', async () => {
    await execCommand(`${cli} unknown`, {
      expectedErrorMessage: 'Unknown command: unknown'
    })
  })
})
```

### Testing with database connections

```typescript
describe('database commands', () => {
  const connectionString = 'postgres://localhost/test'

  it('runs migrations', async () => {
    await execCommand('node cli.js migrate', {
      env: { DATABASE_URL: connectionString },
      expectedOutput: 'Migrations complete'
    })
  })

  it('checks connection', async () => {
    await execCommand('node cli.js ping', {
      env: { DATABASE_URL: connectionString },
      expectedOutput: 'Connected'
    })
  })
})
```

### Testing file generation with cleanup

```typescript
describe('code generator', () => {
  let files: FileTestHelper

  beforeEach(() => {
    files = new FileTestHelper({ basePath: './generated' })
    files.registerGlobForCleanup('generated/**/*')
  })

  afterEach(() => {
    files.cleanup()
  })

  it('generates component files', async () => {
    await execCommand('node generate.js component Button', {
      expectedOutput: 'Created Button component'
    })

    expect(files.fileExists('components/Button.tsx')).toBe(true)
    expect(files.fileExists('components/Button.test.tsx')).toBe(true)

    const component = files.getFileTextContent('components/Button.tsx')
    expect(component).toContain('export function Button')
  })
})
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/cli-testlab.svg
[npm-url]: https://npmjs.org/package/cli-testlab
