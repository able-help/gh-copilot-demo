<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <div>
          <h1>🎵 Album Collection</h1>
          <p>Discover amazing music albums</p>
        </div>
        <div class="header-controls">
          <select class="lang-select" :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value as 'en' | 'fr' | 'de')">
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
          </select>
          <button
            class="cart-btn"
            @click="cartOpen = true"
            :aria-label="t('viewCart')"
          >
            🛒
            <span v-if="cartCount > 0" class="cart-badge" aria-live="polite">{{ cartCount }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading albums...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchAlbums" class="retry-btn">Try Again</button>
      </div>

      <div v-else class="content">
        <SalesChart />

        <div class="albums-grid">
          <AlbumCard 
            v-for="album in albums" 
            :key="album.id" 
            :album="album"
            :inCart="isInCart(album.id)"
            @addToCart="addToCart"
          />
        </div>
      </div>
    </main>

    <CartDetail
      :open="cartOpen"
      :cartItems="cartItems"
      @close="cartOpen = false"
      @remove="removeFromCart"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AlbumCard from './components/AlbumCard.vue'
import SalesChart from './components/SalesChart.vue'
import CartDetail from './components/CartDetail.vue'
import type { Album } from './types/album'
import { useCart } from './composables/useCart'
import { useI18n } from './i18n'

const albums = ref<Album[]>([])
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const cartOpen = ref<boolean>(false)

const { cartItems, cartCount, isInCart, addToCart, removeFromCart } = useCart()
const { locale, setLocale, t } = useI18n()

// Fetch albums from the API
const fetchAlbums = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    const response = await axios.get<Album[]>('/albums')
    albums.value = response.data
  } catch (err) {
    error.value = 'Failed to load albums. Please make sure the API is running.'
    console.error('Error fetching albums:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAlbums()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  color: white;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-top > div:first-child {
  flex: 1;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.lang-select {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.lang-select option {
  color: #333;
  background: white;
}

.cart-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.cart-btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.cart-badge {
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50px;
  min-width: 1.3rem;
  height: 1.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.3rem;
  line-height: 1;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 4rem;
  color: white;
}

.error p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.retry-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: white;
  color: #667eea;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-controls {
    align-self: flex-end;
  }
}
</style>
