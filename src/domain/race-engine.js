import { ROUND_DISTANCES } from '../constants/race'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildHorseName(index) {
  const starts = ['Storm', 'Silver', 'Night', 'Wild', 'Ruby', 'Iron', 'Golden', 'Frost', 'Shadow', 'Fire']
  const ends = ['Runner', 'Flash', 'Wind', 'Spirit', 'Comet', 'Stride', 'Arrow', 'Thunder', 'Star', 'Bolt']
  const start = starts[index % starts.length]
  const end = ends[Math.floor(index / starts.length)]
  return `${start} ${end}`
}

function makePalette(size) {
  return Array.from({ length: size }, (_, i) => `hsl(${Math.round((360 / size) * i)}, 72%, 52%)`)
}

function scoreHorse(horse, distance) {
  const conditionFactor = horse.condition * 0.65
  const luckFactor = randomInt(1, 100) * 0.35
  const staminaPenalty = distance / 180
  const totalScore = conditionFactor + luckFactor - staminaPenalty
  return Math.max(1, totalScore)
}

function formatTime(seconds) {
  return Number(seconds.toFixed(2))
}

export function createHorses() {
  const colors = makePalette(20)
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: buildHorseName(i),
    color: colors[i],
    condition: randomInt(1, 100),
  }))
}

export function createSchedule(horses) {
  return ROUND_DISTANCES.map((distance, index) => {
    const picks = shuffle(horses).slice(0, 10)
    return {
      id: index + 1,
      distance,
      horseIds: picks.map((horse) => horse.id),
    }
  })
}

export function buildRoundRanking(participants, distance) {
  const scores = participants.map((horse) => ({
    horse,
    score: scoreHorse(horse, distance),
  }))

  const sorted = [...scores].sort((a, b) => b.score - a.score)

  return sorted.map((item, index) => {
    const baseSeconds = distance / (70 + item.score / 2)
    const slightOffset = index * 0.12
    return {
      horseId: item.horse.id,
      horseName: item.horse.name,
      time: formatTime(baseSeconds + slightOffset),
    }
  })
}
