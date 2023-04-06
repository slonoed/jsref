import { exec } from 'child_process'
import path from 'path'
import { promisify } from 'util'
const execAsync2 = promisify(exec)

function execAsync(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error: ${error.message}`))
        return
      }
      if (stderr) {
        reject(new Error(`Stderr: ${stderr}`))
        return
      }
      resolve(stdout)
    })
  })
}

async function getPackageList(command: string): Promise<string[]> {
  const stdout = await execAsync(command)
  const parsedOutput = JSON.parse(stdout)
  const packageNames = Object.keys(parsedOutput.dependencies)

  return packageNames
}

export async function getInstalledPackages(): Promise<string[]> {
  const globalPackages = await getPackageList('npm list -g --json --depth=0 --no-unicode')
  const localPackages = await getPackageList('npm list --json --depth=0 --no-unicode')
  const mergedPackages = [...globalPackages, ...localPackages]
  return mergedPackages
}

export async function importGlobalPackage(packageName: string): Promise<any> {
  try {
    // Attempt to import the local package
    return await import(packageName)
  } catch (error) {
    if ((error as any).code === 'MODULE_NOT_FOUND') {
      // If the local package is not found, attempt to import the global package
      const { stdout: globalNodeModules } = await execAsync2('npm root -g')
      const globalPackagePath = path.join(globalNodeModules.trim(), packageName)

      return await import(globalPackagePath)
    } else {
      // Rethrow the error if it's not related to the module not being found
      throw error
    }
  }
}

export default importGlobalPackage
