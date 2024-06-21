import useStore from './Store.jsx'
import {For} from 'solid-js'
import {githubApi} from './utils.jsx'
import {produce} from 'solid-js/store'

const [store, setStore] = useStore()

let reactionButtons = [
  {
    label: '👍',
    content: '+1',
    means: 'agree!'
  },
  {
    label: '👎',
    content: '-1',
    means: 'disagree!'
  },
  {
    label: '❤️',
    content: 'heart',
    means: 'love it!'
  }
]

/**
 * check if user has reacted to a comment
 * @param {number} comment_id
 * @param {string} reaction
 * @returns {number|null}
 */
let userHasReactedToComment = function (comment_id, reaction) {

  if(!store.isUserLoggedIn){
    return null
  }

  let username = store.user.login

  if (!store.commentReactionMap[comment_id]) {
    return null
  }

  if (!store.commentReactionMap[comment_id][reaction]) {
    return null
  }

  let reactions = store.commentReactionMap[comment_id][reaction]

  for (let i = 0; i < reactions.length; i++) {
    if (reactions[i].user.login === username) {
      return reactions[i].id
    }
  }
}

/**
 * undo reaction to comment
 * @param {number} comment_id
 * @param {number} reaction_id
 * @param {string} content
 * @returns {Promise<void>}
 */
async function undoReactionToComment(comment_id, reaction_id, content) {
  let api = `https://api.github.com/repos/${store.owner}/${store.repo}/issues/comments/${comment_id}/reactions/${reaction_id}`

  let resp
  try {
    setStore('reactingCommentID', [...store.reactingCommentID, comment_id])
    resp = await githubApi(api, {
      method: 'DELETE'
    })
  } catch (e) {
    console.log(e)
    return
  } finally {
    setStore('reactingCommentID', store.reactingCommentID.filter(item => item !== comment_id))
  }

  if (resp.ok) {
    setStore(produce(store => {
      store.comments = store.comments.map(item => {
        if (item.id === comment_id) {
          item.reactions[content]--
        }
        return item
      })
    }))
    // remove from commentReactionMap
    setStore('commentReactionMap', comment_id, content, store.commentReactionMap[comment_id][content].filter(item => item.id !== reaction_id))
  } else {
    // well, something went wrong
  }
}

/**
 * make reaction to comment
 * @param {string} reaction
 * @param {number} comment_id
 * @returns {Promise<boolean>}
 */
async function makeReactionToComment(reaction, comment_id) {

  if (!store.isUserLoggedIn) {
    alert('Please log in first')
    return false
  }

  let reaction_id = userHasReactedToComment(comment_id, reaction)
  if (reaction_id) {
    setStore('reactingCommentID', [...store.reactingCommentID, comment_id])
    await undoReactionToComment(comment_id, reaction_id, reaction)
    setStore('reactingCommentID', store.reactingCommentID.filter(item => item !== comment_id))
    return false
  }

  let api = `https://api.github.com/repos/${store.owner}/${store.repo}/issues/comments/${comment_id}/reactions`

  let resp

  try {
    setStore('reactingCommentID', [...store.reactingCommentID, comment_id])

    resp = await githubApi(api, {
      method: 'POST',
      body: JSON.stringify({
        content: reaction
      })
    })
  } catch (e) {
    console.log(e)
    alert('failed, please try again later')
    return false
  } finally {
    setStore('reactingCommentID', store.reactingCommentID.filter(item => item !== comment_id))
  }

  if (resp.status === 200) {
    alert('you have already reacted to this comment, thx')
    return false
  }

  if (!resp.ok) {
    alert('failed, please try again later')
    return false
  }

  setStore(produce(store => {
    store.comments = store.comments.map(item => {
      if (item.id === comment_id) {
        item.reactions[reaction]++
      }
      return item
    })
  }))

  setStore('shouldListReactionsForCommentId', comment_id)
}

function commentReactions(props) {
  const {comment} = props
  return <>
    {
      store.editingCommentId !== comment.id && <div class="cwgi-mt-[-0.6rem] cwgi-relative cwgi-z-50 cwgi-flex cwgi-items-center" data-name="reactions" classList={{
        'cwgi-opacity-50 cwgi-pointer-events-none': store.listingReactionCommentIds.includes(comment.id)
      }}>
        <For each={reactionButtons}>
          {(button, index) =>
            <button
              onClick={() => makeReactionToComment(button.content, comment.id)}
              class="cwgi-mr-1 disabled:cwgi-opacity-50 cwgi-text-xs cwgi-flex cwgi-items-center cwgi-rounded-full cwgi-px-2 cwgi-py-1 cwgi-max-h-[1.5rem] cwgi-group cwgi-text-neutral-800 dark:cwgi-text-neutral-50 dark:cwgi-bg-neutral-700 cwgi-bg-neutral-100 hover:cwgi-shadow dark:hover:cwgi-bg-white dark:hover:cwgi-text-neutral-900 hover:cwgi-bg-neutral-900 hover:cwgi-text-white"
              disabled={store.reactingCommentID.includes(comment.id)}
              title={button.means}>

              <span
                class="cwgi-transition-all cwgi-mr-1 cwgi-relative cwgi-top-0"
                classList={{
                  'cwgi-text-2xl cwgi-rotate-[-12deg] cwgi-top-[-.2rem]': userHasReactedToComment(comment.id, button.content)
                }}
              >
                {button.label}
              </span>

              <span class="cwgi-font-mono">{
                store.commentReactionMap[comment.id] && store.commentReactionMap[comment.id][button.content] ? store.commentReactionMap[comment.id][button.content].length : 0
              }</span>

            </button>}
        </For>
      </div>
    }
  </>
}

export default commentReactions
