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
})
