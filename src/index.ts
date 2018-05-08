import { boot } from './app'

boot().then((app) => {
  app.listen(3000, function () {
    console.log('API listening on port 3000')
  })
})
