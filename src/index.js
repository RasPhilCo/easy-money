// @flow

import fs from 'fs-extra'
import moment from 'moment'

type CacheOptions = {
  cacheDuration: number,
  cacheFn: () => Promise<Array<any>>
}

/**
 * Utility for caching to disk
 * @class
 */
export default class SimpleCache {
  /**
   * gets or makes values for a cache
   * @param {string} cachePath - cache path
   * @param {Object} options - cache builder/invalidator
   * @param {number} options.cacheDuration - cache validity in seconds
   * @param {cacheFunction} options.cacheFn - returns Promise<Array<any> to cache
   * @example
   * ```js
   * const cache = require('easy-money')
   * await cache.fetch('/path/to/cache', {cacheDuration: 3600, cacheFn: cacheFn})
   * ```
   */
  static async fetch (cachePath: string, cacheOptions: CacheOptions): Promise<Array<any>> {
    let {cacheDuration, cacheFn} = cacheOptions
    let cachePresent = await fs.exists(cachePath)
    if (cachePresent) {
      const cache = await fs.readJSON(cachePath)
      // // TODO: aysnc fork
      await this._fork('checkStale', {cachePath, cacheDuration, cacheFn})
      // // end async
      return cache
    } else {
      const updatedCache = await cacheFn()
      // TODO: aysnc fork
      await this._fork('update', {cachePath, cache: updatedCache})
      // end async
      return updatedCache
    }
  }

  static async _fork (action: string, cacheOptions: any) {
    let {cachePath, cacheDuration, cacheFn, cache} = cacheOptions
    if (action === 'update') {
      await this._updateCache(cachePath, cache)
    } else {
      if (this._isStale(cachePath, cacheDuration)) {
        const updatedCache = await cacheFn()
        await this._updateCache(cachePath, updatedCache)
      }
    }
  }

  static async _updateCache (cachePath: string, cache: any) {
    await fs.ensureFile(cachePath)
    await fs.writeJSON(cachePath, cache)
  }

  static _isStale (cachePath: string, cacheDuration: number): boolean {
    return this._mtime(cachePath).isBefore(moment().subtract(cacheDuration, 'seconds'))
  }

  static _mtime (f) {
    return moment(fs.statSync(f).mtime)
  }
}
