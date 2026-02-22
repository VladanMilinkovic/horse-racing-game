<template>
  <article class="panel side-panel">
    <h2>Program</h2>
    <ul class="schedule-list panel-scroll">
      <li v-for="round in schedule" :key="round.id" class="schedule-card">
        <div class="schedule-head">
          <span>Lap {{ round.id }}</span>
          <strong>{{ round.distance }}m</strong>
        </div>
        <p class="schedule-meta">Starting order</p>
        <ol class="schedule-horses">
          <li v-for="(horseId, index) in round.horseIds" :key="horseId" class="schedule-line">
            <span class="schedule-position">#{{ index + 1 }}</span>
            <span>{{ horseMap[horseId]?.name }}</span>
          </li>
        </ol>
      </li>
    </ul>
  </article>
</template>

<script setup>
defineProps({
  schedule: {
    type: Array,
    required: true,
  },
  horseMap: {
    type: Object,
    required: true,
  },
})
</script>
