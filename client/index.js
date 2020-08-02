import split from 'split.js'
import TestRunner from './test-runner.worker'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const splitOptions = {
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`,
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`,
  }),
}

split(['#instructions', '#code'], splitOptions).setSizes([2/5, 3/5].map(n => n * 100))

split(['#editor', '#output'], {
  direction: 'vertical',
  ...splitOptions
})

const editor = monaco.editor.create(document.querySelector('#editor'), {
  theme: 'vs-dark',
  language: 'javascript',
  tabSize: 2,
  value: 'function foo() {\n  return "bar"\n}',
  fontSize: 15,
  renderWhitespace: 'all',
  renderIndentGuides: true,
  formatOnPaste: true,
  minimap: {
    enabled: false
  }
})

const tests = `

it('returns "bar"', () => {
  const result = foo()
  expect(result).to.equal('bar')
})

it('returns "baz"', () => {
  const result = foo()
  expect(result).to.equal({ foo: 'bar' })
})

`

const runner = new TestRunner()

runner.addEventListener('message', ({ data }) => {
  console.log(data)
})

document.querySelector('#run-tests').addEventListener('click', () => {
  const source = editor.getValue().trimEnd()
  if (!source) return
  const encoded = encodeURIComponent(`${source}\n\n${tests}`)
  const code = `data:text/javascript;charset=utf-8,${encoded}`
  const functionName = 'foo'
  runner.postMessage({ code, functionName })
})
