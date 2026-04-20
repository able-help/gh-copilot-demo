<template>
  <section class="artist-directory">
    <div class="artist-directory-copy">
      <div>
        <h2>{{ t('artistDirectoryTitle') }}</h2>
        <p>{{ t('artistDirectorySubtitle') }}</p>
      </div>
      <button
        class="artist-filter-reset"
        type="button"
        :class="{ active: selectedArtistId === null }"
        @click="$emit('select', null)"
      >
        {{ t('allArtists') }}
      </button>
    </div>

    <div class="artist-grid">
      <button
        v-for="artist in artists"
        :key="artist.id"
        class="artist-card"
        type="button"
        :class="{ active: selectedArtistId === artist.id }"
        @click="$emit('select', artist.id)"
      >
        <strong>{{ artist.name }}</strong>
        <span>{{ t('genreLabel') }}: {{ artist.genre ?? t('noGenre') }}</span>
        <span>{{ t('artistCatalogCount', { count: albumCountByArtistId[artist.id] ?? 0 }) }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { t } from '../i18n'
import type { Artist } from '../types/album'

interface Props {
  artists: Artist[]
  selectedArtistId: number | null
  albumCountByArtistId: Record<number, number>
}

defineProps<Props>()

defineEmits<{
  select: [artistId: number | null]
}>()
</script>

<style scoped>
.artist-directory {
  background: var(--surface-inverse);
  border: 1px solid var(--border-inverse);
  border-radius: 24px;
  box-shadow: var(--shadow-panel-soft);
  padding: 1.2rem;
  color: var(--page-text);
  backdrop-filter: blur(10px);
}

.artist-directory-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.artist-directory-copy h2 {
  margin: 0;
  font-size: 1.4rem;
}

.artist-directory-copy p {
  margin: 0.35rem 0 0;
  color: var(--header-muted);
}

.artist-filter-reset,
.artist-card {
  border: 1px solid var(--border-inverse-strong);
  background: var(--surface-card-contrast);
  color: var(--page-text);
  border-radius: 18px;
  box-shadow: var(--shadow-selected);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.artist-filter-reset {
  padding: 0.7rem 1rem;
  font-weight: 700;
}

.artist-filter-reset.active,
.artist-card.active {
  background: var(--surface-highlight-strong);
  border-color: var(--border-highlight);
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.9rem;
}

.artist-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: left;
  padding: 0.95rem 1rem;
}

.artist-card strong {
  font-size: 1rem;
}

.artist-card span {
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.artist-filter-reset:hover,
.artist-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .artist-directory-copy {
    flex-direction: column;
  }
}
</style>