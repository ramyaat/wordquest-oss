// Vercel KV abstraction — falls back to an in-memory store for local dev
// without KV env vars set.
import { kv as vercelKV } from '@vercel/kv'

// Use globals so the store survives hot-reloads between API route calls in dev
if (!global.__memKV)  global.__memKV  = {}
if (!global.__memTTL) global.__memTTL = {}
const _mem = global.__memKV
const _ttl = global.__memTTL

const isConfigured = () => !!process.env.KV_REST_API_URL

const memKV = {
  async get(k) {
    if (_ttl[k] && Date.now() > _ttl[k]) { delete _mem[k]; delete _ttl[k]; return null }
    return _mem[k] ?? null
  },
  async set(k, v, opts) {
    _mem[k] = v
    if (opts?.ex) _ttl[k] = Date.now() + opts.ex * 1000
    return 'OK'
  },
  async del(k)          { delete _mem[k]; delete _ttl[k]; return 1 },
  async sadd(k,...v)    { if(!_mem[k]) _mem[k]=new Set(); v.forEach(x=>_mem[k].add(x)); return v.length },
  async smembers(k)     { return _mem[k] ? [..._mem[k]] : [] },
  async zadd(k,opts)    { if(!_mem[k]) _mem[k]={}; _mem[k][opts.member]=opts.score; return 1 },
  async zrange(k,a,b,o) {
    if(!_mem[k]) return []
    const entries = Object.entries(_mem[k]).sort((x,y)=> o?.rev ? y[1]-x[1] : x[1]-y[1])
    const sl = b===-1 ? entries : entries.slice(a,b+1)
    if(o?.withScores) return sl.flatMap(([m,s])=>[m,s])
    return sl.map(([m])=>m)
  },
}

export const db = isConfigured() ? vercelKV : memKV
