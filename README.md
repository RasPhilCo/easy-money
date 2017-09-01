easy-money
---

A simple asynchronous caching to disk service

`EasyMoney.fetch` will perform one of the following:
 - on empty cache
  - return JSON from a caching function
  - asynchronously save JSON/cache
 - on present
  - valid cache:
    - return the cache
  - stale cache
    - return the stale cache
    - asynchronously call and save new JSON/cache from a caching function

```js
const cache = require('easy-money')

const cacheParams = {
  // cache lifespan in seconds
  cacheDuration: 3600,
  // a function that returns JSON to cache
  cacheFn : async function () {
    // call to api for users
    return https.get('/users')
  }
}

await cache.fetch('/path/to/cache', cacheParams)
```
