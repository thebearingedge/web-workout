import { expect } from 'chai'
import mocha from 'mocha/mocha'
import WorkerReporter from './reporter'

mocha.setup({
  ui: 'bdd',
  reporter: WorkerReporter
})

it('is good', () => {
  expect(typeof log).to.equal('function', `
    log function not defined!
  `)
})

self.addEventListener('message', ({ data }) => {
  eval('self.log = ' + data.code)
  mocha.run()
})
