import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import useStore from './Store.jsx'
import CommentActionPanel from './CommentActionPanel.jsx'
import CommentEditingArea from './CommentEditingArea.jsx'
import CommentReactions from './CommentReactions.jsx'
import IconLoading from './IconLoading.jsx'
import IconX from './IconX.jsx'

const [store, setStore] = useStore()

dayjs.extend(relativeTime)

function CommentListItem(props) {
  let comment = store.comments[props.index()]

  function toggleCommentActionDropdown(id) {
    if (store.commentActionDropdown) {
      setStore('commentActionDropdown', '')
    } else {
      setStore('commentActionDropdown', id)
    }
  }

  /**
   * mention a user
   * @param username
   */
  function mention(username) {
    let space = ' '

    if (store.userComment[store.userComment.length - 1] === ' ' || store.userComment.length === 0) {
      space = ''
    }

    if (store.editingCommentId) {
      setStore('editingCommentContent', store.editingCommentContent + `${space}@${username} `)
      document.getElementById('comment_editing_textarea').focus()
      return
    }

    setStore('userComment', store.userComment + `${space}@${username} `)
    document.getElementById('comment_textarea').focus()
  }

  /**
   * get mentions from comment string
   * @param commentStr
   */
  function getMentions(commentStr) {
    let mentions = commentStr.match(/@[a-zA-Z0-9-]+/g)
    return mentions ? mentions.map((m) => m.replace('@', '')) : []
  }

  function isReplyToPreviousComment(commentStr){
    let mentions = getMentions(commentStr)

    if(!store.comments[props.index() - 1]){
      return false
    }

    if(mentions.length === 0){
      return false
    }

    if(mentions.includes(store.comments[props.index() - 1].user.login)){
      setStore('comments', props.index() - 1, 'has_reply', true)
      return true
    }

    return false
  }

  return (
    <>
      <div
        class="item cwgi-transition-all cwgi-relative"
        classList={{
          'cwgi-py-8': !isReplyToPreviousComment(comment.body),
          'cwgi-pt-0 cwgi-pl-6': isReplyToPreviousComment(comment.body)
        }}
        id={comment.id}
        style={{
          'padding-bottom': store.showReactions ? (comment.has_reply ? '1rem' : '2rem') : '0',
          'pointer-events': store.deletingId === comment.id ? 'none' : 'auto',
          overflow: store.comments[props.index()].aboutToGetDeleted ? 'hidden' : 'visible',
          animation: 'comment_delete_' + comment.id + ' .3s ease forwards'
        }}
      >
        {isReplyToPreviousComment(comment.body) && <div class="cwgi-absolute -cwgi-left-0.5 cwgi-top-2.5">
          <svg  xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="cwgi-opacity-50 cwgi-relative -cwgi-left-0.5 cwgi-top-0.5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 6v6a3 3 0 0 0 3 3h10l-4 -4m0 8l4 -4" /></svg>
        </div>}
        <div class="user cwgi-flex cwgi-mt-2 cwgi-w-full cwgi-relative">
          <div class="outer-box cwgi-flex cwgi-justify-between cwgi-w-full">
            <a
              href={comment.html_url}
              target="_blank"
              class="user-info cwgi-flex cwgi-items-center cwgi-text-sm cwgi-group cwgi-text-black dark:cwgi-text-white cwgi-no-underline"
            >
              <img
                src={
                  store.apiBase
                    ? store.apiBase + '/proxy/' + comment.user.avatar_url + '&s=64'
                    : comment.user.avatar_url + '&s=64'
                }
                alt="user avatar"
                class="cwgi-user-avatar cwgi-w-8 cwgi-h-8 cwgi-rounded-[10px] cwgi-mb-0 cwgi-mr-2 group-hover:cwgi-shadow cwgi-transition-shadow"
              />
              <div>
                <span class="cwgi-flex cwgi-items-center">
                  {comment.user.login}
                  {comment.author_association === 'OWNER' && (
                    <span class="author-tag cwgi-px-2 cwgi-text-xs cwgi-rounded-xl cwgi-relative cwgi-scale-90 dark:cwgi-bg-indigo-700 cwgi-bg-indigo-200 dark:cwgi-text-indigo-200 cwgi-text-indigo-800 cwgi-top-[-.03rem] cwgi-ml-1">
                      Owner
                    </span>
                  )}
                  {comment.user.login === store.user.login && store.isUserLoggedIn && (
                    <span class="author-tag cwgi-px-2 cwgi-text-xs cwgi-rounded-xl cwgi-relative cwgi-scale-90 dark:cwgi-bg-yellow-300 cwgi-bg-yellow-500 dark:cwgi-text-black cwgi-text-white cwgi-top-[-.03rem] cwgi-ml-1">
                      Me
                    </span>
                  )}
                </span>
                <div class="datetime cwgi-text-[10px] cwgi-opacity-70">{dayjs(comment.created_at).fromNow()}</div>
              </div>
            </a>

            {store.isUserLoggedIn && store.editingCommentId !== comment.id && (
              <div class="comment-actions cwgi-flex-shrink-0">
                <button
                  classList={{
                    'cwgi-hidden': store.user.login !== comment.user.login
                  }}
                  aria-label="More actions"
                  class="dark:cwgi-bg-white/10 cwgi-backdrop-blur cwgi-bg-black/5 cwgi-rounded-full cwgi-w-8 cwgi-h-8 cwgi-overflow-hidden cwgi-flex cwgi-items-center cwgi-justify-center"
                  onclick={(e) => {
                    e.stopPropagation()
                    toggleCommentActionDropdown(comment.id)
                  }}
                  onmouseenter={() => setStore('mouseIsInActionWindow', true)}
                  onmouseleave={() => setStore('mouseIsInActionWindow', false)}
                >
                  <IconX width={16} height={16} visible={store.commentActionDropdown === comment.id}/>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="cwgi-w-4 cwgi-h-4"
                    classList={{
                      'cwgi-hidden': store.commentActionDropdown === comment.id
                    }}
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                  </svg>
                </button>
                <button
                  aria-label={'Mention this user'}
                  class="cwgi-h-[30px] cwgi-leading-[28px] cwgi-px-2 cwgi-rounded-full cwgi-bg-black/5 cwgi-backdrop-blur dark:cwgi-bg-white/10 dark:cwgi-text-white cwgi-text-xs"
                  onClick={() => mention(comment.user.login)}
                  classList={{
                    'cwgi-hidden': store.user.login === comment.user.login
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="cwgi-w-4 cwgi-h-4"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0v-1.5a9 9 0 1 0 -5.5 8.28" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <CommentActionPanel comment={comment}></CommentActionPanel>
        </div>

        <div
          class="cwgi-mt-2 cwgi-flex cwgi-items-center cwgi-pb-8"
          classList={{
            'cwgi-hidden': comment.bodyHTML
          }}
        >
          <IconLoading></IconLoading>
        </div>

        <div
          class="cwgi-mt-2 cwgi-page-content cwgi-comment-content"
          style="padding-bottom: 0"
          innerHTML={comment.bodyHTML ? comment.bodyHTML : `<pre>${comment.body}</pre>`}
          classList={{
            'cwgi-hidden': store.editingCommentId === comment.id || !comment.bodyHTML
          }}
        ></div>
        <CommentEditingArea comment={comment}></CommentEditingArea>
        {store.showReactions && <CommentReactions comment={comment}></CommentReactions>}
      </div>
    </>
  )
}

export default CommentListItem
