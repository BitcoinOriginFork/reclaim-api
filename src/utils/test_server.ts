import { boot } from '../app'

export async function openServer() {
  const app = await boot()
  return app.listen(3000)
}

export function closeServer(server: any) {
  return new Promise(res => {
    server.close(() => res())
  })
}
