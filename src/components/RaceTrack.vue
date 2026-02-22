<template>
  <article class="panel track">
    <h2>Race Track</h2>
    <p v-if="!activeRound">Click Generate, then Start.</p>
    <div v-else class="track-body">
      <p class="round-title">
        Round {{ activeRound.id }} - {{ activeRound.distance }}m
        <span class="elapsed">Elapsed: {{ roundElapsedSeconds.toFixed(1) }}s</span>
      </p>
      <div class="track-lanes">
        <div
          v-for="(horse, index) in activeRoundHorses"
          :key="horse.id"
          class="lane"
          :class="{ 'lane-winner': showWinner && horse.id === winnerHorseId }"
        >
          <span class="lane-name">
            {{ horse.name }}
            <span v-if="showWinner && horse.id === winnerHorseId">🏆</span>
          </span>
          <div class="lane-track" :class="{ 'lane-track-winner': showWinner && horse.id === winnerHorseId }">
            <span class="lane-index">{{ index + 1 }}</span>
            <span
              class="runner-icon"
              :style="{
                '--runner-progress': progressByHorseId[horse.id] ?? 0,
                color: horse.color,
              }"
              >🐎</span
            >
            <span class="finish-mark" />
          </div>
          <span class="lane-progress">
            {{ getDisplayedLaneTime(horse.id) }}
          </span>
        </div>
      </div>
      <p v-if="nextRound && intermissionSeconds > 0" class="next-race-label">
        Next race starts in {{ intermissionSeconds }}s (Lap {{ nextRound.id }} - {{ nextRound.distance }}m)
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeRound: {
    type: Object,
    default: null,
  },
  activeRoundHorses: {
    type: Array,
    required: true,
  },
  progressByHorseId: {
    type: Object,
    required: true,
  },
  roundTimingByHorseId: {
    type: Object,
    required: true,
  },
  roundElapsedSeconds: {
    type: Number,
    required: true,
  },
  nextRound: {
    type: Object,
    default: null,
  },
  intermissionSeconds: {
    type: Number,
    default: 0,
  },
})

const winnerHorseId = computed(() => {
  let bestId = null
  let bestTime = Number.POSITIVE_INFINITY

  for (const horse of props.activeRoundHorses) {
    const time = props.roundTimingByHorseId[horse.id]
    if (typeof time === 'number' && time < bestTime) {
      bestTime = time
      bestId = horse.id
    }
  }

  return bestId
})

const maxRoundTime = computed(() => {
  const values = Object.values(props.roundTimingByHorseId).filter((value) => typeof value === 'number')
  if (values.length === 0) return 0
  return Math.max(...values)
})

const showWinner = computed(() => maxRoundTime.value > 0 && props.roundElapsedSeconds >= maxRoundTime.value)

function getDisplayedLaneTime(horseId) {
  const finalTime = props.roundTimingByHorseId[horseId]
  if (typeof finalTime !== 'number') return '-'

  const liveTime = Math.min(props.roundElapsedSeconds, finalTime)
  return `${liveTime.toFixed(1)}s`
}
</script>
