import { wrap } from 'comlink'
import Worker from './test-runner.worker'

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
  let worker = new Worker()
  let TestRunner = wrap(worker)
  let testRunner = await new TestRunner()

  async function setup() {
    worker = new Worker()
    TestRunner = wrap(worker)
    testRunner = await new TestRunner()
  }

  async function run({ code, tests }) {
    try {
      const report = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate()
          reject(new TimeoutError('5 second timeout exceeded'))
        }, 5000)
        testRunner
          .test({ code, tests })
          .then(resolve, reject)
          .finally(() => clearTimeout(timeout))
      })
      return { error: null, report }
    } catch (error) {
      await setup()
      return { error, report: null }
    }
  }

  return { run }
}
