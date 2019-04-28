import path from 'path';

/**
 *
 * @param {string} pathToApp
 * @param {string[]} [args] - cmdline args that will be passed to application
 */
export function runNodeCLIApp(pathToApp: string, args: any[] = []) {
  process.argv.push(...args);
  require(path.resolve(pathToApp));
}
