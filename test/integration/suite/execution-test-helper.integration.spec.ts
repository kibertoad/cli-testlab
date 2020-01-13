import path from 'path'

const { execCommand } = require('../../../lib/execution-test-helper')
const pathToApp = path.normalize(__dirname + '/../../util/apps/basic.cli.app.js')

describe('execution-test-helper', () => {
  it('executes with an error', async () => {
    return execCommand(`node ${pathToApp} error Kaboom`, {
      expectedErrorMessage: 'Kaboom'
    })
  })

  it('executes without an error', async () => {
    return execCommand(`node ${pathToApp} message OK`, {
      expectedOutput: 'OK'
    })
  })

  it('does not include unexpected text', async () => {
    return execCommand(`node ${pathToApp} message OK`, {
      notExpectedOutput: 'error'
    })
  })
})
