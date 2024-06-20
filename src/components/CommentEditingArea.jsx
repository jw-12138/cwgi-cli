import {Show} from 'solid-js'
import useStore from './Store.jsx'
import {githubApi, owner, repo} from './utils.jsx'
import {produce} from 'solid-js/store'

const [store, setStore] = useStore()

function commentEditingArea(props) {
  const {comment} = props

  /**
 * confirm and submit edited comment
 * @returns {Promise<void>}
 */
async function confirmEditing() {
  let id = store.editingCommentId
  let content = store.editingCommentContent

  if (!id) {
    // reset
    setStore('editingCommentId', '')
    setStore('editingCommentContent', '')
    return
  }

  if (!content) {
    alert('the content cannot be empty')
    return
  }

  if (store.submittingEditedComment) {
    return
  }

  let endpoint = `https://api.github.com/repos/${owner}/${repo}/issues/comments/${id}`

  let resp

  try {
    setStore('submittingEditedComment', true)
    resp = await githubApi(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({
        body: content
      })
    })
  } catch (e) {
    console.log(e)
    alert('failed, please try again later')
  } finally {
    setStore('submittingEditedComment', false)
  }

  if (!resp.ok) {
    alert('failed, please try again later')
    return
  }

  if (resp.status === 200) {
    let updatedComment = await resp.json()

    setStore('comments', store.comments.map(item => {
      if (item.id === id) {
        item = updatedComment
      }
      return item
    }))

    setStore('editingCommentId', '')
    setStore('shouldUpdateCommentId', id)
  }
}

  return <>
    <Show when={store.editingCommentId === comment.id}>
      <div class="mt-2" data-name="edit area">
        <form
          action="javascript:"
          onsubmit={confirmEditing}>
          <div>
        <textarea
          class="rounded-2xl block px-4 py-4 font-mono border-none focus:shadow-2xl dark:bg-neutral-800 bg-zinc-100 w-full resize-y min-h-[6rem] text-sm rounded-br-[6px]"
          required
          value={store.editingCommentContent}
          oninput={(e) => setStore('editingCommentContent', e.target.value)}
          id="comment_editing_textarea"
        ></textarea>
          </div>
          <div class="mt-2 flex">
            <button
              type="button"
              onclick={() => {
                setStore('editingCommentId', '')
                setStore('editingCommentContent', '')
              }}
              disabled={store.submittingEditedComment}
              class="rounded-full text-sm dark:bg-neutral-700 bg-neutral-200 px-4 py-2 flex items-center disabled:opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x w-4 h-4 mr-1"
                viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 6l-12 12"/>
                <path d="M6 6l12 12"/>
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={store.submittingEditedComment}
              class="rounded-full text-sm dark:bg-white dark:text-black bg-neutral-800 text-white px-4 py-2 flex items-center ml-2 disabled:opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-loader-2 animate-spin w-4 h-4 mr-1" classList={{
                'hidden': !store.submittingEditedComment,
                'block': store.submittingEditedComment
              }} viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 3a9 9 0 1 0 9 9"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check w-4 h-4 mr-1"
                   classList={{
                     'hidden': store.submittingEditedComment,
                     'block': !store.submittingEditedComment
                   }} viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                   stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M5 12l5 5l10 -10"/>
              </svg>
              Confirm
            </button>
          </div>
        </form>
      </div>

    </Show>

  </>
}

export default commentEditingArea
