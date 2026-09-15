const test = require('brittle')
const { pathToFileURL } = require('url')
const fs = require('fs')
const path = require('path')
const Bundle = require('bare-bundle')
const evaluate = require('bare-bundle-evaluate')
const requireAsset = require('require-asset')

test('basic', (t) => {
  t.is(
    requireAsset('./asset.txt', pathToFileURL('./test/fixtures/')),
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

test('directory', (t) => {
  t.is(requireAsset('./fixtures', pathToFileURL('./test/')), path.join(__dirname, 'test/fixtures'))
})

test('directory with trailing separator', (t) => {
  t.is(requireAsset('./fixtures/', pathToFileURL('./test/')), path.join(__dirname, 'test/fixtures'))
})

test('directory of the referrer', (t) => {
  t.is(
    requireAsset('./', pathToFileURL('./test/fixtures/asset.txt')),
    path.join(__dirname, 'test/fixtures')
  )
})

test('directory of the referrer without trailing separator', (t) => {
  t.is(
    requireAsset('.', pathToFileURL('./test/fixtures/asset.txt')),
    path.join(__dirname, 'test/fixtures')
  )
})

test('directory that does not exist', (t) => {
  t.exception(() => requireAsset('./nope/', pathToFileURL('./test/fixtures/')))
})

test('nested directory', (t) => {
  t.is(
    requireAsset('./directory', pathToFileURL('./test/fixtures/')),
    path.join(__dirname, 'test/fixtures/directory')
  )
})

test('file in a nested directory', (t) => {
  t.is(
    requireAsset('./directory/nested.txt', pathToFileURL('./test/fixtures/')),
    path.join(__dirname, 'test/fixtures/directory/nested.txt')
  )
})

test('file with trailing separator', (t) => {
  t.exception(() => requireAsset('./asset.txt/', pathToFileURL('./test/fixtures/')))
})

test('parent directory', (t) => {
  t.is(
    requireAsset('..', pathToFileURL('./test/fixtures/directory/')),
    path.join(__dirname, 'test/fixtures')
  )
})

test('referrer as a path', (t) => {
  t.is(
    requireAsset('./asset.txt', path.join(__dirname, 'test/fixtures/index.js')),
    path.join(__dirname, 'test/fixtures/asset.txt')
  )
})

test('asset that does not exist', (t) => {
  try {
    requireAsset('./nope.txt', pathToFileURL('./test/fixtures/'))

    t.fail('should have thrown')
  } catch (err) {
    t.is(err.code, 'ASSET_NOT_FOUND')
    t.is(err.specifier, './nope.txt')
    t.ok(err.referrer)
    t.ok(Array.isArray(err.candidates))
  }
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
    bundle.write(path.join(base, key), fs.readFileSync(path.join(__dirname, key)))
  }
}

function withRequireAsset(bundle) {
  write(
    bundle,
    ['package.json', 'lib/bare.js', 'lib/default.js', 'lib/node.js'],
    '/node_modules/require-asset'
  )
}

test('bundle with a directory', (t) => {
  const bundle = new Bundle()

  withRequireAsset(bundle)

  bundle.write('/index.js', "module.exports = require('require-asset')('./', __filename)", {
    main: true,
    imports: {
      './': {
        asset: '/fixtures/'
      }
    }
  })

  t.is(
    evaluate(bundle.mount(pathToFileURL('./test/'))).exports,
    path.join(__dirname, 'test/fixtures') + path.sep
  )
})
