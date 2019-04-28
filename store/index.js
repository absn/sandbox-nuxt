import { firebaseMutations, firebaseAction } from 'vuexfire'
import db from '~/plugins/firebase'
import { SET_GAME_ID } from './mutation-types'
import { LOAD_GAME, SET_PLAYERS_REF } from './action-types'

const gamesRef = db.ref('games')

export const state = () => ({
  gameId: null,
  players: [],
})

export const mutations = {
  ...firebaseMutations
}

export const actions = {
  async [LOAD_GAME] ({commit, dispatch}, gameKey) {
    const gameRef = gamesRef.child(gameKey)
    const gameSnapshot = await gameRef.once('value')
    const game = gameSnapshot.val()
    if (game && ('players' in game)) {
      commit(SET_GAME_ID, gameRef.key)
      dispatch(SET_PLAYERS_REF, gameRef.child('players'))
      return true
    }
    return false
  },

  async [ADD_TECH] ({state, commit}, {player, level, techId}) {
    const playersRef = gamesRef.child(state.gameId).child('players')
    await playersRef.child(player['.key']).transaction((p) => {
      if (p) {
        p.tree = {first: [], second: [], third: [], fourth: [], ...p.tree}
        p.tree[level].push(techId)
      }
      return p
    })
  },
  
  [SET_PLAYERS_REF]: firebaseAction(({bindFirebaseRef, commit}, playersRef) => {
    bindFirebaseRef('players', playersRef)
  }),
}