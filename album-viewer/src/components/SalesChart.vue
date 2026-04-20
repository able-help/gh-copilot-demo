<template>
  <section class="sales-panel">
    <h2>Album Sales by Month</h2>
    <p>Bars show albums sold. Colored lines show selling price by year.</p>
    <div ref="host" class="chart-host"></div>
    <p v-if="error" class="chart-error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { renderAlbumSalesPlot } from '../utils/vz'

const host = ref<HTMLElement | null>(null)
const error = ref('')

const dataUrl = import.meta.env.VITE_ALBUM_SALES_URL || '/data/album-sales.json'

let resizeFrame = 0

const draw = async (): Promise<void> => {
  if (!host.value) {
    return
  }

  try {
    error.value = ''
    await renderAlbumSalesPlot(host.value, dataUrl)
  } catch (err) {
    console.error('Failed to draw sales plot:', err)
    error.value = 'Failed to load chart data from the external JSON source.'
  }
}

const handleResize = (): void => {
  cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    void draw()
  })
}

onMounted(() => {
  void draw()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(resizeFrame)
})
</script>

<style scoped>
.sales-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(3px);
}

.sales-panel h2 {
  margin: 0;
  color: white;
  font-size: 1.4rem;
}

.sales-panel p {
  margin-top: 0.25rem;
  color: rgba(255, 255, 255, 0.85);
}

.chart-host {
  width: 100%;
  min-height: 460px;
  margin-top: 0.75rem;
}

.chart-error {
  color: #ffd3d3;
  margin-top: 0.5rem;
}
</style>
