import useStore from './Store.jsx'
import { githubApi, renderMarkdown } from './utils.jsx'
import IconLoading from './IconLoading.jsx'

const [store, setStore] = useStore()

function inputAndPreview() {
  async function sendComment() {
    if (store.sending_comment) {
      return false
    }

    setStore('sending_comment', true)

    let resp

    try {
      resp = await githubApi(
        `https://api.github.com/repos/${store.owner}/${store.repo}/issues/${store.githubIssueId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: store.userComment
          })
        }
      )
    } catch (e) {
      console.log(e)
      alert('发送评论失败，请稍后再试')
    } finally {
      setStore('sending_comment', false)
    }

    if (!resp.ok) {
      alert('发送评论失败，请稍后再试')
      return
    }

    let json = await resp.json()

    json.bodyHTML = await renderMarkdown(json.body, json.id, json.updated_at)
    setStore('comments', [...store.comments, json])
    setStore('userComment', '')

    setTimeout(function () {
      document.getElementById(json.id).scrollIntoView({
        behavior: 'smooth'
      })
    }, 300)
  }

  let textareaPlaceHolder = function () {
    if (store.gettingUser) {
      return 'Loading...'
    }

    if (!store.isUserLoggedIn) {
      return 'Please login first'
    }

    return 'Ask a question or leave a comment'
  }

  return (
    <>
      <section data-name="textarea" class="cwgi-pt-8">
        <form action="javascript:" onSubmit={sendComment}>
          <textarea
            disabled={store.gettingUser || !store.isUserLoggedIn}
            id="comment_textarea"
            class="cwgi-rounded-2xl cwgi-block cwgi-px-4 cwgi-py-4 cwgi-font-mono cwgi-border-none focus:cwgi-shadow-2xl dark:cwgi-bg-neutral-800 cwgi-bg-zinc-100 cwgi-w-full cwgi-resize-y cwgi-min-h-[6rem] cwgi-text-sm cwgi-rounded-br-[6px]"
            required
            name="comment"
            placeholder={textareaPlaceHolder()}
            value={store.userComment}
            onInput={(e) => setStore('userComment', e.target.value)}
          ></textarea>

          <div
            class="
          cwgi-pt-2
          cwgi-text-xs
          dark:cwgi-text-neutral-400
          cwgi-text-neutral-500
          cwgi-leading-5
        "
          >
            This comment system is powered by{' '}
            <a href="https://cwgi-docs.jw1.dev/" target="_blank" class="cwgi-text-black dark:cwgi-text-white">
              CWGI
            </a>
            , made with{' '}
            <a target="_blank" class="cwgi-text-black dark:cwgi-text-white" href="https://github.com/features/issues">
              GitHub Issues
            </a>
            , please follow the{' '}
            <a
              target="_blank"
              class="cwgi-text-black dark:cwgi-text-white"
              href="https://docs.github.com/en/site-policy/github-terms/github-community-code-of-conduct"
            >
              GitHub Community Code of Conduct
            </a>
            .
          </div>

          <div
            class="cwgi-text-center cwgi-mt-8 cwgi-flex cwgi-justify-center"
            classList={{
              'cwgi-hidden': store.gettingUser
            }}
          >
            <button
              type="submit"
              disabled={!store.isUserLoggedIn}
              classList={{
                'cwgi-hidden': store.sending_comment,
                'cwgi-opacity-50': !store.isUserLoggedIn
              }}
              class="cwgi-rounded-full cwgi-px-4 cwgi-py-2 cwgi-bg-neutral-800 cwgi-text-white dark:cwgi-bg-white dark:cwgi-text-black cwgi-text-sm cwgi-flex cwgi-items-center cwgi-group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="cwgi-mr-2 cwgi-w-4 cwgi-h-4"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 14l11 -11" />
                <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
              </svg>
              Send
            </button>
            <button
              disabled
              classList={{
                'cwgi-hidden': !store.sending_comment
              }}
              class="cwgi-rounded-full disabled:cwgi-opacity-70 cwgi-px-4 cwgi-py-2 cwgi-bg-neutral-800 cwgi-text-white dark:cwgi-bg-white dark:cwgi-text-black cwgi-text-sm cwgi-flex cwgi-items-center cwgi-whitespace-nowrap"
              type="button"
            >
              <IconLoading width={16} height={16} class={'cwgi-mr-2'}></IconLoading>
              Send
            </button>
          </div>
        </form>
      </section>
    </>
  )
}

export default inputAndPreview
