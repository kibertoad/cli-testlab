import * as del from 'del'
import { sync as rimrafSync } from 'rimraf'
import path from 'path'
import fs from 'fs'
import * as globule from 'globule'

export class FileTestHelper {
  private basePath: string
  private filesToCleanup: string[] = []
  private fileGlobsToCleanup: string[] = []

  public constructor(basePath: string = './') {
    this.basePath = basePath
  }

  public fileExists(filePath: string): boolean {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.existsSync(targetPath)
  }

  public fileGlobExists(fileGlobPath: string): number {
    return globule.find(fileGlobPath).length
  }

  public getFileTextContent(filePath: string): string {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.readFileSync(targetPath).toString()
  }

  public getFileGlobTextContent(fileGlobPath: string): string[] {
    return globule.find(fileGlobPath).map(resolvedPath => {
      return fs.readFileSync(resolvedPath).toString()
    })
  }

  public deleteFile(
    filePath: string,
    {
      isPathAbsolute = false
    }: {
      isPathAbsolute?: boolean
    } = {}
  ): void {
    const targetPath = isPathAbsolute ? filePath : path.resolve(this.basePath, filePath)

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath)
    }
  }

  public deleteFileGlob(fileGlobPath: string): void {
    del.sync(fileGlobPath)
  }

  /**
   * Create file and (optionally) register it for later cleanup
   */
  public createFile(
    filePath: string,
    fileContent: any,
    {
      willBeCleanedUp = true,
      isPathAbsolute = false
    }: {
      willBeCleanedUp?: boolean
      isPathAbsolute?: boolean
    } = {}
  ): void {
    if (willBeCleanedUp) {
      this.registerForCleanup(filePath, { isPathAbsolute })
    }
    const targetPath = isPathAbsolute ? filePath : path.resolve(this.basePath, filePath)
    mkDirByPathSync(path.dirname(targetPath))
    fs.writeFileSync(targetPath, fileContent)
  }

  /**
   * Add path to a file that should be deleted after calling cleanup command
   */
  public registerForCleanup(
    filePath: string,
    {
      isPathAbsolute = false
    }: {
      isPathAbsolute?: boolean
    } = {}
  ): void {
    const targetPath = isPathAbsolute ? filePath : path.resolve(this.basePath, filePath)
    this.filesToCleanup.push(targetPath)
  }

  /**
   * Add glob path to a file that should be deleted after calling cleanup command
   */
  public registerGlobForCleanup(fileGlobPath: string): void {
    this.fileGlobsToCleanup.push(fileGlobPath)
  }

  /**
   * Delete all files that were created by this helper or explicitly added to cleanup list
   */
  public cleanup(): void {
    this.filesToCleanup.forEach(filePath => {
      rimrafSync(filePath)
    })
    this.fileGlobsToCleanup.forEach(fileGlob => {
      del.sync(fileGlob)
    })
  }
}

function mkDirByPathSync(targetDir: string, { isRelativeToScript = false } = {}): string {
  const sep = path.sep
  const initDir = path.isAbsolute(targetDir) ? sep : ''
  const baseDir = isRelativeToScript ? __dirname : '.'

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir)
    try {
      fs.mkdirSync(curDir)
    } catch (err) {
      if (err.code === 'EEXIST') {
        // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') {
        // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
      if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}
