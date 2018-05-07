export function redisCreds (): {host: string, port: number} {
  const host = process.env.REDIS_HOST
  const port = process.env.REDIS_PORT

  if (!host || !port) {
    throw new Error('Missing Redis credentials')
  }

  return {host, port: Number(port)}
}
