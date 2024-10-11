module.exports = function asset (specifier, referrer) {
  return require.asset(specifier, parentURL)
}
