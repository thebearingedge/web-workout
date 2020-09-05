const createApi = require('./create-api')
const { connectToPostgres } = require('../database')

const { PORT } = process.env

;(async () => {
  const sql = await connectToPostgres()
  const api = createApi({ sql })
  await api.listen(PORT)
  // eslint-disable-next-line no-console
  console.log(`api listening on port ${PORT}`)
})().catch(err => {
  console.error(err)
  process.exit(1)
})
