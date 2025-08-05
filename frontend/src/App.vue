<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSocketStore } from '@/stores/socket'

const socketStore = useSocketStore()

onMounted(async () => {
  try {
    await socketStore.connect()
  } catch (error) {
    console.error('Failed to establish socket connection:', error)
    // Connection will be retried when needed by individual components
  }
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
