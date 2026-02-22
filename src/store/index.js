import { createStore } from 'vuex'
import { buildRoundRanking, createHorses, createSchedule } from '../domain/race-engine'

export function createGameStore() {
  return createStore({
    state: () => ({
      horses: [],
      schedule: [],
      results: [],
      progressByHorseId: {},
      roundTimingByHorseId: {},
      roundElapsedSeconds: 0,
      nextRound: null,
      intermissionSeconds: 0,
      activeRoundId: null,
      raceRunning: false,
      stopRequested: false,
      raceSessionId: 0,
    }),

    getters: {
      hasSchedule: (state) => state.schedule.length === 6,
      horseMap: (state) =>
        state.horses.reduce((acc, horse) => {
          acc[horse.id] = horse
          return acc
        }, {}),
      activeRound: (state) => state.schedule.find((round) => round.id === state.activeRoundId) ?? null,
    },

    mutations: {
      setHorses(state, horses) {
        state.horses = horses
      },
      setSchedule(state, schedule) {
        state.schedule = schedule
      },
      setRaceRunning(state, value) {
        state.raceRunning = value
      },
      setActiveRound(state, roundId) {
        state.activeRoundId = roundId
      },
      setResults(state, results) {
        state.results = results
      },
      pushRoundResult(state, roundResult) {
        state.results.push(roundResult)
      },
      resetProgress(state) {
        state.progressByHorseId = {}
      },
      setRoundTiming(state, payload) {
        state.roundTimingByHorseId = payload
      },
      setRoundElapsed(state, seconds) {
        state.roundElapsedSeconds = seconds
      },
      setNextRound(state, round) {
        state.nextRound = round
      },
      setIntermissionSeconds(state, seconds) {
        state.intermissionSeconds = seconds
      },
      setProgress(state, payload) {
        state.progressByHorseId = payload
      },
      setStopRequested(state, value) {
        state.stopRequested = value
      },
      setRaceSessionId(state, value) {
        state.raceSessionId = value
      },
    },

    actions: {
      generateRace({ commit }) {
        const horses = createHorses()
        const schedule = createSchedule(horses)
        commit('setHorses', horses)
        commit('setSchedule', schedule)
        commit('setResults', [])
        commit('setActiveRound', null)
        commit('resetProgress')
        commit('setRoundTiming', {})
        commit('setRoundElapsed', 0)
        commit('setNextRound', null)
        commit('setIntermissionSeconds', 0)
        commit('setStopRequested', false)
        commit('setRaceRunning', false)
      },

      async startRace({ state, getters, commit, dispatch }) {
        if (state.raceRunning || !getters.hasSchedule) return

        const sessionId = state.raceSessionId + 1
        commit('setRaceSessionId', sessionId)
        commit('setStopRequested', false)
        commit('setRaceRunning', true)
        commit('setResults', [])

        for (let index = 0; index < state.schedule.length; index += 1) {
          const round = state.schedule[index]
          if (state.stopRequested || state.raceSessionId !== sessionId) break
          commit('setActiveRound', round.id)
          const completed = await dispatch('runRound', { round, sessionId })
          if (!completed) break

          const nextRound = state.schedule[index + 1]
          if (nextRound) {
            const continued = await dispatch('waitBetweenRounds', {
              nextRound,
              sessionId,
              seconds: 5,
            })
            if (!continued) break
          }
        }

        commit('setActiveRound', null)
        commit('resetProgress')
        commit('setRoundTiming', {})
        commit('setRoundElapsed', 0)
        commit('setNextRound', null)
        commit('setIntermissionSeconds', 0)
        commit('setStopRequested', false)
        commit('setRaceRunning', false)
      },

      stopRace({ state, commit }) {
        if (!state.raceRunning) return
        commit('setStopRequested', true)
        commit('setRaceSessionId', state.raceSessionId + 1)
        commit('setNextRound', null)
        commit('setIntermissionSeconds', 0)
        commit('setRaceRunning', false)
      },

      waitBetweenRounds({ state, commit }, payload) {
        const { nextRound, sessionId, seconds } = payload
        return new Promise((resolve) => {
          commit('setNextRound', {
            id: nextRound.id,
            distance: nextRound.distance,
          })
          commit('setIntermissionSeconds', seconds)

          const endTime = Date.now() + seconds * 1000
          const tick = 100

          const interval = setInterval(() => {
            if (!state.raceRunning || state.stopRequested || state.raceSessionId !== sessionId) {
              clearInterval(interval)
              commit('setNextRound', null)
              commit('setIntermissionSeconds', 0)
              resolve(false)
              return
            }

            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
            commit('setIntermissionSeconds', remaining)

            if (remaining <= 0) {
              clearInterval(interval)
              commit('setNextRound', null)
              resolve(true)
            }
          }, tick)
        })
      },

      runRound({ state, getters, commit }, payload) {
        const { round, sessionId } = payload
        return new Promise((resolve) => {
          const horseMap = getters.horseMap
          const participants = round.horseIds.map((id) => horseMap[id])
          const ranking = buildRoundRanking(participants, round.distance)
          const maxTimeSeconds = Math.max(...ranking.map((item) => item.time))
          const timing = ranking.reduce((acc, item) => {
            acc[item.horseId] = item.time
            return acc
          }, {})
          const initialProgress = ranking.reduce((acc, item) => {
            acc[item.horseId] = 0
            return acc
          }, {})

          commit('setRoundTiming', timing)
          commit('setRoundElapsed', 0)
          commit('setProgress', initialProgress)
          const startTime = Date.now()
          const tick = 100

          const interval = setInterval(() => {
            if (!state.raceRunning || state.stopRequested || state.raceSessionId !== sessionId) {
              clearInterval(interval)
              commit('resetProgress')
              commit('setRoundElapsed', 0)
              resolve(false)
              return
            }

            const elapsedSeconds = (Date.now() - startTime) / 1000
            const progress = {}

            ranking.forEach((item) => {
              const ratio = Math.min(elapsedSeconds / item.time, 1)
              progress[item.horseId] = Math.round(ratio * 100)
            })

            commit('setProgress', progress)
            commit('setRoundElapsed', Number(elapsedSeconds.toFixed(1)))

            if (elapsedSeconds >= maxTimeSeconds) {
              clearInterval(interval)
              commit('setRoundElapsed', maxTimeSeconds)
              commit('pushRoundResult', {
                roundId: round.id,
                distance: round.distance,
                ranking,
              })
              resolve(true)
            }
          }, tick)
        })
      },
    },
  })
}

export default createGameStore()
