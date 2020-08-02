import { expect } from 'chai'
import mocha, { Mocha } from 'mocha/mocha'

self.expect = expect

const {
  EVENT_RUN_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_RUN_END
} = Mocha.Runner.constants

mocha.setup({
  ui: 'bdd',
  reporter: function () {},
})

self.addEventListener('message', ({ data: { code } }) => {
  import(/* webpackIgnore: true */ code)
    .then(imported => {
      return new Promise((resolve, reject) => {
        const results = []
        try {
          mocha
            .run()
            .on(EVENT_TEST_PASS, test => results.push({
              event: EVENT_TEST_PASS,
              test: {
                title: test.title
              }
            }))
            .on(EVENT_TEST_FAIL, (test, err) => results.push({
              event: EVENT_TEST_FAIL,
              test: {
                title: test.title,
                error: err.message,
                actual: err.actual,
                expected: err.expected
              }
            }))
            .on(EVENT_RUN_END, () => resolve(results))
        } catch (err) {
          reject(err)
        }
      })

    })
    .then(results => self.postMessage({ success: true, data: { results } }))
    .catch(err => self.postMessage({ success: false, data: { error: { ...err } } }))
    .finally(() => self.close())
})
