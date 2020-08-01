import split from 'split.js'

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
