import useStore from './Store.jsx'
import {createEffect, createSignal, For, on, onMount} from 'solid-js'
import CommentListItem from './CommentListItem.jsx'
import {githubApi, renderMarkdown} from './utils.jsx'
import IconLoading from './IconLoading.jsx'

const [store, setStore] = useStore()

function CommentList() {
  createEffect(
    on(
      () => store.shouldListReactionsForCommentId,
      async (id) => {
        if (id) {
          await listReactionsForComment(id)
          setStore('shouldListReactionsForCommentId', 0)
        }
      }
    )
  )

  const per_page = 50
  const [currentPage, setCurrentPage] = createSignal(1)
  const [newlyAddedCommentsCount, setNewlyAddedCommentsCount] = createSignal(0)

  /**
   * 获取评论点赞
   * @param comment_id
   * @param retryLeft
   * @returns {Promise<boolean>}
   */
  async function listReactionsForComment(comment_id, retryLeft = 3) {
    if (store.showReactions === false) {
      return false
    }

    if (retryLeft === 0) {
      return false
    }

    let api = `https://api.github.com/repos/${store.owner}/${store.repo}/issues/comments/${comment_id}/reactions`

    let resp

    try {
      setStore('listingReactionCommentIds', [...store.listingReactionCommentIds, comment_id])
      resp = await githubApi(api)
    } catch (e) {
      console.log(e)
      await listReactionsForComment(comment_id, retryLeft - 1)
      return false
    } finally {
      setStore(
        'listingReactionCommentIds',
        store.listingReactionCommentIds.filter((item) => item !== comment_id)
      )
    }

    if (!resp.ok) {
      console.log('failed to list reactions for comment')
      await listReactionsForComment(comment_id, retryLeft - 1)
      return false
    }

    try {
      let reactions = await resp.json()

      let contentBasedReactions = {}

      reactions.forEach((item) => {
        if (!contentBasedReactions[item.content]) {
          contentBasedReactions[item.content] = [item]
        } else {
          contentBasedReactions[item.content].push(item)
        }
      })

      setStore('commentReactionMap', comment_id, contentBasedReactions)
    } catch (e) {
      console.log(e)
      await listReactionsForComment(comment_id, retryLeft - 1)
      return false
    }
  }

  async function getComments(update_id) {
    if (store.gettingUser) {
      return false
    }

    if (update_id) {
      let theCommentIndex = store.comments.findIndex((c) => c.id === update_id)

      if (theCommentIndex !== -1) {
        let html = await renderMarkdown(
          store.comments[theCommentIndex].body,
          store.comments[theCommentIndex].id,
          store.comments[theCommentIndex].updated_at
        )
        setStore('comments', theCommentIndex, 'bodyHTML', html)
      }

      return false
    }

    setStore('gettingComments', true)

    let resp = await githubApi(
      `https://api.github.com/repos/${store.owner}/${store.repo}/issues/${
        store.githubIssueId
      }/comments?per_page=${per_page}&page=${currentPage()}`
    )
    let remoteComments = await resp.json()
    setStore('gettingComments', false)
    setStore('comments', [...store.comments, ...remoteComments])
    setNewlyAddedCommentsCount(remoteComments.length)

    // get all reactions for loaded comments here
    for (let i = store.comments.length - newlyAddedCommentsCount(); i < store.comments.length; i++) {
      setStore('shouldListReactionsForCommentId', store.comments[i].id)

      if (store.comments[i].body) {
        let _r = async function () {
          let html = await renderMarkdown(store.comments[i].body, store.comments[i].id, store.comments[i].updated_at)
          setStore('comments', i, 'bodyHTML', html)
        }
        _r() // no await here, so all comments will be rendered in parallel
      }
    }
  }

  onMount(async () => {
    await new Promise((r) => setTimeout(r, 20))
    await getComments()
  })

  createEffect(
    on(
      () => store.shouldUpdateCommentId,
      async (id) => {
        if (id) {
          await getComments(id)
          setStore('shouldUpdateCommentId', 0)
        }
      }
    )
  )

  createEffect(
    on(
      () => currentPage(),
      async (page) => {
        if (page === 1) {
          return
        }
        await getComments()
        setStore('shouldUpdateCommentId', 0)
      }
    )
  )

  return (
    <>
      <section data-name="comments" class="cwgi-pt-8">
        <div
          class="cwgi-text-center cwgi-text-base cwgi-font-black cwgi-italic"
          classList={{
            'cwgi-hidden': store.gettingComments && store.comments.length === 0
          }}
        >
          <span
            classList={{
              'cwgi-hidden': store.comments.length !== 0
            }}
            class="cwgi-font-normal cwgi-text-sm cwgi-opacity-80 cwgi-not-italic"
          >
            No comments for now
          </span>
        </div>

        {
          <div class="comments-list">
            <For each={store.comments}>{(c, i) => <CommentListItem index={i}></CommentListItem>}</For>
          </div>
        }

        <div
          classList={{
            'cwgi-hidden': store.gettingComments || newlyAddedCommentsCount() < per_page
          }}
        >
          <button
            class="cwgi-bg-black dark:cwgi-bg-white cwgi-rounded-3xl cwgi-px-4 cwgi-py-2 cwgi-text-xs cwgi-text-white dark:cwgi-text-black cwgi-mx-auto cwgi-block"
            onClick={() => {
              setCurrentPage(() => currentPage() + 1)
            }}
          >
            Load More
          </button>
        </div>
      </section>

      {store.gettingComments && (
        <section data-name="loading screen" class="cwgi-pt-8">
          <div class="cwgi-flex cwgi-text-sm cwgi-justify-center cwgi-items-center">
            <div>
              <IconLoading></IconLoading>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default CommentList
