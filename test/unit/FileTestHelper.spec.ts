import { FileTestHelper } from '../../lib/FileTestHelper'
import fs from 'fs'

describe('FileTestHelper', () => {
  describe('createFile', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy.txt', 'test')
      const content = fs.readFileSync('dummy.txt').toString()
      expect(content).toEqual('test')
      helper.cleanup()
    })

    it('happy path with subdir', () => {
      const helper = new FileTestHelper()
      helper.createFile('tempdir/dummy123.txt', 'test')
      expect(helper.fileExists('tempdir/dummy123.txt')).toEqual(true)
      helper.cleanup()
    })
  })

  describe('getFileTextContent', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy.txt', 'test')
      const content = helper.getFileTextContent('dummy.txt')
      expect(content).toEqual('test')
      helper.cleanup()
    })
  })

  describe('getFileGlobTextContent', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy123.txt', 'test')
      const content = helper.getFileGlobTextContent('dummy*.txt')
      expect(content.length).toEqual(1)
      expect(content[0]).toEqual('test')
      helper.cleanup()
    })

    it('works with base path', () => {
      const helper = new FileTestHelper({ basePath: 'pandas' })
      helper.createFile('bears123.txt', 'test')
      const content = helper.getFileGlobTextContent('pandas/bears*.txt')
      expect(content.length).toEqual(1)
      expect(content[0]).toEqual('test')
      helper.registerForCleanup('../pandas')
      helper.cleanup()
    })
  })

  describe('fileExists', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy.txt', 'test')
      expect(helper.fileExists('dummy.txt')).toEqual(true)
      helper.cleanup()
    })

    it('file does not exist', () => {
      const helper = new FileTestHelper()
      expect(helper.fileExists('dummy.txt')).toEqual(false)
    })
  })

  describe('fileGlobExists', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy123.txt', 'test')
      expect(helper.fileGlobExists('dummy*.txt')).toEqual(1)
      helper.cleanup()
    })

    it('file does not exist', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy123.txt', 'test')
      expect(helper.fileGlobExists('dummy2*.txt')).toEqual(0)
      helper.cleanup()
    })
  })

  describe('deleteFile', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy.txt', 'test')
      expect(helper.fileExists('dummy.txt')).toEqual(true)
      helper.deleteFile('dummy.txt')
      expect(helper.fileExists('dummy.txt')).toEqual(false)
    })

    it('can also delete directory', () => {
      const helper = new FileTestHelper()
      helper.createDir('dummyDir')
      expect(helper.dirExists('dummyDir')).toEqual(true)
      helper.deleteDir('dummyDir')
      expect(helper.dirExists('dummyDir')).toEqual(false)
    })
  })

  describe('deleteFileGlob', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy123.txt', 'test')
      expect(helper.fileExists('dummy123.txt')).toEqual(true)
      helper.deleteFileGlob('dummy*.txt')
      expect(helper.fileExists('dummy123.txt')).toEqual(false)
    })
  })

  describe('cleanup', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      helper.createFile('dummy.txt', 'test')
      expect(helper.fileExists('dummy.txt')).toEqual(true)
      helper.cleanup()
      expect(helper.fileExists('dummy.txt')).toEqual(false)
    })
  })

  describe('registerForCleanup', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      fs.writeFileSync('dummy.txt', 'test')
      helper.registerForCleanup('dummy.txt')
      expect(helper.fileExists('dummy.txt')).toEqual(true)
      helper.cleanup()
      expect(helper.fileExists('dummy.txt')).toEqual(false)
    })
  })

  describe('registerGlobForCleanup', () => {
    it('happy path', () => {
      const helper = new FileTestHelper()
      fs.writeFileSync('dummy123.txt', 'test')
      helper.registerGlobForCleanup('dummy*.txt')
      expect(helper.fileExists('dummy123.txt')).toEqual(true)
      helper.cleanup()
      expect(helper.fileExists('dummy123.txt')).toEqual(false)
    })

    it('happy path with subdir', () => {
      const helper = new FileTestHelper()
      helper.createFile('tempdir/dummy123.txt', 'test')

      const helper2 = new FileTestHelper()
      helper2.registerGlobForCleanup('tempdir/dummy*.txt')
      expect(helper2.fileExists('tempdir/dummy123.txt')).toEqual(true)
      helper2.registerForCleanup('tempdir')
      helper2.cleanup()
      expect(helper2.fileExists('tempdir/dummy123.txt')).toEqual(false)
    })
  })
})
