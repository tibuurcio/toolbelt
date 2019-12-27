import { createReadStream, lstat, readFileSync, statSync } from 'fs-extra'
import * as glob from 'globby'
import { join } from 'path'
import { reject } from 'ramda'

export const pathToFileObject = (root: string, prefix: string = '') => {
  return (path: string): BatchStream => {
    const realAbsolutePath = join(root, path)
    const stats = statSync(realAbsolutePath)
    return {
      path: join(prefix, path),
      content: createReadStream(realAbsolutePath),
      byteSize: stats.size,
    }
  }
}

export class ProjectFilesManager {
  public static DEFAULT_IGNORED_FILES = [
    '.DS_Store',
    'README.md',
    '.gitignore',
    'package.json',
    'node_modules/**',
    '**/node_modules/**',
    '.git/**',
  ]

  private static isTestOrMockPath = (path: string) => {
    return /.*(test|mock|snapshot).*/.test(path.toLowerCase())
  }

  public root: string
  constructor(projectRoot: string) {
    this.root = projectRoot
  }

  private getIgnoredPaths(test: boolean = false): string[] {
    try {
      const filesToIgnore = readFileSync(join(this.root, '.vtexignore'))
        .toString()
        .split('\n')
        .map(path => path.trim())
        .filter(path => path !== '')
        .map(path => path.replace(/\/$/, '/**'))
        .concat(ProjectFilesManager.DEFAULT_IGNORED_FILES)
      return test ? reject(ProjectFilesManager.isTestOrMockPath, filesToIgnore) : filesToIgnore
    } catch (e) {
      return ProjectFilesManager.DEFAULT_IGNORED_FILES
    }
  }

  public async getLocalFiles(test: boolean = false): Promise<string[]> {
    const files: string[] = await glob(['manifest.json', 'policies.json', 'node/.*', 'react/.*'], {
      cwd: this.root,
      follow: true,
      ignore: this.getIgnoredPaths(test),
      nodir: true,
    })

    const filesStats = Promise.all(
      files.map(async file => {
        const stats = await lstat(join(this.root, file))
        return { file, stats }
      })
    )

    return filesStats.reduce((acc, { file, stats }) => {
      if (stats.size > 0) {
        acc.push(file)
      }
      return acc
    }, [])
  }
}
