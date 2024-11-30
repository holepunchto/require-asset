const test = require('brittle')
const { pathToFileURL } = require('url')
const fs = require('fs')
const path = require('path')
const Bundle = require('bare-bundle')
const evaluate = require('bare-bundle-evaluate')
const requireAsset = require('.')

test('basic', (t) => {
  t.is(
    requireAsset('./asset.txt', pathToFileURL('./test/fixtures/')),
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

test('bundle', (t) => {
  const bundle = new Bundle()

  withRequireAsset(bundle)

  bundle.write(
    '/index.js',
    "module.exports = require('require-asset')('./asset.txt', __filename)",
    {
      main: true
    }
  )

  t.is(
    evaluate(bundle.mount(pathToFileURL('./test/fixtures/'))).exports,
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

test('bundle with bound require.asset', (t) => {
  const bundle = new Bundle()

  withRequireAsset(bundle)

  bundle.write(
    '/index.js',
    "require.asset = require('require-asset'); module.exports = require.asset('./asset.txt', __filename)",
    {
      main: true
    }
  )

  t.is(
    evaluate(bundle.mount(pathToFileURL('./test/fixtures/'))).exports,
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

test('bundle with preresolutions', (t) => {
  const bundle = new Bundle()

  withRequireAsset(bundle)

  bundle.write(
    '/index.js',
    "module.exports = require('require-asset')('./asset.txt', __filename)",
    {
      main: true,
      imports: {
        './asset.txt': {
          asset: '/fixtures/asset.txt'
        }
      }
    }
  )

  t.is(
    evaluate(bundle.mount(pathToFileURL('./test/'))).exports,
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

function write(bundle, keys, base = '/') {
  for (const key of keys) {
    bundle.write(
      path.join(base, key),
      fs.readFileSync(path.join(__dirname, key))
    )
  }
}

function withRequireAsset(bundle) {
  write(
    bundle,
    [
      'package.json',
      'index.js',
      'lib/runtime.js',
      'lib/runtime/bare.js',
      'lib/runtime/default.js',
      'lib/runtime/node.js'
    ],
    '/node_modules/require-asset'
  )
}
