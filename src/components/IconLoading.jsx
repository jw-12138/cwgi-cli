export default function IconLoading(props = {}) {
  console.log(props.visible)
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    class={'cwgi-animate-spin ' + (props.class || ' ') + (props.visible === false ? ' cwgi-hidden' : '')}
    width={props.width || '24'}
    height={props.height || '24'}
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 3a9 9 0 1 0 9 9"/>
  </svg>
}
