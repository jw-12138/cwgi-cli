import {render} from 'solid-js/web'
import CommentSystem from './CommentSystem.jsx'

let dispose = null

/**
 * init comment system
 * @param {number | boolean} githubIssueId
 * @param options
 */
export function init(githubIssueId = false, options = {}) {
  if (dispose) {
    dispose()
  }

  const root = document.getElementById('cwgi_box')

  dispose = render(() => <CommentSystem githubIssueId={githubIssueId} options={options}/>, root)

  if (options.darkMode === undefined) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    }

    // check dark mode change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (e.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    })
  }

  if (options.darkMode === true) {
    root.classList.add('dark')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (import.meta.env.DEV === true) {
    init(82, {
      darkMode: false,
      owner: 'jw-12138',
      repo: 'jw-12138.github.io',
      clientId: 'Iv1.717c117523f74671',
      proxy: 'https://cwgi.jw1.dev'
    })
  }
})

