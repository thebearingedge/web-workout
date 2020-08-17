import tape from 'tape'
import { expose } from 'comlink'

self.tape = tape

const setup = `
;(() => {
  const report = []
  self.test = self.tape.createHarness()
  self.test.createStream({ objectMode: true }).on('data', data => {
    report.push(data)
  })
  self.test.onFinish(() => self.dispatchEvent(new CustomEvent('finish', {
    detail: report
  })))
})();
`

const runCount = ((count = 1) => () => {
  count = count === Number.MAX_SAFE_INTEGER ? 1 : count + 1
  return count
})()

async function run({ code, tests }) {
  const script = encodeURIComponent(`${code}\n\n${setup}(${runCount()});\n\n${tests}`)
  const source = `data:text/javascript;charset=utf-8,${script}`
  try {
    const report = await new Promise((resolve, reject) => {
      const onFinish = ({ detail }) => resolve(detail)
      self.addEventListener('finish', onFinish, { once: true })
      import(/* webpackIgnore: true */ source).catch(reject)
    })
    return { error: null, report }
  } catch (err) {
    return {
      error: {
        name: err.name,
        message: err.message,
        line: (err.stack.match(/\d+:\d+$/) || [])[0]
      },
      report: null
    }
  }
}

expose(run)
