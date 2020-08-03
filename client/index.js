import split from 'split.js'
import runTests from './output-panel'
import instantiateEditor from './editor'

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
