import { expect } from 'chai'
import mocha, { Mocha } from 'mocha/mocha'


const {
  EVENT_RUN_BEGIN,
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_RUN_END
} = Mocha.Runner.constants

let subject

mocha.setup({
  ui: 'bdd',
  reporter: function () {},
  cleanReferencesAfterRun: false
})

before(() => {
  expect(typeof self[subject]).to.equal('function', `
    the function ${subject} was not defined in your editor
  `.trim())
})

it('returns "bar"', () => {
  const result = foo()
  expect(result).to.equal('bar')
})

it('returns "baz"', () => {
  const result = foo()
  expect(result).to.equal({ foo: 'bar' })
})

self.addEventListener('message', ({ data }) => {
  const { code, functionName } = data
  subject = functionName
  import(/* webpackIgnore: true */ code)
    .then(module => {
      self[subject] = module[subject]
      const runner = mocha.run()
      runner
        .on(EVENT_RUN_BEGIN, handleRunBegin)
        .on(EVENT_TEST_PASS, handleTestPass)
        .on(EVENT_TEST_FAIL, handleTestFail)
        .on(EVENT_RUN_END, handleRunEnd)
    })
    .catch(err => console.error(err))
})

function handleRunBegin() {
  self.postMessage({ event: EVENT_RUN_BEGIN })
}

function handleTestPass(test) {
  self.postMessage({
    event: EVENT_TEST_PASS,
    test: {
      title: test.title
    }
  })
}

function handleTestFail(test, err) {
  self.postMessage({
    event: EVENT_TEST_FAIL,
    test: {
      title: test.title,
      error: err.message,
      actual: err.actual,
      expected: err.expected
    }
  })
}

function handleRunEnd() {
  self.postMessage({ event: EVENT_RUN_END })
}
