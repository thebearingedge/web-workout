import split from 'split.js'
import runTests from './output-panel'
import instantiateEditor from './editor'
import renderInstructions from './instructions'

split(['#instructions', '#code']).setSizes([2 / 5, 3 / 5].map(n => n * 100))

split(['#editor-container', '#output'], {
  direction: 'vertical',
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`
  })
}).setSizes([3 / 5, 2 / 5].map(n => n * 100))

const instructions = `
## trim-zeros

Define a function named \`trimZeros\` which takes a numeric \`string\` it with leading and trailing zeros removed.

#### Syntax

\`\`\`js
result = trimZeros(numericString)
\`\`\`

#### Parameters

- \`numericString\` - a \`string\` containing number characters

#### Return Value

The value of \`numeric\` string with leading and trailing zeros removed.

#### Examples

\`\`\`js
trimZeros("00032.2000")   // -> "32.2"
trimZeros("32.07210")     // -> "32.0721"
trimZeros("02100.001200") // -> "2100.0012"
\`\`\`
`

const source = `
function foo() {
  return "bar"
}

// ignore this plz

if (!foo) {
  throw new Error('wat')
}

function mirrorBits(a) {
  return parseInt([...a.toString(2)].reduce((bin, bit) => bit + bin), 2)
}

function tennisSet(score1, score2) {
  if (score1 === 6 && score2 < 5) return true
  if (score2 === 6 && score1 < 5) return true
  if (Math.min(5, score1, score2) !== 5) return false
  if (Math.max(7, score1, score2) !== 7) return false
  return score1 < 7 ? score2 === 7 : score2 < 7
}
`.trimLeft()

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
  const $instructions = document.querySelector('#instructions')
  const editor = await instantiateEditor($editor)
  renderInstructions($instructions, instructions)

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
