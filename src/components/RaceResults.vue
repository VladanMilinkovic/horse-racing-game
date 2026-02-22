<template>
  <section class="panel results side-panel">
    <h2>Results</h2>
    <div class="panel-scroll">
      <p v-if="results.length === 0">No race results yet.</p>
      <div v-else class="results-list">
        <article v-for="roundResult in results" :key="roundResult.roundId" class="result-card">
          <h3>Round {{ roundResult.roundId }} - {{ roundResult.distance }}m</h3>
          <ol>
            <li
              v-for="(item, index) in roundResult.ranking"
              :key="item.horseId"
              :class="{ 'winner-row': index === 0 }"
            >
              <span><strong>#{{ index + 1 }}</strong> {{ item.horseName }}</span>
              <strong>{{ item.time }}s <span v-if="index === 0">🏆</span></strong>
            </li>
          </ol>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  results: {
    type: Array,
    required: true,
  },
})
</script>
