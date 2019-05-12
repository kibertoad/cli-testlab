import { AssertionError } from './AssertionError'

require('jake')

declare global {
  // @ts-ignore
  const jake: any
  // @ts-ignore
  const task: any
  // @ts-ignore
  const desc: any
}

declare interface ExecResult {
  stdout: string
  stderr: string
}

/**
 * Execute given commandline command
 */
export function execCommand(
  cliCommand: string,
  {
    description,
    expectedErrorMessage,
    expectedOutput
  }: {
    description?: string
    expectedErrorMessage?: string
    expectedOutput?: string
  } = {}
): Promise<ExecResult> {
  description = description || 'Run ' + cliCommand
  return new Promise((resolve, reject) => {
    let stderr = ''
    let stdout = ''
    const bin = jake.createExec([cliCommand])
    bin.addListener('error', (msg: string, _code: any) => {
      // Error is expected
      if (expectedErrorMessage) {
        if (!msg.includes(expectedErrorMessage)) {
          throw new AssertionError(`Expect error to include "${expectedErrorMessage}", but it was actually "${msg}"`)
        }
        return resolve({ stdout, stderr })
      }

      // Error is not expected
      return reject(Error(description + ' FAIL. ' + stderr))
    })
    bin.addListener('cmdEnd', (_cmd: string) => {
      if (expectedErrorMessage) {
        throw new AssertionError('Error was expected, but none thrown')
      }

      if (expectedOutput) {
        if (!stdout.includes(expectedOutput)) {
          throw new AssertionError(`Expect error to include "${expectedOutput}", but it was actually "${stdout}"`)
        }
        return resolve({ stdout, stderr })
      }

      return resolve({ stdout, stderr })
    })

    bin.addListener('stdout', (data: any) => (stdout += data.toString()))
    bin.addListener('stderr', (data: any) => (stderr += data.toString()))
    bin.run()
  })
}
