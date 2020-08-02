const path = require('path')
const express = require('express')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.listen(process.env.PORT, () => {
  console.log('server listening on port', process.env.PORT)
})
