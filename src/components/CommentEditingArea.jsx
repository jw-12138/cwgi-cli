import {Show} from 'solid-js'
import useStore from './Store.jsx'
import {githubApi} from './utils.jsx'

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

  let endpoint = `https://api.github.com/repos/${store.owner}/${store.repo}/issues/comments/${id}`

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
      <div class="cwgi-mt-2" data-name="edit area">
        <form
          action="javascript:"
          onsubmit={confirmEditing}>
          <div>
        <textarea
          class="cwgi-rounded-2xl cwgi-block cwgi-px-4 cwgi-py-4 cwgi-font-mono cwgi-border-none focus:cwgi-shadow-2xl dark:cwgi-bg-neutral-800 cwgi-bg-zinc-100 cwgi-w-full cwgi-resize-y cwgi-min-h-[6rem] cwgi-text-sm cwgi-rounded-br-[6px]"
          required
          value={store.editingCommentContent}
          oninput={(e) => setStore('editingCommentContent', e.target.value)}
          id="comment_editing_textarea"
        ></textarea>
          </div>
          <div class="cwgi-mt-2 cwgi-flex">
            <button
              type="button"
              onclick={() => {
                setStore('editingCommentId', '')
                setStore('editingCommentContent', '')
              }}
              disabled={store.submittingEditedComment}
              class="cwgi-rounded-full cwgi-text-sm dark:cwgi-bg-neutral-700 cwgi-bg-neutral-200 cwgi-px-4 cwgi-py-2 cwgi-flex cwgi-items-center disabled:cwgi-opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x cwgi-w-4 cwgi-h-4 cwgi-mr-1"
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
              class="cwgi-rounded-full cwgi-text-sm dark:cwgi-bg-white dark:cwgi-text-black cwgi-bg-neutral-800 cwgi-text-white cwgi-px-4 cwgi-py-2 cwgi-flex cwgi-items-center cwgi-ml-2 disabled:cwgi-opacity-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-loader-2 cwgi-animate-spin cwgi-w-4 cwgi-h-4 cwgi-mr-1" classList={{
                'cwgi-hidden': !store.submittingEditedComment,
                'cwgi-block': store.submittingEditedComment
              }} viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 3a9 9 0 1 0 9 9"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check cwgi-w-4 cwgi-h-4 cwgi-mr-1"
                   classList={{
                     'cwgi-hidden': store.submittingEditedComment,
                     'cwgi-block': !store.submittingEditedComment
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
