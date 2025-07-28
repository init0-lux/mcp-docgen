import simpleGit, { type SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';

export function getGit(cwd: string = process.cwd()): SimpleGit {
  if (!fs.existsSync(path.join(cwd, '.git'))) {
    throw new Error(`${cwd} is not a git repository`);
  }
  return simpleGit(cwd);
}
