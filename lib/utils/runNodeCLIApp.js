const path = require('path');

/**
 *
 * @param {string} pathToApp
 * @param {string[]} [args] - cmdline args that will be passed to application
 */
function runNodeCLIApp(pathToApp, args = []) {
  process.argv.push(...args);
  require(path.resolve(pathToApp));
}

module.exports = {
  runNodeCLIApp
};
