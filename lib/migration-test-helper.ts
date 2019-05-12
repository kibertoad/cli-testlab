import { AssertionError } from './AssertionError'

require('jake')
import os from 'os'
import fs from 'fs'
import { sync as rimrafSync } from 'rimraf'

declare global {
  // @ts-ignore
  const jake: any
  // @ts-ignore
  const task: any
  // @ts-ignore
  const desc: any
}

/**
 * Execute given commandline command and expect it not to throw an error
 */
export function assertExec(
  cmd: string,
  {
    description
  }: {
    description?: string
  } = {}
): Promise<object> {
  description = description || 'Run ' + cmd
  return new Promise((resolve, reject) => {
    let stderr = ''
    let stdout = ''
    const bin = jake.createExec([cmd])
    bin.addListener('error', (_msg: string, _code: any) => reject(Error(description + ' FAIL. ' + stderr)))
    bin.addListener('cmdEnd', (cmd: string) => resolve({ cmd, stdout, stderr }))
    bin.addListener('stdout', (data: any) => (stdout += data.toString()))
    bin.addListener('stderr', (data: any) => (stderr += data.toString()))
    bin.run()
  })
}

export function assertExecError(
  cmd: string,
  {
    expectedErrorMessage
  }: {
    expectedErrorMessage?: string
  } = {}
): Promise<any> {
  return new Promise((resolve, _reject) => {
    let stderr = ''
    const bin = jake.createExec([cmd])
    bin.addListener('error', (msg: string, _code: any) => {
      if (expectedErrorMessage && !msg.includes(expectedErrorMessage)) {
        throw new AssertionError(`Expect error to include "${expectedErrorMessage}", but it was actually "${msg}"`)
      }

      resolve(stderr)
    })
    bin.addListener('cmdEnd', () => {
      throw new AssertionError('Error was expected, but none thrown')
    })
    bin.addListener('stderr', (data: any) => (stderr += data.toString()))
    bin.run()
  })
}

export function test(taskList: any[], description: string, func: Function) {
  const tmpDirPath = os.tmpdir() + '/knex-test-'
  rimrafSync(tmpDirPath)
  const tempFolder = fs.mkdtempSync(tmpDirPath)
  desc(description)
  const taskName = description.replace(/[^a-z0-9]/g, '')
  taskList.push(taskName)
  task(taskName, { async: true }, () => {
    let itFails = false
    return func(tempFolder)
      .then(() => {
        console.log('☑ ' + description)
      })
      .catch((err: Error) => {
        console.log('☒ ' + err.message)
        itFails = true
      })
      .then(() => {
        rimrafSync(tmpDirPath)
        rimrafSync(__dirname + '/../test.sqlite3')
        if (itFails) {
          process.exit(1)
        }
      })
  })
}
