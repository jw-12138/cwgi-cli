import useStore from './Store.jsx'
import dayjs from 'dayjs'

const [store] = useStore()
const auth_api = 'https://github.com/login/oauth/authorize'

/**
 * GitHub api helper
 * @param {string} endpoint
 * @param {object} init
 * @returns {Promise<Response>}
 */
async function githubApi(endpoint, init = {}) {
  let headers = {
    Accept: 'application/vnd.github+json',
    ...init.headers
  }

  if ((localStorage.getItem('access_token') && store.isUserLoggedIn) || endpoint === 'https://api.github.com/user') {
    headers['Authorization'] = 'Bearer ' + localStorage.getItem('access_token')
  }

  let _init = {
    method: init.method || 'GET',
    headers
  }

  if (init.body) {
    _init.body = init.body
  }

  // disable workers cache
  let endpointUrl = new URL(endpoint)

  if (endpointUrl.search && endpointUrl.search.startsWith('?') && endpointUrl.search.length > 1) {
    // build url with t
    endpoint = endpoint + '&t=' + Date.now()
  } else {
    endpoint =
      endpoint +
      '?' +
      new URLSearchParams({
        t: Date.now()
      })
  }

  let proxy = store.apiBase ? store.proxy : ''

  return await fetch(proxy + endpoint, _init)
}

/**
 * render markdown to html
 * @param markdown
 * @param {?number} id
 * @param {?string} updated_at
 * @returns {Promise<string>}
 */
async function renderMarkdown(markdown, id = -1, updated_at = '') {
  let key = ''
  if (id && updated_at) {
    let timestamp = dayjs(updated_at).unix()
    key = `cache:markdown:comment:${id}:${timestamp}`

    let cached = sessionStorage.getItem(key)

    if (cached) {
      return cached
    }
  }

  try {
    let api = store.apiBase + '/markdown'
    let headers = {
      'Content-Type': 'plain/text'
    }
    let body = markdown
    let fetchFun = fetch

    if (!store.apiBase) {
      api = 'https://api.github.com/markdown'
      headers = {
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
      fetchFun = githubApi
      body = JSON.stringify({
        text: markdown
      })
    }

    let resp = await fetchFun(api, {
      method: 'POST',
      headers: headers,
      body: body
    })

    let remoteText = await resp.text()

    if (id && updated_at) {
      let timestamp = dayjs(updated_at).unix()
      let key = `cache:markdown:comment:${id}:${timestamp}`
      let oldCacheKeys = sessionStorage.getItem(`cache:markdown:comment:${id}`)

      oldCacheKeys = oldCacheKeys ? JSON.parse(oldCacheKeys) : []

      oldCacheKeys.map(async (key) => {
        sessionStorage.removeItem(key)
      })
      sessionStorage.setItem(key, remoteText)
    }
    return remoteText
  } catch (e) {
    console.log(e)
    return '<p>Failed to render markdown</p>'
  }
}

export { githubApi, renderMarkdown, auth_api }
