import { AssertionError } from './AssertionError'
import { EOL } from 'os'

require('jake')

declare global {
  const jake: any
  const task: any
  const desc: any
}

declare interface ExecResult {
  stdout: string
  stderr: string
}

function toStringArray(value?: string | string[]): string[] | undefined {
  if (typeof value === 'string') {
    return [value]
  }
  return value
}

function assertErrorMessages(msg: string, expectedErrorMessage: string[] | string | undefined, rejectFn: Function) {
  const expectedErrorMessages = toStringArray(expectedErrorMessage)

  const errors: string[] = []
  if (expectedErrorMessages && expectedErrorMessages.length > 0) {
    expectedErrorMessages.forEach((expectedEntry: string) => {
      if (!msg.includes(expectedEntry)) {
        errors.push(`Expected error to include "${expectedEntry}", but it was actually "${msg}"`)
      }
    })
  }
  if (errors.length > 0) {
    rejectFn(new AssertionError(errors.join('\n')))
  }
}

function assertOutput(stdout: string, expectedOutput: string[] | string | undefined, rejectFn: Function) {
  const expectedOutputs = toStringArray(expectedOutput)

  const errors: string[] = []
  if (expectedOutputs && expectedOutputs.length > 0) {
    expectedOutputs.forEach((expectedEntry: string) => {
      if (!stdout.includes(expectedEntry)) {
        errors.push(`Expected output to include "${expectedEntry}", but it was actually "${stdout}"`)
      }
    })
  }
  if (errors.length > 0) {
    rejectFn(new AssertionError(errors.join('\n')))
  }
}

function assertNotOutput(stdout: string, notExpectedOutput: string[] | string | undefined, rejectFn: Function) {
  const notExpectedOutputs = toStringArray(notExpectedOutput)

  const errors: string[] = []
  if (notExpectedOutputs && notExpectedOutputs.length > 0) {
    notExpectedOutputs.forEach((notExpectedEntry: string) => {
      if (stdout.includes(notExpectedEntry)) {
        errors.push(`Expected output not to include "${notExpectedEntry}", but it was actually "${stdout}"`)
      }
    })
  }
  if (errors.length > 0) {
    rejectFn(new AssertionError(errors.join('\n')))
  }
}

/**
 * Execute given commandline command
 */
export function execCommand(
  cliCommand: string,
  {
    description,
    expectedErrorMessage,
    expectedOutput,
    notExpectedOutput
  }: {
    description?: string
    expectedErrorMessage?: string | string[]
    expectedOutput?: string | string[]
    notExpectedOutput?: string | string[]
  } = {}
): Promise<ExecResult> {
  description = description || cliCommand
  return new Promise((resolve, reject) => {
    let stderr = ''
    let stdout = ''
    const bin = jake.createExec([cliCommand])
    bin.addListener('error', (msg: string, _code: any) => {
      // Error is expected
      if (expectedErrorMessage) {
        assertErrorMessages(msg, expectedErrorMessage, reject)
        return resolve({ stdout, stderr })
      }

      // Error is not expected
      return reject(Error(`${description} -> FAIL. ${EOL}Stdout: ${stdout} ${EOL}Error: ${stderr}`))
    })
    bin.addListener('cmdEnd', (_cmd: string) => {
      if (expectedErrorMessage) {
        throw new AssertionError('Error was expected, but none thrown')
      }

      if (expectedOutput) {
        assertOutput(stdout, expectedOutput, reject)
        return resolve({ stdout, stderr })
      }

      if (notExpectedOutput) {
        assertNotOutput(stdout, notExpectedOutput, reject)
        return resolve({ stdout, stderr })
      }

      return resolve({ stdout, stderr })
    })

    bin.addListener('stdout', (data: any) => (stdout += data.toString()))
    bin.addListener('stderr', (data: any) => (stderr += data.toString()))
    bin.run()
  })
}
