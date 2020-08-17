import { wrap } from 'comlink'
import Runner from './test-runner.worker'

class TimeoutError extends Error {
  constructor(...args) {
    super(...args)
    this.name = 'Timeout'
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export default async function instantiateTestRunner($report) {

  let worker = new Runner()
  let runTests = wrap(worker)

  async function run({ code, tests }) {
    try {
      const { error, report } = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate()
          reject(new TimeoutError('5 second timeout exceeded'))
        }, 5000)
        runTests({ code, tests })
          .then(resolve, reject)
          .finally(() => clearTimeout(timeout))
      })
      return { error, report }
    } catch (error) {
      if (error instanceof TimeoutError) {
        worker = new Runner()
        runTests = wrap(worker)
      }
      return { error, report: null }
    }
  }

  return { run }
}
