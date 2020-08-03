import prism from 'prismjs'
import unified from 'unified'
import markdown from 'remark-parse'
import render from 'remark-html'

export default function renderInstructions(container, text) {
  unified()
    .use(markdown)
    .use(render)
    .process(text, (err, html) => {
      if (err) return console.error(err)
      container.innerHTML = `
        <div class="markdown-body">${html}</div>
      `
      container.querySelectorAll('pre > code').forEach($code => {
        prism.highlightElement($code)
      })
    })
}
