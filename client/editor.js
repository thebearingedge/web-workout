import { loadWASM } from 'onigasm'
import { Registry } from 'monaco-textmate'
import { wireTmGrammars } from 'monaco-editor-textmate'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import monokai from './monokai'

monaco.editor.defineTheme('monokai', monokai)

export default async function instantiateEditor(container) {

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
    fontSize: 14,
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
