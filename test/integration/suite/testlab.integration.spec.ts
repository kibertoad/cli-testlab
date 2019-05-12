import path from 'path'

const { assertExec, assertExecError } = require('../../../lib/migration-test-helper')
const pathToApp = path.normalize(__dirname + '/../../util/apps/basic.cli.app.js')

describe('testlab', () => {
  it('executes with an error', async () => {
    await assertExecError(`node ${pathToApp} error Kaboom`, {
      expectedErrorMessage: 'Kaboom'
    })
  })

  it('executes without an error', async () => {
    await assertExec(`node ${pathToApp} message OK`)
  })
})
