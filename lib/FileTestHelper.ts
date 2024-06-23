import path from 'node:path'
import fs from 'node:fs'
import * as globule from 'globule'
import { sync as deleteSync } from 'rimraf'

export type FileTestHelperConfig = {
  basePath?: string
  maxRetries?: number
  retryDelay?: number
}

export class FileTestHelper {
  private readonly basePath: string
  private readonly filesToCleanup: string[] = []
  private readonly fileGlobsToCleanup: string[] = []
  private readonly maxRetries?: number
  private readonly retryDelay?: number

  public constructor(config: FileTestHelperConfig = {}) {
    this.basePath = config.basePath || './'
    this.maxRetries = config.maxRetries || 10
    this.retryDelay = config.retryDelay || 5
  }

  public fileExists(filePath: string): boolean {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.existsSync(targetPath)
  }

  public dirExists(dirPath: string): boolean {
    return this.fileExists(dirPath)
  }

  public fileGlobExists(fileGlobPath: string): number {
    return globule.find(fileGlobPath).length
  }

  public getFileTextContent(filePath: string): string {
    const targetPath = path.resolve(this.basePath, filePath)
    return fs.readFileSync(targetPath).toString()
  }

  public getFileGlobTextContent(fileGlobPath: string): string[] {
    return globule.find(fileGlobPath).map((resolvedPath) => {
      return fs.readFileSync(resolvedPath).toString()
    })
  }

  public deleteFile(
    filePath: string,
    {
      isPathAbsolute = false,
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay,
    }: {
      isPathAbsolute?: boolean
      maxRetries?: number
      retryDelay?: number
    } = {},
  ): void {
    const targetPath = isPathAbsolute ? filePath : path.resolve(this.basePath, filePath)

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true, recursive: true, maxRetries, retryDelay })
    }
  }

  public deleteDir(
    dirPath: string,
    {
      isPathAbsolute = false,
      maxRetries = this.maxRetries,
      retryDelay = this.retryDelay,
    }: {
      isPathAbsolute?: boolean
      maxRetries?: number
      retryDelay?: number
    } = {},
  ): void {
    const targetPath = isPathAbsolute ? dirPath : path.resolve(this.basePath, dirPath)

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true, recursive: true, maxRetries, retryDelay })
    }
  }

  public deleteFileGlob(fileGlobPath: string): void {
    deleteSync(fileGlobPath, { glob: true })
  }

  /**
   * Create file and (optionally) register it for later cleanup
   */
  public createFile(
    filePath: string,
    fileContent: any,
    {
      willBeCleanedUp = true,
      isPathAbsolute = false,
    }: {
      willBeCleanedUp?: boolean
      isPathAbsolute?: boolean
    } = {},
  ): void {
    if (willBeCleanedUp) {
      this.registerForCleanup(filePath, { isPathAbsolute })
    }
    const targetPath = isPathAbsolute ? filePath : path.resolve(this.basePath, filePath)
    mkDirByPathSync(path.dirname(targetPath))
    fs.writeFileSync(targetPath, fileContent)
  }

  /**
   * Create directory and (optionally) register it for later cleanup
   */
  public createDir(
    dirPath: string,
    {
      willBeCleanedUp = true,
      isPathAbsolute = false,
    }: {
      willBeCleanedUp?: boolean
      isPathAbsolute?: boolean
    } = {},
  ): void {
    if (willBeCleanedUp) {
      this.registerForCleanup(dirPath, { isPathAbsolute })
    }
    const targetPath = isPathAbsolute ? dirPath : path.resolve(this.basePath, dirPath)
    mkDirByPathSync(targetPath)
  }

  /**
   * Add path to a file that should be deleted after calling cleanup command
   */
  public registerForCleanup(
    filePath: string,
    {
      isPathAbsolute = false,
    }: {
      isPathAbsolute?: boolean
    } = {},
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
    this.filesToCleanup.forEach((filePath) => {
      this.deleteFile(filePath, {
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay,
      })
    })
    this.fileGlobsToCleanup.forEach((fileGlob) => {
      deleteSync(fileGlob, { glob: true })
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
    } catch (err: any) {
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
