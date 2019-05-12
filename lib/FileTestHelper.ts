import { sync as rimrafSync } from 'rimraf'
import path from 'path'
import fs from 'fs'

export class FileTestHelper {
  private basePath: string
  private filesToCleanup: string[] = []

  public constructor(basePath: string = './') {
    this.basePath = basePath
  }

  public fileExists(filePath: string) {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.existsSync(targetPath)
  }

  public getFileTextContent(filePath: string) {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.readFileSync(targetPath).toString()
  }

  /**
   * Create file and (optionally) register it for later cleanup
   */
  public createFile(filePath: string, fileContent: any, willBeCleanedUp: boolean = true) {
    if (willBeCleanedUp) {
      this.registerForCleanup(filePath)
    }
    const targetPath = path.resolve(this.basePath, filePath)
    fs.writeFileSync(targetPath, fileContent)
  }

  /**
   * Add path to a file that should be deleted after calling cleanup command
   */
  public registerForCleanup(filePath: string) {
    const targetPath = path.resolve(this.basePath, filePath)
    this.filesToCleanup.push(targetPath)
  }

  /**
   * Delete all files that were created by this helper or explicitly added to cleanup list
   */
  public cleanup() {
    this.filesToCleanup.forEach(filePath => {
      rimrafSync(filePath)
    })
  }
}
