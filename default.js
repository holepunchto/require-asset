module.exports = function asset (specifier, referrer) {
  let msg = `Cannot find asset '${specifier}'`

  if (referrer) msg += ` imported from '${referrer}'`

  throw new Error(msg)
}
