import { afterEach, describe, expect, it, vi } from 'vitest'
import { createGameStore } from '../src/store'
import { ROUND_DISTANCES } from '../src/constants/race'

afterEach(() => {
  vi.useRealTimers()
})

describe('horse racing store', () => {
  it('generates 20 horses with unique colors and valid condition', () => {
    const store = createGameStore()

    store.dispatch('generateRace')

    expect(store.state.horses).toHaveLength(20)

    const colors = new Set(store.state.horses.map((horse) => horse.color))
    expect(colors.size).toBe(20)

    for (const horse of store.state.horses) {
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
    }
  })

  it('builds schedule with six rounds and expected distances', () => {
    const store = createGameStore()
    store.dispatch('generateRace')

    expect(store.state.schedule).toHaveLength(6)
    expect(store.state.schedule.map((round) => round.distance)).toEqual(ROUND_DISTANCES)

    for (const round of store.state.schedule) {
      expect(round.horseIds).toHaveLength(10)
      const ids = new Set(round.horseIds)
      expect(ids.size).toBe(10)
    }
  })

  it('updates race progress and saves round result after completion', async () => {
    vi.useFakeTimers()

    const store = createGameStore()
    const horses = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Horse ${index + 1}`,
      color: '#000000',
      condition: 50,
    }))

    store.commit('setHorses', horses)
    store.commit('setRaceRunning', true)
    store.commit('setRaceSessionId', 1)
    store.commit('setStopRequested', false)

    const round = {
      id: 1,
      distance: 1200,
      horseIds: horses.map((horse) => horse.id),
    }

    const roundPromise = store.dispatch('runRound', { round, sessionId: 1 })

    await vi.advanceTimersByTimeAsync(1200)

    const progressValues = Object.values(store.state.progressByHorseId)
    expect(progressValues).toHaveLength(10)
    expect(progressValues.some((value) => value > 0 && value < 100)).toBe(true)

    await vi.runAllTimersAsync()
    const completed = await roundPromise

    expect(completed).toBe(true)
    expect(store.state.results).toHaveLength(1)
    expect(store.state.results[0].ranking).toHaveLength(10)
  })

  it('completes all six rounds and stores sequential results', async () => {
    vi.useFakeTimers()

    const store = createGameStore()
    store.dispatch('generateRace')

    const startPromise = store.dispatch('startRace')

    await vi.runAllTimersAsync()
    await startPromise

    expect(store.state.results).toHaveLength(6)
    expect(store.state.results.map((item) => item.roundId)).toEqual([1, 2, 3, 4, 5, 6])
    expect(store.state.raceRunning).toBe(false)
  })

  it('runs and clears intermission countdown between rounds', async () => {
    vi.useFakeTimers()

    const store = createGameStore()
    store.commit('setRaceRunning', true)
    store.commit('setRaceSessionId', 2)
    store.commit('setStopRequested', false)

    const waitPromise = store.dispatch('waitBetweenRounds', {
      nextRound: { id: 2, distance: 1400 },
      sessionId: 2,
      seconds: 5,
    })

    expect(store.state.nextRound).toEqual({ id: 2, distance: 1400 })
    expect(store.state.intermissionSeconds).toBe(5)

    await vi.advanceTimersByTimeAsync(2100)
    expect(store.state.intermissionSeconds).toBeLessThanOrEqual(3)
    expect(store.state.intermissionSeconds).toBeGreaterThanOrEqual(2)

    await vi.runAllTimersAsync()
    const continued = await waitPromise

    expect(continued).toBe(true)
    expect(store.state.nextRound).toBeNull()
    expect(store.state.intermissionSeconds).toBe(0)
  })

  it('stops active race when stopRace is triggered', async () => {
    vi.useFakeTimers()

    const store = createGameStore()
    store.dispatch('generateRace')

    const startPromise = store.dispatch('startRace')
    await vi.advanceTimersByTimeAsync(1200)
    store.dispatch('stopRace')

    await vi.runAllTimersAsync()
    await startPromise

    expect(store.state.raceRunning).toBe(false)
    expect(store.state.activeRoundId).toBeNull()
    expect(store.state.intermissionSeconds).toBe(0)
  })
})
