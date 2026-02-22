<template>
  <article class="panel">
    <h2>All Horses (20)</h2>
    <div class="panel-scroll">
      <ul class="horse-list">
        <li v-for="horse in horses" :key="horse.id" class="horse-item">
          <span class="dot" :style="{ backgroundColor: horse.color }" />
          <span>{{ horse.name }}</span>
          <strong>Condition: {{ horse.condition }}</strong>
        </li>
      </ul>
    </div>
  </article>
</template>

<script setup>
defineProps({
  horses: {
    type: Array,
    required: true,
  },
})
</script>
