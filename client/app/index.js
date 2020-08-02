import split from 'split.js'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const splitOptions = {
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`,
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`,
  }),
}

split(['#instructions', '#code'], splitOptions)

split(['#editor', '#output'], {
  direction: 'vertical',
  ...splitOptions
})

monaco.editor.create(document.querySelector('#editor'), {
  theme: 'vs-dark',
  language: 'javascript'
})

const runner = new Worker('/tester.js')

runner.postMessage({ code: 'function log() { console.log("hi") }'})
