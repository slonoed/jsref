import os from 'os'

export function expandTilde(filePath: string) {
  const homeDirectory = os.homedir()
  return filePath.replace(/^~($|\/|\\)/, `${homeDirectory}$1`)
}
