import {createEffect, on, onMount} from 'solid-js'
import useStore from './components/Store.jsx'
import Loading from './components/Loading.jsx'
import LoginPanel from './components/LoginPanel.jsx'
import {githubApi} from './components/utils.jsx'
import InputAndPreview from './components/InputAndPreview.jsx'
import CommentList from './components/CommentList.jsx'
import './style/main.scss'

const [store, setStore] = useStore()
const version = '2024-08-27'

export default function Comments(props) {
  setStore('githubIssueId', props.githubIssueId)

  if (!props.options.owner) {
    console.error('owner is required to init comment system')
    return false
  }

  if (!props.options.repo) {
    console.error('repo is required to init comment system')
    return false
  }

  if (!props.options.clientId) {
    console.error('clientId is required to init comment system')
    return false
  }

  setStore('owner', props.options.owner)
  setStore('repo', props.options.repo)
  setStore('clientId', props.options.clientId)
  setStore('markdownRenderingEndpoint', props.options.markdownRenderingEndpoint || (store.apiBase + '/markdown'))

  if (Object.keys(props.options).includes('remoteMarkdownRendering') && props.options.remoteMarkdownRendering === false) {
    setStore('renderMarkdown', false)
  }

  if (props.options.proxy) {
    setStore('apiBase', props.options.proxy)
    setStore('proxy', props.options.proxy + '/proxy/')
  }

  if (props.options.reactions === false) {
    setStore('showReactions', false)
  }

  createEffect(on(() => store.githubIssueId, () => {
    setStore('comments', [])
  }))

  /**
   * check login status
   * @returns {Promise<boolean>}
   */
  async function checkLogin() {
    setStore('accessToken', localStorage.getItem('access_token'))

    if (!store.accessToken) {
      return false
    }

    let resp

    try {
      setStore('gettingUser', true)
      resp = await githubApi('https://api.github.com/user')
    } catch (e) {
      console.log(e)
    } finally {
      setStore('gettingUser', false)
    }

    if (!resp.ok) {
      return false
    }

    setStore('user', await resp.json())
    setStore('isUserLoggedIn', true)
  }

  onMount(async () => {
    let params = new URLSearchParams(document.location.search)
    let token = params.get('access_token')
    let type = params.get('token_type')
    if (token && type) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('token_type', type)
      localStorage.setItem('token_timestamp', new Date() + '')
      location.href = location.protocol + '//' + location.host + location.pathname + '#comments'

      return false
    }

    let pageHash = location.hash
    if (pageHash === '#comments') {
      document.getElementById('cwgi_comments').scrollIntoView({
        behavior: 'instant'
      })

      // replace url without hash
      history.replaceState(null, '', location.href.split('#')[0])
    }

    await checkLogin()
  })

  return <>
    {props.githubIssueId && <div data-name="comments" id="cwgi_comments" data-version={version} class="cwgi-mb-4 cwgi-max-w-[46rem] cwgi-mx-auto">
      <div class="cwgi-h-[1px]">
      </div>

      <Loading></Loading>
      <LoginPanel></LoginPanel>
      <InputAndPreview></InputAndPreview>

      {!store.gettingUser && <CommentList></CommentList>}

    </div>}
  </>
}
