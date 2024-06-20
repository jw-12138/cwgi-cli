import {render} from 'solid-js/web'
import CommentSystem from './CommentSystem.jsx'

let dispose = null

export function init(options) {
  if (dispose) {
    dispose()
  }

  const root = document.getElementById('cwgi_box')

  dispose = render(() => <CommentSystem githubIssueId={options.githubIssueId || false}/>, root)

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
    init({
      githubIssueId: 82,
      darkMode: false
    })
  }
})

