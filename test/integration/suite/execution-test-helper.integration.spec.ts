import path from 'path'

import { execCommand } from '../../../lib/execution-test-helper'
import { describe, it, expect } from 'vitest'
const pathToApp = path.normalize(__dirname + '/../../util/apps/basic.cli.app.js')

describe('execution-test-helper', () => {
  it('supports baseDir param', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      baseDir: 'node_modules/.bin/',
      expectedOutput: 'OK',
    })
  })

  it('executes with an error', async () => {
    await execCommand(`node ${pathToApp} error Kaboom`, {
      expectedErrorMessage: 'Kaboom',
    })
  })

  it('supports multiple error assertions', async () => {
    await execCommand(`node ${pathToApp} error Crash-and-burn`, {
      expectedErrorMessage: ['Crash', 'burn'],
    })
  })

  it('can assert both error and a message and fail', async () => {
    expect.assertions(1)
    try {
      await execCommand(`node ${pathToApp} error Crash-and-burn`, {
        expectedErrorMessage: ['Crash', 'burn'],
        expectedOutput: 'OK',
      })
    } catch (err: any) {
      expect(err.message.startsWith('Expected output to include "OK"')).toBeTruthy()
    }
  })

  it('can assert both error and a numbered occurrence message and fail', async () => {
    expect.assertions(1)
    try {
      await execCommand(`node ${pathToApp} error Crash-and-burn`, {
        expectedErrorMessage: ['Crash', 'burn'],
        expectedOutput: { exactlyTimes: 1, expectedText: 'OK' },
      })
    } catch (err: any) {
      expect(err.message.startsWith('Expected output to include "OK"')).toBeTruthy()
    }
  })

  it('can assert both error and a message and succeed', async () => {
    await execCommand(`node ${pathToApp} error Crash-and-burn`, {
      expectedErrorMessage: ['Crash', 'burn'],
      expectedOutput: 'Will throw an error shortly.',
    })
  })

  it('can assert both error and a numbered occurrence message and succeed', async () => {
    await execCommand(`node ${pathToApp} error Crash-and-burn`, {
      expectedErrorMessage: ['Crash', 'burn'],
      expectedOutput: { exactlyTimes: 1, expectedText: 'Will throw an error shortly.' },
    })
  })

  it('executes without an error', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      expectedOutput: 'OK',
    })
  })

  it('can combine positive and negative assertion', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      expectedOutput: 'OK',
      notExpectedOutput: 'Mecha',
    })
  })

  it('can combine positive and negative assertion and fail', async () => {
    expect.assertions(1)
    try {
      await execCommand(`node ${pathToApp} message OK`, {
        expectedOutput: 'OK',
        notExpectedOutput: 'OK',
      })
    } catch (err: any) {
      expect(err.message.startsWith('Expected output not to include "OK", but it was actually "OK')).toBeTruthy()
    }
  })

  it('supports multiple assertions', async () => {
    await execCommand(`node ${pathToApp} message OK-and-fine`, {
      expectedOutput: ['OK', 'fine'],
    })
  })

  it('supports exact amount of occurrences', async () => {
    await execCommand(`node ${pathToApp} message ok-ok-ok-and-fine`, {
      expectedOutput: { expectedText: 'ok', exactlyTimes: 3 },
    })
  })

  it('throws an error if there is not an exact amount of occurrences', async () => {
    expect.assertions(1)
    try {
      await execCommand(`node ${pathToApp} message ok-ok-ok-and-fine`, {
        expectedOutput: { expectedText: 'ok', exactlyTimes: 2 },
      })
    } catch (err: any) {
      expect(
        err.message.startsWith('Expected output to include "ok" exactly 2 times, but it was included 3 times.'),
      ).toBeTruthy()
    }
  })

  it('throws an error if not expected text exists', async () => {
    expect.assertions(1)

    try {
      await execCommand(`node ${pathToApp} message OK`, {
        notExpectedOutput: 'OK',
      })
    } catch (err: any) {
      expect(err.message.startsWith('Expected output not to include "OK", but it was actually "OK')).toBeTruthy()
    }
  })

  it('does not include unexpected text', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      notExpectedOutput: 'error',
    })
  })

  it('supports multiple negative assertions', async () => {
    await execCommand(`node ${pathToApp} message OK-and-fine`, {
      notExpectedOutput: ['error', 'warning'],
    })
  })
})
