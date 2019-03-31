'use strict';

const path = require('path');
const { assertExec, assertExecError, test } = require('../../../lib/migration-test-helper');
const { assert } = require('chai');

const pathToApp = path.normalize(__dirname + '/../cli/basic.cli.app.js');

const taskList = [];
/* * * TESTS * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

test(taskList, 'Expect error during execution', temp => {
  return assertExecError(`node ${pathToApp} error Kaboom`);
});

test(taskList, 'Expect no error during execution', temp => {
  return assertExec(`node ${pathToApp} message OK`);
});

module.exports = {
  taskList
};
