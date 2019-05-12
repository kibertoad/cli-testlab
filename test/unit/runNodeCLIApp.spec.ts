import { runNodeCLIApp } from '../../lib/utils/runNodeCLIApp'
import path from 'path'

const pathToApp = path.normalize(__dirname + '/../util/apps/basic.cli.app.js')

describe('runNodeCLIApp', () => {
  it('executes with an error', async () => {
    expect(() => {
      runNodeCLIApp(pathToApp, 'error Kaboom'.split(' '), { resetArgv: true })
    }).toThrowErrorMatchingSnapshot()
  })

  it('executes without an error', async () => {
    expect(() => {
      runNodeCLIApp(pathToApp, 'message Okay'.split(' '), { resetArgv: true })
    }).not.toThrowError()
  })
})
