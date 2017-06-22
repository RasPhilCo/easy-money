easy-money
---

A simple caching service

`EasyMoney.fetch` will perform one of the following:
 - on valid cache: return the cache
 - on empty cache: return the JSON value of a function and then asynchronously cache that JSON
 - on stale cache: return the stale cache and asynchronously update the cache with new JSON from a function

```js
const cache = require('easy-money')

function cacheFn () {
  // call to api for users
  return get('/users')
}

// specify a path to cache, a cache lifespan in seconds
// and a function that returns JSON to cache
await cache.fetch('/path/to/cache', 3600, cacheFn)
```
