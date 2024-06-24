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

  let root

  try {
    root = document.getElementById('cwgi_box')
  } catch (e) {
    console.error('failed to get root element #cwgi_box, does it exist?')
    return false
  }

  dispose = render(() => <div id="cwgi_inner_box">
    <CommentSystem githubIssueId={githubIssueId} options={options}/>
  </div>, root)

  if (options.darkMode === undefined) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.setAttribute('data-mode', 'dark')
    }

    // check dark mode change
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (e.matches) {
        root.setAttribute('data-mode', 'dark')
      } else {
        root.removeAttribute('data-mode')
      }
    })
  }

  if (options.darkMode === true) {
    root.setAttribute('data-mode', 'dark')
  }

  if (options.darkMode === false) {
    root.removeAttribute('data-mode')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (import.meta.env.DEV === true) {
    init(82, {
      darkMode: false,
      owner: 'jw-12138',
      repo: 'jw-12138.github.io',
      clientId: 'Iv1.717c117523f74671',
      proxy: 'https://cwgi.jw1.dev',
      reactions: true
    })
  }
})

