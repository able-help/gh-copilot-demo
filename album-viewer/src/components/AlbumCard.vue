<template>
  <div class="album-card">
    <div class="album-image">
      <img 
        :src="album.image_url" 
        :alt="album.title"
        @error="handleImageError"
        loading="lazy"
      />
      <div class="play-overlay">
        <div class="play-button">▶</div>
      </div>
    </div>
    
    <div class="album-info">
      <h3 class="album-title">{{ album.title }}</h3>
      <p class="album-artist">{{ album.artist.name }}</p>
      <div class="album-meta">
        <span>{{ t('genreLabel') }}: {{ album.artist.genre ?? t('noGenre') }}</span>
        <span>{{ t('releaseDateLabel') }}: {{ album.release_date ? formatDate(album.release_date) : t('noReleaseDate') }}</span>
        <span v-if="album.year !== null">{{ t('yearLabel') }}: {{ album.year }}</span>
      </div>
      <div class="album-price">
        <span class="price">{{ formatCurrency(album.price) }}</span>
      </div>
    </div>
    
    <div class="album-actions">
      <button class="btn btn-primary" type="button" @click="$emit('add-to-cart', album)">
        {{ t('addToCart') }}
      </button>
      <button class="btn btn-secondary" type="button" @click="$emit('preview', album)">{{ t('preview') }}</button>
    </div>
    <div class="album-management-actions">
      <button class="btn btn-tertiary" type="button" @click="$emit('edit', album)">
        {{ t('editAlbum') }}
      </button>
      <button class="btn btn-danger" type="button" @click="$emit('delete', album.id)">
        {{ t('deleteAlbum') }}
      </button>
    </div>
    <p v-if="quantity > 0" class="cart-status">{{ t('quantityInCart', { count: quantity }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate, t } from '../i18n'
import type { Album } from '../types/album'

interface Props {
  album: Album
  quantity: number
}

defineProps<Props>()

defineEmits<{
  'add-to-cart': [album: Album]
  preview: [album: Album]
  edit: [album: Album]
  delete: [albumId: number]
}>()

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = `https://via.placeholder.com/300x300/667eea/white?text=${encodeURIComponent(t('albumCoverFallback'))}`
}
</script>

<style scoped>
.album-card {
  background: var(--surface-card);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.15s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(10px);
}

.album-card:hover {
  box-shadow: var(--shadow-card-hover);
}

.album-card:active {
  transform: scale(0.9);
}

.album-image {
  position: relative;
  overflow: hidden;
}

.album-image img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-card:hover .album-image img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--album-overlay-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 60px;
  height: 60px;
  background: var(--surface-pill);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-accent-strong);
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button:hover {
  background: var(--input-bg);
  transform: scale(1.1);
}

.album-info {
  padding: 1.5rem;
}

.album-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.album-artist {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.album-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.album-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  color: var(--text-tertiary);
  font-size: 0.88rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-accent-strong);
}

.album-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
}

.album-management-actions {
  padding: 0 1.5rem 1rem;
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--text-accent-strong);
  color: var(--text-on-accent);
}

.btn-primary:hover {
  background: var(--text-accent);
  transform: translateY(-2px);
}

.cart-status {
  padding: 0 1.5rem 1.5rem;
  margin: 0;
  color: var(--text-accent);
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-secondary {
  background: var(--button-secondary-bg);
  color: var(--text-accent-strong);
  border: 2px solid var(--button-secondary-border);
}

.btn-secondary:hover {
  background: var(--text-accent-strong);
  color: var(--text-on-accent);
  transform: translateY(-2px);
}

.btn-tertiary {
  background: var(--surface-accent-strong);
  color: var(--text-accent);
  border: 1px solid var(--button-tertiary-border);
}

.btn-tertiary:hover {
  background: var(--surface-accent-hover);
  transform: translateY(-2px);
}

.btn-danger {
  background: var(--surface-danger);
  color: var(--text-on-danger);
  border: 1px solid var(--button-danger-border);
}

.btn-danger:hover {
  background: var(--surface-danger-hover);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .album-info {
    padding: 1rem;
  }
  
  .album-actions {
    padding: 0 1rem 1rem;
    flex-direction: column;
  }

  .album-management-actions {
    padding: 0 1rem 1rem;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
