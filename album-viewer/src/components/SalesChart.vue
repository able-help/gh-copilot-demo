<template>
  <section class="sales-panel">
    <h2>{{ t('salesTitle') }}</h2>
    <p>{{ t('salesSubtitle') }}</p>
    <div ref="host" class="chart-host"></div>
    <p v-if="hasError" class="chart-error">{{ t('salesLoadError') }}</p>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatCurrency, locale, monthLabels, t } from '../i18n'
import { theme } from '../theme'
import { renderAlbumSalesPlot } from '../utils/vz'

const host = ref<HTMLElement | null>(null)
const hasError = ref(false)

const dataUrl = import.meta.env.VITE_ALBUM_SALES_URL || '/data/album-sales.json'

let resizeFrame = 0

function cssVar(name: string): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const draw = async (): Promise<void> => {
  if (!host.value) {
    return
  }

  try {
    hasError.value = false
    await renderAlbumSalesPlot(host.value, dataUrl, {
      months: monthLabels(),
      formatCurrency,
      monthAxisLabel: t('monthAxisLabel'),
      albumsSoldAxisLabel: t('albumsSoldAxisLabel'),
      sellingPriceAxisLabel: t('sellingPriceAxisLabel'),
      sellingPriceTooltipLabel: t('sellingPriceTooltipLabel'),
      priceLegendLabel: t('priceLegendLabel'),
      axisTextColor: cssVar('--chart-axis'),
      gridLineColor: cssVar('--chart-grid'),
      barFill: cssVar('--chart-bar-fill'),
      seriesColors: [
        cssVar('--chart-series-1'),
        cssVar('--chart-series-2'),
        cssVar('--chart-series-3'),
        cssVar('--chart-series-4'),
        cssVar('--chart-series-5')
      ]
    })
  } catch (err) {
    console.error('Failed to draw sales plot:', err)
    hasError.value = true
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

watch(locale, () => {
  void draw()
})

watch(theme, () => {
  void draw()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(resizeFrame)
})
</script>

<style scoped>
.sales-panel {
  background: var(--chart-panel-bg);
  border: 1px solid var(--chart-panel-border);
  border-radius: 16px;
  padding: 1rem;
  backdrop-filter: blur(3px);
  box-shadow: var(--chart-panel-shadow);
}

.sales-panel h2 {
  margin: 0;
  color: var(--chart-title);
  font-size: 1.4rem;
}

.sales-panel p {
  margin-top: 0.25rem;
  color: var(--chart-copy);
}

.chart-host {
  width: 100%;
  min-height: 460px;
  margin-top: 0.75rem;
}

.chart-error {
  color: var(--chart-error);
  margin-top: 0.5rem;
}
</style>
