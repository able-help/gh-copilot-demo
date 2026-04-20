<template>
  <div v-if="album" class="preview-backdrop" @click.self="$emit('close')">
    <aside class="preview-panel" aria-modal="true" role="dialog" :aria-label="t('albumPreviewTitle')">
      <div class="preview-header">
        <div>
          <p class="preview-kicker">{{ t('albumPreviewTitle') }}</p>
          <h2>{{ album.title }}</h2>
          <p>{{ album.artist.name }}</p>
        </div>

        <button class="preview-close" type="button" :aria-label="t('closePreview')" @click="$emit('close')">
          ×
        </button>
      </div>

      <div class="preview-body">
        <img :src="album.image_url" :alt="album.title" class="preview-cover" />

        <div class="preview-copy">
          <div class="preview-price">{{ formatCurrency(album.price) }}</div>

          <dl class="preview-metadata">
            <div>
              <dt>{{ t('artistFieldLabel') }}</dt>
              <dd>{{ album.artist.name }}</dd>
            </div>
            <div>
              <dt>{{ t('genreLabel') }}</dt>
              <dd>{{ album.artist.genre ?? t('noGenre') }}</dd>
            </div>
            <div>
              <dt>{{ t('releaseDateLabel') }}</dt>
              <dd>{{ album.release_date ? formatDate(album.release_date) : t('noReleaseDate') }}</dd>
            </div>
            <div>
              <dt>{{ t('yearLabel') }}</dt>
              <dd>{{ album.year ?? '—' }}</dd>
            </div>
            <div>
              <dt>{{ t('albumCreatedAtLabel') }}</dt>
              <dd>{{ formatDateTime(album.created_at) }}</dd>
            </div>
            <div>
              <dt>{{ t('artistCreatedAtLabel') }}</dt>
              <dd>{{ formatDateTime(album.artist.created_at) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate, formatDateTime, t } from '../i18n'
import type { Album } from '../types/album'

interface Props {
  album: Album | null
}

defineProps<Props>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.preview-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-backdrop-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 30;
}

.preview-panel {
  width: min(100%, 52rem);
  max-height: 100%;
  overflow: auto;
  background: var(--surface-modal);
  color: var(--text-primary);
  border-radius: 28px;
  box-shadow: var(--shadow-panel);
  padding: 1.5rem;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.preview-kicker {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.preview-header h2 {
  margin: 0.35rem 0 0;
  font-size: 2rem;
}

.preview-header p:last-child {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
}

.preview-close {
  border: none;
  background: var(--surface-subtle);
  color: var(--text-primary);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  font-size: 1.4rem;
  cursor: pointer;
}

.preview-body {
  display: grid;
  grid-template-columns: minmax(0, 240px) minmax(0, 1fr);
  gap: 1.5rem;
}

.preview-cover {
  width: 100%;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: var(--shadow-cover);
}

.preview-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-price {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-accent);
}

.preview-metadata {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 0;
}

.preview-metadata div {
  background: var(--surface-accent-strong);
  border: 1px solid var(--border-accent);
  border-radius: 18px;
  padding: 0.8rem 0.95rem;
}

.preview-metadata dt {
  margin: 0 0 0.25rem;
  color: var(--text-accent);
  font-size: 0.82rem;
  font-weight: 700;
}

.preview-metadata dd {
  margin: 0;
  font-weight: 700;
}

@media (max-width: 768px) {
  .preview-body {
    grid-template-columns: 1fr;
  }

  .preview-metadata {
    grid-template-columns: 1fr;
  }
}
</style>