import useStore from './Store.jsx'
import { createSignal } from 'solid-js'
import { auth_api } from './utils.jsx'
import IconX from './IconX.jsx'
import IconGitHub from './IconGitHub.jsx'

const [store, setStore] = useStore()

function LoginPanel() {
  const authUrl = `${auth_api}?state=${Date.now()}&client_id=${store.clientId}&redirect_uri=${encodeURIComponent(
    `https://cwgi.jw1.dev/callback?r=${location.href}`
  )}`

  // popup
  let [userActionWindow, setUserActionWindow] = createSignal(false)

  window.addEventListener('click', function () {
    if (store.mouseIsInsideWindow === false) {
      setUserActionWindow(false)
    }

    if (store.commentActionDropdown && !store.deletingId) {
      setStore('commentActionDropdown', '')
    }
  })

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (userActionWindow()) {
        setUserActionWindow(false)
      }

      if (store.commentActionDropdown && !store.deletingId) {
        setStore('commentActionDropdown', '')
      }
    }
  })

  /**
   * go to user GitHub page
   */
  function goToUser() {
    location.href = store.user.html_url
  }

  /**
   * go to log in
   */
  function login() {
    location.href = authUrl
  }

  /**
   * log out
   * @returns {boolean}
   */
  function logout() {
    let c = confirm('Are you sure?😯')
    if (!c) {
      return false
    }

    localStorage.clear()
    setStore('isUserLoggedIn', false)
    setStore('user', {})
    setStore('sending_comment', false)
    setUserActionWindow(false)
    setStore('mouseIsInsideWindow', false)
    setStore('reactingCommentID', [])
    setStore('listingReactionCommentId', null)
  }

  return (
    <>
      {!store.gettingUser && (
        <section data-name="login">
          <div class="cwgi-text-center cwgi-relative cwgi-h-[32px]">
            {userActionWindow() && (
              <div
                onMouseEnter={() => setStore('mouseIsInsideWindow', true)}
                onMouseLeave={() => setStore('mouseIsInsideWindow', false)}
                class="
              cwgi-border
              cwgi-absolute
              cwgi-w-[200px]
              cwgi-px-2
              cwgi-py-2
              cwgi-rounded-[1rem]
              dark:cwgi-bg-neutral-800
              cwgi-bg-white
              cwgi-left-1/2
              cwgi-bottom-[37px]
              cwgi-popup-border
              hover:cwgi-shadow-xl
              cwgi-transition-shadow"
                style={{
                  transform: 'translateX(-50%)',
                  animation: 'slideUp_offset .15s ease'
                }}
              >
                <button
                  class="cwgi-text-xs cwgi-px-2 cwgi-py-2 cwgi-text-center dark:hover:cwgi-bg-white/10 hover:cwgi-bg-black/10 hover:cwgi-shadow cwgi-w-full cwgi-rounded-[.5rem] cwgi-flex cwgi-items-center cwgi-justify-center"
                  onClick={goToUser}
                >
                  <IconGitHub class={'cwgi-w-4 cwgi-h-4 cwgi-mr-2'}/>
                  My GitHub Page
                </button>

                <button
                  class="cwgi-text-xs cwgi-px-2 cwgi-py-2 cwgi-text-center hover:cwgi-bg-red-500 hover:cwgi-text-white hover:cwgi-shadow focus:cwgi-bg-red-500 focus:cwgi-text-white cwgi-w-full cwgi-rounded-[.5rem] cwgi-flex cwgi-items-center cwgi-justify-center"
                  onClick={logout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="cwgi-w-4 cwgi-h-4 cwgi-mr-2"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                  </svg>
                  Logout
                </button>
              </div>
            )}

            <div
              onMouseEnter={() => setStore('mouseIsInsideWindow', true)}
              onMouseLeave={() => setStore('mouseIsInsideWindow', false)}
              class="user-window dark:cwgi-bg-neutral-800 cwgi-bg-neutral-100 cwgi-h-[32px] cwgi-items-center cwgi-inline-block cwgi-border-none cwgi-relative cwgi-z-10 cwgi-rounded-full hover:cwgi-shadow-xl cwgi-transition-all "
            >
              {store.isUserLoggedIn && (
                <button
                  class="cwgi-flex cwgi-h-[32px] cwgi-items-center cwgi-border-none cwgi-cursor-pointer cwgi-select-none cwgi-rounded-full"
                  onClick={() => setUserActionWindow(!userActionWindow())}
                  onFocus={() => setStore('mouseIsInsideWindow', true)}
                  onBlur={() => setStore('mouseIsInsideWindow', false)}
                >
                  <span class="cwgi-w-[32px] cwgi-h-[32px] cwgi-overflow-hidden cwgi-rounded-full">
                    <img
                      src={
                        store.apiBase
                          ? store.apiBase + '/proxy/' + store.user.avatar_url + '&s=64'
                          : store.user.avatar_url + '&s=64'
                      }
                      alt="user avatar"
                      class="cwgi-w-full cwgi-h-full"
                    />
                  </span>
                  <span class="cwgi-text-sm cwgi-pl-2 cwgi-pr-2">{store.user.login}</span>
                  <span class="cwgi-pr-2">
                    {!userActionWindow() && (
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
                        <path d="M8 9l4 -4l4 4" />
                        <path d="M16 15l-4 4l-4 -4" />
                      </svg>
                    )}

                    {userActionWindow() && (
                      <IconX classList={"cwgi-w-4 cwgi-h-4"}/>
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>

          {!store.isUserLoggedIn && (
            <div class="cwgi-text-center">
              <button
                onClick={login}
                id={'loginWithGitHub'}
                class="cwgi-text-sm cwgi-px-8 cwgi-py-2 cwgi-rounded-full dark:cwgi-bg-white dark:cwgi-text-black cwgi-flex cwgi-items-center cwgi-mx-auto cwgi-bg-neutral-800 cwgi-text-white cwgi-shadow-2xl"
              >
                Login with <IconGitHub class={'cwgi-ml-2 cwgi-h-5'}/>
              </button>
            </div>
          )}
        </section>
      )}
    </>
  )
}

export default LoginPanel
