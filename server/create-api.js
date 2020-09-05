const fastify = require('fastify')

const { NODE_ENV } = process.env

module.exports = function createApi({ sql }) {
  const api = fastify({ logger: NODE_ENV === 'production' })
  api.decorate('services', { sql })
  api.register(require('./practice-problems'))
  return api
}
