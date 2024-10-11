module.exports = function asset (specifier, parentURL) {
  let msg = `Cannot find asset '${specifier}'`

  if (parentURL) msg += ` imported from '${parentURL}'`

  throw new Error(msg)
}
