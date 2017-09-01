// @flow

import fs from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

import Cache from './index'

let cacheDir
let cachePath
beforeAll(() => {
  var tmpobj = tmp.dirSync()
  cacheDir = tmpobj.name
  cachePath = path.join(cacheDir, 'users')
})

afterAll(() => {
  fs.removeSync(cacheDir)
})

const USERS = [
  {id: 1, name: 'foo old'},
  {id: 2, name: 'bar old'}
]

const UPDATED_USERS = [
  {id: 1, name: 'baz new'},
  {id: 2, name: 'qux new'}
]

async function getUsers () {
  return USERS
}

async function getUpdatedUsers () {
  return UPDATED_USERS
}

async function emptyCache () {
  return []
}

// courtesy @jdxcode
function wait (ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('Cache.fetch()', () => {
  describe('on empty cache', () => {
    let users

    beforeAll(async () => {
      users = await Cache.fetch(cachePath, {cacheDuration: 3600, cacheFn: getUsers})
    })

    test('it returns from cache function', () => {
      expect(users).toEqual(USERS)
    })

    test('it updates the cache', async () => {
      expect.assertions(1)
      // let cache finish writing
      await wait(1000).then(() => {
        expect(fs.readJSONSync(cachePath)).toEqual(USERS)
      })
    })
  })

  describe('on preset', () => {
    beforeAll(async () => {
      // populate cache
      await fs.writeJSON(cachePath, USERS)
    })

    describe('valid cache', () => {
      let users

      beforeAll(async () => {
        users = await Cache.fetch(cachePath, {cacheDuration: 3600, cacheFn: emptyCache})
      })

      test('it returns the cache', async () => {
        expect(users).toEqual(USERS)
      })

      test('it does not update the cache', async () => {
        expect.assertions(1)
        expect(fs.readJSONSync(cachePath)).toEqual(USERS)
      })
    })

    describe('stale cache', () => {
      let users

      beforeAll(async () => {
        await fs.writeJSON(cachePath, USERS)
        // allow cache to stale
        await wait(1000).then(async () => {
          users = await Cache.fetch(cachePath, {cacheDuration: 1, cacheFn: getUpdatedUsers})
        })
      })

      test('it returns the stale cache', async () => {
        expect(users).toEqual(USERS)
      })

      test('it updates the cache', async () => {
        expect.assertions(1)
        // let cache finish writing
        await wait(1000).then(() => {
          expect(fs.readJSONSync(cachePath)).toEqual(UPDATED_USERS)
        })
      })
    })
  })
})
