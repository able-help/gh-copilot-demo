<template>
  <Teleport to="body">
    <div v-if="open" class="cart-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" :aria-label="t('cart')">
      <div class="cart-drawer" role="document">
        <div class="cart-header">
          <h2>🛒 {{ t('cart') }}</h2>
          <button class="close-btn" @click="$emit('close')" :aria-label="t('close')">✕</button>
        </div>

        <div v-if="cartItems.length === 0" class="cart-empty">
          <p>{{ t('cartEmpty') }}</p>
        </div>

        <ul v-else class="cart-list">
          <li v-for="album in cartItems" :key="album.id" class="cart-item">
            <img
              :src="album.image_url"
              :alt="album.title"
              class="cart-item-image"
              @error="handleImageError"
              loading="lazy"
            />
            <div class="cart-item-info">
              <p class="cart-item-title">{{ album.title }}</p>
              <p class="cart-item-artist">{{ album.artist.name }}</p>
              <p class="cart-item-price">${{ album.price.toFixed(2) }}</p>
            </div>
            <button
              class="remove-btn"
              @click="$emit('remove', album.id)"
              :aria-label="`${t('removeFromCart')}: ${album.title}`"
            >
              {{ t('removeFromCart') }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Album } from '../types/album'
import { useI18n } from '../i18n'

interface Props {
  open: boolean
  cartItems: Album[]
}

defineProps<Props>()
defineEmits<{
  close: []
  remove: [albumId: number]
}>()

const { t } = useI18n()

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/60x60/667eea/white?text=🎵'
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  background: white;
  width: min(400px, 100vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.cart-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.cart-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.cart-list {
  list-style: none;
  margin: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-title {
  margin: 0 0 0.2rem 0;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-artist {
  margin: 0 0 0.2rem 0;
  color: #666;
  font-size: 0.85rem;
}

.cart-item-price {
  margin: 0;
  font-weight: bold;
  color: #667eea;
  font-size: 0.95rem;
}

.remove-btn {
  background: transparent;
  border: 1px solid #e55;
  color: #e55;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #e55;
  color: white;
}

@media (max-width: 480px) {
  .cart-item {
    flex-wrap: wrap;
  }

  .remove-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
