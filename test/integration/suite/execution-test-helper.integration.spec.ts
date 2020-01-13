import path from 'path'

const { execCommand } = require('../../../lib/execution-test-helper')
const pathToApp = path.normalize(__dirname + '/../../util/apps/basic.cli.app.js')

describe('execution-test-helper', () => {
  it('executes with an error', async () => {
    await execCommand(`node ${pathToApp} error Kaboom`, {
      expectedErrorMessage: 'Kaboom'
    })
  })

  it('supports multiple error assertions', async () => {
    await execCommand(`node ${pathToApp} error Crash-and-burn`, {
      expectedErrorMessage: ['Crash', 'burn']
    })
  })

  it('executes without an error', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      expectedOutput: 'OK'
    })
  })

  it('supports multiple assertions', async () => {
    await execCommand(`node ${pathToApp} message OK-and-fine`, {
      expectedOutput: ['OK', 'fine']
    })
  })

  it('throws an error if not expected text exists', async () => {
    expect.assertions(1)

    try {
      await execCommand(`node ${pathToApp} message OK`, {
        notExpectedOutput: 'OK'
      })
    } catch (err) {
      expect(err.message.startsWith('Expected output not to include "OK", but it was actually "OK')).toBeTruthy()
    }
  })

  it('does not include unexpected text', async () => {
    await execCommand(`node ${pathToApp} message OK`, {
      notExpectedOutput: 'error'
    })
  })

  it('supports multiple negative assertions', async () => {
    await execCommand(`node ${pathToApp} message OK-and-fine`, {
      notExpectedOutput: ['error', 'warning']
    })
  })
})
