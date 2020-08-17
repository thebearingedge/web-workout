import tape from 'tape'
import { expose } from 'comlink'

self.tape = tape

const setup = `
const report = []
self.test = self.tape.createHarness()
console.log('running')
self.test.createStream({ objectMode: true }).on('data', data => {
  report.push(data)
})
self.test.onFinish(() => self.dispatchEvent(new CustomEvent('finish', {
  detail: report
})))
`

class TestRunner {
  async test({ code, tests }) {
    try {
      const report = await new Promise((resolve, reject) => {
        const onFinish = ({ detail }) => resolve(detail)
        self.addEventListener('finish', onFinish, { once: true })
        const script = encodeURIComponent(`${setup}\n\n${code}\n\n${tests}`)
        const source = `data:text/javascript;charset=utf-8,${script}`
        import(/* webpackIgnore: true */ source).catch(reject)
      })
      return report
    } catch (err) {
      console.error(err)
    }
  }
}

expose(TestRunner)
