import TestRunner from './test-runner.worker'

export default async function runTests({ code }) {
  return new Promise((resolve, reject) => {
    const runner = new TestRunner()
    const timeout = setTimeout(() => {
      runner.terminate()
      reject(new Error('5 second timeout exceeded'))
    }, 5000)
    const onError = err => {
      clearTimeout(timeout)
      reject(err)
    }
    runner.addEventListener('error', onError)
    runner.addEventListener('messageerror', onError)
    runner.postMessage({ code })
    runner.addEventListener('message', ({ data: { success, data } }) => {
      resolve({ success, data })
    })
  })
}
