import {createStore} from 'solid-js/store'

const [store, setStore] = createStore({
  apiBase: '',
  mouseIsInsideWindow: false,
  mouseIsInActionWindow: false,
  sending_comment: false,
  gettingComments: false,
  userComment: '',
  user: {},
  gettingUser: false,
  githubIssueId: '',
  comments: [],
  isUserLoggedIn: false,
  proxy: '',
  reactingCommentID: [],
  listingReactionCommentIds: [],
  accessToken: '',
  deletingId: '',
  editingCommentId: '',
  editingCommentContent: '',
  commentActionDropdown: '',
  submittingEditedComment: false,
  shouldUpdateCommentId: 0,
  commentReactionMap: {},
  reactingIds: [],
  shouldListReactionsForCommentId: 0,
  owner: '',
  repo: '',
  clientId: ''
})

export default function useStore() {
  return [store, setStore]
}
