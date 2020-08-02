import split from 'split.js'
import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import monokai from './monokai'
import TestRunner from './test-runner.worker'

split(['#instructions', '#code']).setSizes([2 / 5, 3 / 5].map(n => n * 100))

split(['#editor-container', '#output'], {
  direction: 'vertical',
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`,
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`,
  }),
}).setSizes([3 / 5, 2 / 5].map(n => n * 100))

monaco.editor.defineTheme('monokai', monokai)

const source = `
function foo() {
  return "bar"
}

// ignore this plz

if (!foo) {
  throw new Error('wat')
}
`.trim()

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

;(async () => {

  const $editor = document.querySelector('#editor')
  const editor = await instantiateEditor($editor)

  new ResizeObserver(entries => {
    for (const _ of entries) editor.layout()
  }).observe($editor.parentElement)

  editor.setValue(source)
  $editor.style.visibility = ''

  let running = false

  document.querySelector('#run-tests').addEventListener('click', async () => {
    if (running) return
    const source = editor.getValue().trimEnd()
    if (!source) return
    const encoded = encodeURIComponent(`${source}\n\n${tests}`)
    const code = `data:text/javascript;charset=utf-8,${encoded}`
    running = true
    try {
      const { success, data } = await runTests({ code })
      console.log('success', success)
      console.log('data', data)
    } catch (err) {
      console.error(err)
    } finally {
      running = false
    }
  })
})()

async function runTests({ code }) {
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

async function instantiateEditor(container) {

  await loadWASM('/onigasm.wasm')

  const registry = new Registry({
    getGrammarDefinition: async scope => {
      const format = 'json'
      const grammarUrl = `/grammars/${scope}.json`
      const content = await fetch(grammarUrl).then(res => res.text())
      return { format, content }
    }
  })
  const grammars = new Map([
    ['html', 'text.html.basic'],
    ['css', 'source.css'],
    ['javascript', 'source.js']
  ])
  const editor = monaco.editor.create(container, {
    theme: 'monokai',
    language: 'javascript',
    wordWrap: 'off',
    tabSize: 2,
    fontSize: 15,
    fontFamily: 'Hack, Menlo, Monaco, "Courier New", monospace',
    renderWhitespace: 'all',
    renderIndentGuides: true,
    formatOnPaste: true,
    minimap: {
      enabled: false
    }
  })

  await monaco.languages.typescript.getJavaScriptWorker()
  await wireTmGrammars(monaco, registry, grammars, editor)

  return editor
}
