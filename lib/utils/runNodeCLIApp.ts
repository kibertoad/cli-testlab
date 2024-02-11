import path from 'path'

/**
 * Load and execute given JS script file. Uses Node.js require instead of native CLI execution. This allows to use debugger on
 * script under test, but does not constitute a full e2e test. Recommended to use for debugging purpose, but not for tests that
 * will be executed in CI
 * @param {string} pathToApp - path to JS file
 * @param {string[]} [args] - cmdline args that will be passed to application
 * @param resetArgv - remove preexisting argv values (useful when used with Jest to avoid argv pollution)
 */
export function runNodeCLIApp(
  pathToApp: string,
  args: any[] = [],
  { resetArgv = false }: { resetArgv?: boolean } = {},
) {
  if (resetArgv) {
    process.argv = process.argv.slice(0, 2)
  }
  process.argv.push(...args)
  require(path.resolve(pathToApp))
}
