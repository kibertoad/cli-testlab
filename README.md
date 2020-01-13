# cli-testlab
Node.js test framework for CLI utilities


## Example usage

### Basic usage

```
const { execCommand } = require('cli-testlab')

describe('CLI app under test', () => {
  it('expect error', async () => {
    return execCommand(`node appUnderTest.js error Kaboom`, {
      expectedErrorMessage: 'Kaboom'
    })
  })

  it('expect output X', async () => {
    return execCommand(`node appUnderTest.js message OK`, {
      expectedOutput: 'OK'
    })
  })

  it('do not expect output Y', async () => {
    return execCommand(`node appUnderTest.js message OK`, {
      notExpectedOutput: 'error'
    })
  })
})
```

### File cleanup usage

```
const path = require('path');
const { execCommand, FileTestHelper } = require('cli-testlab');
const { expect } = require('chai');

describe('Application under test', () => {
  describe('Tests that require cleanup', () => {
    /**
     * @type FileTestHelper
     */
    let fileHelper;
    beforeEach(() => {
     fileHelper = new FileTestHelper(
         path.resolve(__dirname, '../directoryForNewFiles')
       );
    });

    afterEach(() => {
      fileHelper.cleanup();
    });

    it('Test that requires cleanup', async () => {
      fileHelper.registerGlobForCleanup(
        'test/directoryForNewFiles/*_somename.js'
      );

      await execCommand(
        `node appThatCreatesFiles.js`,
        {
          expectedOutput: 'File created succesfully',
        }
      );

      const fileCount = fileHelper.fileGlobExists(
        'test/directoryForNewFiles/*_somename.js'
      );
      expect(fileCount).to.equal(1);
    });
```
