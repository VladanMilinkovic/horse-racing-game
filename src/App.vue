<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import RaceControls from './components/RaceControls.vue'
import HorseList from './components/HorseList.vue'
import RaceTrack from './components/RaceTrack.vue'
import RaceSchedule from './components/RaceSchedule.vue'
import RaceResults from './components/RaceResults.vue'

const store = useStore()

const horses = computed(() => store.state.horses)
const schedule = computed(() => store.state.schedule)
const results = computed(() => store.state.results)
const running = computed(() => store.state.raceRunning)
const progress = computed(() => store.state.progressByHorseId)
const roundTimingByHorseId = computed(() => store.state.roundTimingByHorseId)
const roundElapsedSeconds = computed(() => store.state.roundElapsedSeconds)
const nextRound = computed(() => store.state.nextRound)
const intermissionSeconds = computed(() => store.state.intermissionSeconds)
const activeRound = computed(() => store.getters.activeRound)
const horseMap = computed(() => store.getters.horseMap)
const canStart = computed(() => schedule.value.length === 6 && !running.value)
const sideTab = ref('program')

const activeRoundHorses = computed(() => {
  if (!activeRound.value) return []
  return activeRound.value.horseIds.map((id) => horseMap.value[id]).filter(Boolean)
})

function generateRace() {
  store.dispatch('generateRace')
}

function startRace() {
  store.dispatch('startRace')
}

function stopRace() {
  store.dispatch('stopRace')
}
</script>

<template>
  <main class="page">
    <RaceControls
      :running="running"
      :can-start="canStart"
      @generate="generateRace"
      @start="startRace"
      @stop="stopRace"
    />

    <section class="content-grid">
      <HorseList :horses="horses" />
      <RaceTrack
        :active-round="activeRound"
        :active-round-horses="activeRoundHorses"
        :progress-by-horse-id="progress"
        :round-timing-by-horse-id="roundTimingByHorseId"
        :round-elapsed-seconds="roundElapsedSeconds"
        :next-round="nextRound"
        :intermission-seconds="intermissionSeconds"
      />
      <section class="side-column">
        <div class="side-switch">
          <button :class="{ active: sideTab === 'program' }" @click="sideTab = 'program'">Program</button>
          <button :class="{ active: sideTab === 'results' }" @click="sideTab = 'results'">Results</button>
        </div>
        <RaceSchedule v-if="sideTab === 'program'" :schedule="schedule" :horse-map="horseMap" />
        <RaceResults v-else :results="results" />
      </section>
    </section>
  </main>
</template>
