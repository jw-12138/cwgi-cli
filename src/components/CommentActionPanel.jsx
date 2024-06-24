import useStore from './Store.jsx'
import { githubApi } from './utils.jsx'
import IconLoading from './IconLoading.jsx'

const [store, setStore] = useStore()

async function deleteComment(id) {
  let c = confirm('Are you sure to delete this comment? 😯')
  if (!c) {
    return
  }

  setStore('deletingId', id)

  let resp

  try {
    resp = await githubApi(`https://api.github.com/repos/${store.owner}/${store.repo}/issues/comments/${id}`, {
      method: 'DELETE'
    })
  } catch (e) {
    alert('failed, please try again later')
    console.log(e)
    return false
  } finally {
    setStore('deletingId', '')
  }

  if (resp.ok || resp.status === 404) {
    let el_height = document.getElementById(id).offsetHeight
    let animationTag = `<style id="${'del_' + id}">
@keyframes comment_delete_${id} {
  from {
    height: ${el_height}px;
    padding: 2rem 0;
    opacity: 0.3;
  }
  
  to {
    height: 0;
    padding: 0;
    opacity: 0.3;
  }
}
</style>`

    document.head.insertAdjacentHTML('beforeend', animationTag)

    let deleteIndex = store.comments.findIndex((c) => c.id === id)
    setStore('comments', deleteIndex, 'aboutToGetDeleted', true)

    setTimeout(function () {
      setStore(
        'comments',
        store.comments.filter((c) => c.id !== id)
      )
      document.getElementById('del_' + id).remove()
    }, 300)
  }
}

function CommentActionPanel(props) {
  let { comment } = props
  return (
    <>
      {store.commentActionDropdown === comment.id && (
        <div
          data-name="more actions"
          class="cwgi-absolute cwgi-z-[500] cwgi-top-[2.25rem] cwgi-right-0 cwgi-rounded-[1rem] dark:cwgi-bg-neutral-800 cwgi-px-2 cwgi-py-2 cwgi-bg-neutral-100 cwgi-border-[1px] cwgi-shadow-xl cwgi-popup-border"
          style={{
            animation: '0.15s ease 0s 1 normal none running slideUp'
          }}
        >
          <button
            onClick={() => {
              setStore('editingCommentId', comment.id)
              setStore('editingCommentContent', comment.body)
              setStore('commentActionDropdown', '')
            }}
            disabled={store.deletingId === comment.id}
            class="cwgi-py-2 cwgi-px-4 cwgi-rounded-[.5rem] cwgi-w-full cwgi-text-xs cwgi-flex cwgi-transition-all dark:hover:cwgi-bg-white/10 hover:cwgi-bg-black/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="cwgi-w-4 cwgi-h-4 cwgi-mr-1"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 15l8.385 -8.415a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3z" />
              <path d="M16 5l3 3" />
              <path d="M9 7.07a7 7 0 0 0 1 13.93a7 7 0 0 0 6.929 -6" />
            </svg>
            Edit
          </button>

          <button
            onClick={() => deleteComment(comment.id)}
            disabled={store.deletingId === comment.id}
            classList={{
              'cwgi-bg-red-500 cwgi-text-white dark:cwgi-bg-red-500 dark:cwgi-text-white':
                store.deletingId === comment.id
            }}
            class="cwgi-py-2 cwgi-px-4 cwgi-rounded-[.5rem] cwgi-w-full hover:cwgi-bg-red-500 hover:cwgi-text-white dark:cwgi-bg-neutral-800 dark:cwgi-text-white cwgi-text-xs cwgi-flex cwgi-transition-all"
          >
            <svg
              classList={{
                'cwgi-hidden': store.deletingId === comment.id
              }}
              xmlns="http://www.w3.org/2000/svg"
              class="cwgi-w-4 cwgi-h-4 cwgi-mr-1"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <IconLoading visible={store.deletingId === comment.id} width={16} height={16} class={'cwgi-mr-1'}/>
            Delete
          </button>
        </div>
      )}
    </>
  )
}

export default CommentActionPanel
