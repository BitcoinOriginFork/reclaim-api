export function setTestEnv() {
  process.env.NODE_ENV = 'test'
  process.env.DB_HOST = '127.0.0.1'
  process.env.DB_PORT = '5432'
  process.env.DB_DATABASE = 'origin'
  process.env.DB_PASSWORD = 'postgres'
  process.env.REDIS_HOST = '127.0.0.1'
  process.env.REDIS_PORT = '6379'
  process.env.CONTRACT_ADDRESS = '0x9538AF54A12e3bD8079148E659007b9E99Cb72A9'
}
