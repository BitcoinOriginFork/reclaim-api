import * as express from 'express'
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
import { runMigrations } from './utils/run_migrations'
import * as c from './controllers'
import * as m from './middleware'
import * as path from 'path'
import { redisCreds } from './config/redis'
const RateLimit = require('express-rate-limit')
const RedisStore = require('rate-limit-redis')
const redis = require('redis')

export enum ApiPath {
  applicationHealth = '/',
  claim = '/claim',
}

export async function boot() {
  try {
    await runMigrations()
    const app = express()

    // Enable CORS
    app.use(cors())

    // Sensible security defaults
    app.use(helmet())

    // Parse request bodies to JSON
    app.use(bodyParser.json())

    // Rate Limiting
    app.enable('trust proxy')

    const redisConnection = redisCreds()

    const limiter = new RateLimit({
      store: new RedisStore({
        client: redis.createClient(redisConnection)
      }),
      windowMs: 50 * 1000, // 1 minute
      max: 30, // limit each IP to 50 requests per minute
      delayMs: 0 // disable delaying - full speed until the max limit is reached
    })

    app.use(limiter)

    // Routes
    app.get(ApiPath.applicationHealth, (req, res) => res.json({api: 'alive'}))
    app.get(ApiPath.claim, c.getClaim)
    app.post(ApiPath.claim, c.postClaim)

    // Error Handler
    app.use(m.errorHandler)

    return app
  } catch (e) {
    throw e
  }
}

boot().then((app) => {
  app.listen(3000, function () {
    console.log('API listening on port 3000')
  })
})
