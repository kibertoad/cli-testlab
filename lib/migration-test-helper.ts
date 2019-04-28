import os from 'os';
import fs from 'fs';
import { sync as rimrafSync } from 'rimraf';

declare global {
  // @ts-ignore
  const jake: any;
  // @ts-ignore
  const task: any;
  // @ts-ignore
  const desc: any;
}

export function assertExec(cmd: string, description?: string) {
  description = description || 'Run ' + cmd;
  return new Promise((resolve, reject) => {
    let stderr = '';
    let stdout = '';
    // console.log(`Executing: ${cmd}`);
    const bin = jake.createExec([cmd]);
    bin.addListener('error', (_msg: string, _code: any) =>
      reject(Error(description + ' FAIL. ' + stderr))
    );
    bin.addListener('cmdEnd', (cmd: string) => resolve({ cmd, stdout, stderr }));
    bin.addListener('stdout', (data: any) => (stdout += data.toString()));
    bin.addListener('stderr', (data: any) => (stderr += data.toString()));
    bin.run();
  });
}

export function assertExecError(cmd: string, description?: string) {
  description = description || 'Run ' + cmd;
  return new Promise((resolve, _reject) => {
    let stderr = '';
    // console.log(`Executing: ${cmd}`);
    const bin = jake.createExec([cmd]);
    bin.addListener('error', (_msg: string, _code: any) => {
      resolve(stderr);
    });
    bin.addListener('cmdEnd', () => {
      throw new Error('Error was expected, but none thrown');
    });
    bin.addListener('stderr', (data: any) => (stderr += data.toString()));
    bin.run();
  });
}

export function test(taskList: any[], description: string, func: Function) {
  const tmpDirPath = os.tmpdir() + '/knex-test-';
  rimrafSync(tmpDirPath);
  const tempFolder = fs.mkdtempSync(tmpDirPath);
  desc(description);
  const taskName = description.replace(/[^a-z0-9]/g, '');
  taskList.push(taskName);
  task(taskName, { async: true }, () => {
    let itFails = false;
    return func(tempFolder)
      .then(() => {
        console.log('☑ ' + description);
      })
      .catch((err: Error) => {
        console.log('☒ ' + err.message);
        itFails = true;
      })
      .then(() => {
        rimrafSync(tmpDirPath);
        rimrafSync(__dirname + '/../test.sqlite3');
        if (itFails) {
          process.exit(1);
        }
      });
  });
}
