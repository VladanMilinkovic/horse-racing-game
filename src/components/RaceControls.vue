<template>
  <header class="header">
    <h1>Horse Racing Game</h1>
    <div class="actions">
      <button @click="$emit('generate')" :disabled="running">Generate</button>
      <button class="start" @click="$emit('start')" :disabled="!canStart">Start</button>
      <button class="stop" @click="$emit('stop')" :disabled="!running">Stop</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  running: {
    type: Boolean,
    required: true,
  },
  canStart: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['generate', 'start', 'stop'])
</script>
