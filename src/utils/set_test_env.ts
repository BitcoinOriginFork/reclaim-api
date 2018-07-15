export function setTestEnv() {
  process.env.NODE_ENV = 'test'
  process.env.DB_HOST = '127.0.0.1'
  process.env.DB_DATABASE = 'origin'
  process.env.DB_PASSWORD = 'postgres'
  process.env.REDIS_HOST = '127.0.0.1'
  process.env.REDIS_PORT = '6379'
}
