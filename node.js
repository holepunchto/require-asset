const url = require('url')
const resolve = require('bare-module-resolve')

const conditions = ['asset', 'node', process.platform, process.arch]

module.exports = function asset (specifier, parentURL) {
  if (typeof parentURL === 'string') parentURL = url.pathToFileURL(parentURL)

  for (const resolution of resolve(specifier, parentURL, { conditions }, readPackage)) {
    switch (resolution.protocol) {
      case 'file:':
        try {
          return require.resolve(url.fileURLToPath(resolution))
        } catch {
          continue
        }
    }
  }

  let msg = `Cannot find asset '${specifier}'`

  if (parentURL) msg += ` imported from '${parentURL.href}'`

  throw new Error(msg)

  function readPackage (packageURL) {
    try {
      return require(url.fileURLToPath(packageURL))
    } catch (err) {
      return null
    }
  }
}
