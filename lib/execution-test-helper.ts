import { AssertionError } from './AssertionError'
import { EOL } from 'os'
import child_process from 'child_process'

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

function assertErrorMessages(
  msg: string,
  expectedErrorMessage: string[] | string | undefined,
  rejectFn: (error: AssertionError) => void,
) {
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

function assertOutput(
  stdout: string,
  expectedOutput: string[] | string | NumberedTextOccurences | undefined,
  rejectFn: (error: AssertionError) => void,
) {
  const errors: string[] = []

  if (isNumberedTextOccurence(expectedOutput)) {
    const actualTimes = occurrences(stdout, expectedOutput.expectedText, false)

    if (actualTimes !== expectedOutput.exactlyTimes) {
      errors.push(
        `Expected output to include "${expectedOutput.expectedText}" exactly ${expectedOutput.exactlyTimes} times, but it was included ${actualTimes} times.`,
      )
    }
  } else {
    const expectedOutputs = toStringArray(expectedOutput)

    if (expectedOutputs && expectedOutputs.length > 0) {
      expectedOutputs.forEach((expectedEntry: string) => {
        if (!stdout.includes(expectedEntry)) {
          errors.push(`Expected output to include "${expectedEntry}", but it was actually "${stdout}"`)
        }
      })
    }
  }
  if (errors.length > 0) {
    rejectFn(new AssertionError(errors.join('\n')))
  }
}

function assertNotOutput(
  stdout: string,
  notExpectedOutput: string[] | string | undefined,
  rejectFn: (error: AssertionError) => void,
) {
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

export type CommandParams = {
  baseDir?: string
  description?: string
  expectedErrorMessage?: string | string[]
  expectedOutput?: string | string[] | NumberedTextOccurences
  notExpectedOutput?: string | string[]
}

export type NumberedTextOccurences = {
  expectedText: string
  exactlyTimes: number
}

export type OutputAssertion = string | string[]

/**
 * Execute given commandline command
 */
export function execCommand(cliCommand: string, params: CommandParams = {}): Promise<ExecResult> {
  if (params.baseDir) {
    process.chdir(params.baseDir)
  }

  const description = params.description || cliCommand
  return new Promise((resolve, reject) => {
    let stderr = ''
    let stdout = ''
    const bin = child_process.exec(cliCommand)

    bin.on('close', (exitCode: number) => {
      const isError = exitCode !== 0

      if (!isError) {
        if (params.expectedErrorMessage) {
          throw new AssertionError('Error was expected, but none thrown')
        }

        if (params.expectedOutput) {
          assertOutput(stdout, params.expectedOutput, reject)
        }

        if (params.notExpectedOutput) {
          assertNotOutput(stdout, params.notExpectedOutput, reject)
        }

        return resolve({ stdout, stderr })
      }

      // isError
      else {
        if (params.expectedErrorMessage) {
          assertErrorMessages(stderr, params.expectedErrorMessage, reject)
        }

        if (params.expectedOutput) {
          assertOutput(stdout, params.expectedOutput, reject)
        }

        if (params.notExpectedOutput) {
          assertNotOutput(stdout, params.notExpectedOutput, reject)
        }

        if (!params.expectedErrorMessage) {
          // Error is not expected
          return reject(Error(`${description} -> FAIL. ${EOL}Stdout: ${stdout} ${EOL}Error: ${stderr}`))
        }
        return resolve({ stdout, stderr })
      }
    })

    bin.stdout!.on('data', (data: any) => {
      stdout += data.toString()
    })

    bin.stderr!.on('data', (data: any) => {
      stderr += data.toString()
    })
  })
}

function isNumberedTextOccurence(entity: any): entity is NumberedTextOccurences {
  return entity && (entity as NumberedTextOccurences).exactlyTimes !== undefined
}

/** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 */
function occurrences(string: string, subString: string, allowOverlapping: boolean) {
  string += ''
  subString += ''
  if (subString.length <= 0) return string.length + 1

  let n = 0
  let pos = 0
  const step = allowOverlapping ? 1 : subString.length

  // eslint-disable-next-line no-constant-condition
  while (true) {
    pos = string.indexOf(subString, pos)
    if (pos >= 0) {
      ++n
      pos += step
    } else break
  }
  return n
}
