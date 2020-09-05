const { pgLit } = require('pg-lit')
const promiseRetry = require('promise-retry')

const { DATABASE_URL } = process.env

module.exports = function connectToPostgres() {
  return promiseRetry(retry => {
    const sql = pgLit({ connectionString: DATABASE_URL })
    return sql`select 1`
      .then(() => sql)
      .catch(err => retry(err))
  }, { retries: 5 })
}
