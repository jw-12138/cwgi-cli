import {render} from 'solid-js/web'
import CommentSystem from './CommentSystem.jsx'

export function init(options) {
  render(() => <CommentSystem githubIssueId={options.githubIssueId || false}/>, document.getElementById(options.domId || 'cwgi_box'))
}

document.addEventListener('DOMContentLoaded', () => {
  if (import.meta.env.DEV === true) {
    init({
      githubIssueId: 82
    })

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.getElementsByTagName('html')[0].style.background = 'rgb(23, 23, 23)'
    }
  }
})

