import useStore from './Store.jsx'
import IconLoading from './IconLoading.jsx'

const [store] = useStore()

function Loading(props = {}) {
  return (
    <>
      {store.gettingUser && (
        <section data-name="user loading">
          <div class="cwgi-flex cwgi-text-sm cwgi-justify-center cwgi-items-center">
            <div>
              <IconLoading/>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default Loading
