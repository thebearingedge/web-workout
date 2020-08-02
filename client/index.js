import split from 'split.js'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import TestRunner from './test-runner.worker'
import { wireTmGrammars } from 'monaco-editor-textmate'
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


;(async () => {

  const wasm = await fetch('onigasm/onigasm.wasm').then(res => res.arrayBuffer())
  await loadWASM(wasm)
  const registry = new Registry({
    getGrammarDefinition: async (scope) => {
      return {
        format: 'json',
        content: await fetch(`grammars/${scope}.json`).then(res => res.text())
      }
    }
  })
  const monokai = await fetch('themes/monokai.json').then(res => res.json())
  monaco.editor.defineTheme('monokai', monokai)
  const grammars = new Map([
    ['javascript', 'js']
  ])


  const editor = monaco.editor.create(document.querySelector('#editor'), {
    theme: 'monokai',
    language: 'javascript',
    tabSize: 2,
    value: `
function foo() {
  return "bar"
}`.trim(),
    fontSize: 15,
    renderWhitespace: 'all',
    renderIndentGuides: true,
    formatOnPaste: true,
    minimap: {
      enabled: false
    }
  })

  await wireTmGrammars(monaco, registry, grammars, editor)

  document.querySelector('#run-tests').addEventListener('click', () => {
    const source = editor.getValue().trimEnd()
    if (!source) return
    const encoded = encodeURIComponent(`${source}\n\n${tests}`)
    const code = `data:text/javascript;charset=utf-8,${encoded}`
    const functionName = 'foo'
    runner.postMessage({ code, functionName })
  })

})()
