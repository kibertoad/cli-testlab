import { sync as rimrafSync } from 'rimraf'
import path from 'path'
import fs from 'fs'

export class FileTestHelper {
  private basePath: string
  private createdFiles: string[] = []

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

  public createFile(filePath: string, fileContent: any) {
    const targetPath = path.resolve(this.basePath, filePath)
    this.createdFiles.push(targetPath)
    fs.writeFileSync(targetPath, fileContent)
  }

  public cleanup() {
    this.createdFiles.forEach(filePath => {
      rimrafSync(filePath)
    })
  }
}
