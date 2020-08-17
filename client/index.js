import split from 'split.js'
import instantiateEditor from './editor'
import renderInstructions from './instructions'
import instantiateTestRunner from './output-panel'

split(['#instructions', '#code']).setSizes([2 / 5, 3 / 5].map(n => n * 100))

split(['#editor-container', '#output'], {
  direction: 'vertical',
  elementStyle: (dimension, size, gutterSize) => ({
    'flex-basis': `calc(${size}% - ${gutterSize}px)`
  }),
  gutterStyle: (dimension, gutterSize) => ({
    'flex-basis': `${gutterSize}px`
  })
})

const instructions = `
## trim-zeros

Define a function named \`trimZeros\` which takes a numeric \`string\` and returns it with leading and trailing zeros removed.

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
test("true is indeed true", t => {
  t.equal(true, true)
  t.end()
})

test("or is it?", t => {
  t.equal(true, false)
  t.end()
})
`

;(async () => {

  const $instructions = document.querySelector('#instructions')
  renderInstructions($instructions, instructions)

  const $editor = document.querySelector('#editor')
  const editor = await instantiateEditor($editor)

  editor.setValue(source)
  $editor.style.visibility = ''

  const $report = document.querySelector('#report')
  const runner = await instantiateTestRunner($report)

  const $runTests = document.querySelector('#run-tests')

  $runTests.addEventListener('click', async () => {
    try {
      const code = editor.getValue().trimRight()
      if (!code) return
      $runTests.firstElementChild.classList.remove('fas', 'fa-play')
      $runTests.firstElementChild.classList.add('fa', 'fa-hourglass-half')
      $runTests.disabled = true
      const [result] = await Promise.all([
        runner.run({ code, tests }),
        delay(2000)
      ])
      console.log(result)
    } catch (err) {
      console.error(err)
    } finally {
      $runTests.disabled = false
      $runTests.firstElementChild.classList.add('fas', 'fa-play')
      $runTests.firstElementChild.classList.remove('fa', 'fa-hourglass-half')
    }
  })
})()

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time))
}
