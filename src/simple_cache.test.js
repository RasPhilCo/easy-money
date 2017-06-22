// @flow

import fs from 'fs-extra'
import path from 'path'
import tmp from 'tmp'

import Cache from './index'

let cacheDir
let cache
beforeAll(() => {
  var tmpobj = tmp.dirSync()
  cacheDir = tmpobj.name
  cache = path.join(cacheDir, 'users')
})

afterAll(() => {
  fs.removeSync(cacheDir)
})

const USERS = [
  {id: 1, name: 'foo'},
  {id: 2, name: 'bar'}
]

const UPDATED_USERS = [
  {id: 1, name: 'baz'},
  {id: 2, name: 'qux'}
]

async function getUsers () {
  return USERS
}

async function getUpdatedUsers () {
  return UPDATED_USERS
}

// courtesy @dickeyxxx
function wait (ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

describe('Cache.fetch()', () => {
  describe('on empty cache', () => {
    let users

    beforeAll(async () => {
      users = await Cache.fetch(cache, 3600, getUsers)
    })

    test('it returns from cache function', () => {
      expect(users).toEqual(USERS)
    })

    test('it updates the cache', async () => {
      expect.assertions(1)
      // let cache finish writing
      await wait(1000).then(() => {
        expect(fs.readJSONSync(cache)).toEqual(USERS)
      })
    })
  })

  test('it returns on valid cache', async () => {
    let users = await Cache.fetch(cache, 3600, function () {})
    expect(users).toEqual(USERS)
  })

  describe('on stale cache', () => {
    let users

    beforeAll(async () => {
      users = await Cache.fetch(cache, 1, getUpdatedUsers)
    })

    test('it returns from cache', () => {
      expect(users).toEqual(USERS)
    })

    test('it updates the cache', async () => {
      expect.assertions(1)
      // let cache finish writing
      await wait(1000).then(() => {
        expect(fs.readJSONSync(cache)).toEqual(UPDATED_USERS)
      })
    })
  })
})
