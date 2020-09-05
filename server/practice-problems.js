module.exports = function practiceProblems(api, _, done) {
  const { sql } = api.services
  api.get('/practice-problems', async (req, res) => {
    const [gotEm] = await sql`select 1 as "one"`
    res.send(gotEm)
  })
  done()
}
