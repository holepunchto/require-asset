const implementation = require('#implementation')

module.exports = function asset (specifier, parentURL, opts = {}) {
  return implementation(specifier, parentURL, opts)
}
