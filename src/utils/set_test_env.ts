export function setTestEnv() {
  process.env.NODE_ENV = 'test'
  process.env.DB_HOST = 'localhost'
  process.env.DB_DATABASE = 'reclaim'
  process.env.DB_PASSWORD = ''
  process.env.REDIS_HOST = 'localhost'
  process.env.REDIS_PORT = '6379'
}
