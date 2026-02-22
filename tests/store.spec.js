import { describe, expect, it } from 'vitest'
import { createGameStore } from '../src/store'
import { ROUND_DISTANCES } from '../src/constants/race'

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
})
