import * as express from 'express'
const bodyParser = require('body-parser')
const helmet = require('helmet')
import { runMigrations } from './utils/run_migrations'
import * as c from './controllers'
import * as m from './middleware'
import * as path from 'path'

export enum ApiPath {
  applicationHealth = '/',
  claim = '/claim',
}

export async function boot() {
  await runMigrations()
  const app = express()

  app.use(helmet())
  app.use(bodyParser.json())

  // Routes
  app.get(ApiPath.applicationHealth, (req, res) => res.json({api: 'alive'}))
  app.get(ApiPath.claim, c.getClaim)
  app.post(ApiPath.claim, c.postClaim)

  // Error Handler
  app.use(m.errorHandler)

  return app
}

boot().then((app) => {
  app.listen(3000, function () {
    console.log('API listening on port 3000')
  })
})
