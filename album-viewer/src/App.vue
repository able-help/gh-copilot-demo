<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <div>
          <h1>🎵 {{ t('title') }}</h1>
          <p>{{ t('subtitle') }}</p>
        </div>

        <div class="header-actions">
          <CartButton :count="cartCount" @toggle="toggleCart" />

          <label class="preference-selector theme-selector">
            <span>{{ t('themeLabel') }}</span>
            <select v-model="selectedTheme">
              <option
                v-for="themeName in availableThemes"
                :key="themeName"
                :value="themeName"
              >
                {{ themeLabelFor(themeName) }}
              </option>
            </select>
          </label>

          <label class="preference-selector language-selector">
            <span>{{ t('languageLabel') }}</span>
            <select v-model="selectedLocale">
              <option
                v-for="language in availableLocales"
                :key="language"
                :value="language"
              >
                {{ languageLabelFor(language) }}
              </option>
            </select>
          </label>
        </div>
      </div>
    </header>

    <CartDetail
      :open="isCartOpen"
      :items="cart"
      :count="cartCount"
      :subtotal="cartSubtotal"
      :tax="cartTax"
      :shipping="cartShipping"
      :total="cartTotal"
      @close="isCartOpen = false"
      @clear="clearCartItems"
      @increase="increaseQuantity"
      @decrease="decreaseQuantity"
      @remove="removeFromCart"
    />

    <AlbumPreviewDialog :album="previewAlbum" @close="previewAlbum = null" />

    <main class="main">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ t('loadingAlbums') }}</p>
      </div>

      <div v-else-if="hasError" class="error">
        <p>{{ t('albumsLoadError') }}</p>
        <button @click="fetchAlbums" class="retry-btn">{{ t('tryAgain') }}</button>
      </div>

      <div v-else class="content">
        <SalesChart />

        <ArtistDirectory
          :artists="artists"
          :selected-artist-id="selectedArtistFilter"
          :album-count-by-artist-id="albumCountByArtistId"
          @select="selectedArtistFilter = $event"
        />

        <section class="artist-panel">
          <div class="manager-copy">
            <div>
              <h2>{{ t('artistManagerTitle') }}</h2>
              <p>{{ t('artistManagerSubtitle') }}</p>
            </div>
            <span v-if="editingArtistId !== null" class="manager-badge">{{ t('editingArtist') }}</span>
          </div>

          <p v-if="artistStatusMessage" class="manager-message manager-message-success">{{ artistStatusMessage }}</p>
          <p v-if="artistFormError" class="manager-message manager-message-error">{{ artistFormError }}</p>

          <form class="artist-form" @submit.prevent="submitArtist">
            <label>
              <span>{{ t('artistNameFieldLabel') }}</span>
              <input v-model="artistForm.name" type="text" :disabled="isSavingArtist" />
            </label>

            <label>
              <span>{{ t('artistGenreFieldLabel') }}</span>
              <input v-model="artistForm.genre" type="text" :disabled="isSavingArtist" />
            </label>

            <div v-if="managedArtistAlbumCount !== null" class="manager-hint artist-form-wide">
              <strong>{{ t('artistCatalogCount', { count: managedArtistAlbumCount }) }}</strong>
              <span>{{ managedArtistAlbumCount > 0 ? t('artistDeleteBlocked') : t('artistDeleteReady') }}</span>
            </div>

            <div class="manager-actions artist-form-wide">
              <button class="manager-submit" type="submit" :disabled="isSavingArtist">
                {{ editingArtistId === null ? t('createArtist') : t('updateArtist') }}
              </button>
              <button class="manager-reset" type="button" @click="resetArtistForm" :disabled="isSavingArtist">
                {{ editingArtistId === null ? t('resetArtistForm') : t('cancelArtistEdit') }}
              </button>
              <button
                v-if="editingArtistId !== null"
                class="artist-delete"
                type="button"
                @click="removeArtist"
                :disabled="isSavingArtist || managedArtistAlbumCount !== 0"
              >
                {{ t('deleteArtist') }}
              </button>
            </div>
          </form>

          <div class="artist-list" aria-label="Artist management list">
            <button
              v-for="artist in artists"
              :key="artist.id"
              type="button"
              class="artist-list-item"
              :class="{ 'artist-list-item-selected': editingArtistId === artist.id }"
              @click="startEditingArtist(artist)"
            >
              <span class="artist-list-item-name">{{ artist.name }}</span>
              <span class="artist-list-item-meta">
                {{ artist.genre ?? t('noGenre') }} · {{ t('artistCatalogCount', { count: albumCountByArtistId[artist.id] ?? 0 }) }}
              </span>
            </button>
          </div>
        </section>

        <section ref="managerPanel" class="manager-panel">
          <div class="manager-copy">
            <div>
              <h2>{{ t('managerTitle') }}</h2>
              <p>{{ t('managerSubtitle') }}</p>
            </div>
            <span v-if="editingAlbumId !== null" class="manager-badge">{{ t('editingAlbum') }}</span>
          </div>

          <p v-if="artistLoadError" class="manager-message manager-message-error">{{ artistLoadError }}</p>
          <p v-else-if="statusMessage" class="manager-message manager-message-success">{{ statusMessage }}</p>
          <p v-if="formError" class="manager-message manager-message-error">{{ formError }}</p>

          <form class="manager-form" @submit.prevent="submitAlbum">
            <label>
              <span>{{ t('titleFieldLabel') }}</span>
              <input v-model="form.title" type="text" :disabled="isSaving" />
            </label>

            <label>
              <span>{{ t('artistFieldLabel') }}</span>
              <select v-model.number="form.artistId" :disabled="isSaving || !canManageAlbums">
                <option :value="0">{{ t('artistFieldLabel') }}</option>
                <option v-for="artist in artists" :key="artist.id" :value="artist.id">
                  {{ artist.name }}
                </option>
              </select>
            </label>

            <label>
              <span>{{ t('priceFieldLabel') }}</span>
              <input v-model="form.price" type="number" min="0" step="0.01" :disabled="isSaving" />
            </label>

            <label>
              <span>{{ t('releaseDateFieldLabel') }}</span>
              <input v-model="form.releaseDate" type="date" :disabled="isSaving" />
            </label>

            <label class="manager-form-wide">
              <span>{{ t('imageUrlFieldLabel') }}</span>
              <input v-model="form.imageUrl" type="url" :disabled="isSaving" />
            </label>

            <div v-if="selectedAlbumArtist" class="manager-hint manager-form-wide">
              <strong>{{ selectedAlbumArtist.name }}</strong>
              <span>{{ t('genreLabel') }}: {{ selectedAlbumArtist.genre ?? t('noGenre') }}</span>
            </div>

            <div class="manager-actions manager-form-wide">
              <button class="manager-submit" type="submit" :disabled="isSaving || !canManageAlbums">
                {{ editingAlbumId === null ? t('createAlbum') : t('updateAlbum') }}
              </button>
              <button class="manager-reset" type="button" @click="resetForm" :disabled="isSaving">
                {{ editingAlbumId === null ? t('resetAlbumForm') : t('cancelEdit') }}
              </button>
            </div>
          </form>

          <p v-if="!canManageAlbums && !artistLoadError" class="manager-unavailable">
            {{ t('managerUnavailable') }}
          </p>
        </section>

        <div class="albums-grid">
          <AlbumCard 
            v-for="album in filteredAlbums" 
            :key="album.id" 
            :album="album" 
            :quantity="getAlbumQuantity(cart, album.id)"
            @add-to-cart="addToCart"
            @preview="previewSelectedAlbum"
            @edit="startEditing"
            @delete="removeAlbum"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import AlbumCard from './components/AlbumCard.vue'
import AlbumPreviewDialog from './components/AlbumPreviewDialog.vue'
import ArtistDirectory from './components/ArtistDirectory.vue'
import CartButton from './components/CartButton.vue'
import CartDetail from './components/CartDetail.vue'
import SalesChart from './components/SalesChart.vue'
import { availableLocales, languageLabelFor, locale, t, themeLabelFor } from './i18n'
import { availableThemes, theme } from './theme'
import { createAlbum, createArtist, deleteAlbum, deleteArtist, listAlbums, listArtists, updateAlbum, updateArtist } from './api/albums'
import type { Album, AlbumWriteInput, Artist, ArtistWriteInput } from './types/album'
import {
  addAlbumToCart,
  clearCart,
  decreaseCartItemQuantity,
  getAlbumQuantity,
  getCartCount,
  getCartGrandTotal,
  getCartShipping,
  getCartTax,
  getCartTotal,
  increaseCartItemQuantity,
  loadCart,
  removeAlbumFromCart,
  saveCart
} from './utils/cart'
import type { CartItem } from './utils/cart'

type AlbumFormState = {
  title: string
  artistId: number
  price: string
  releaseDate: string
  imageUrl: string
}

type ArtistFormState = {
  name: string
  genre: string
}

const albums = ref<Album[]>([])
const artists = ref<Artist[]>([])
const loading = ref<boolean>(true)
const hasError = ref(false)
const artistLoadError = ref('')
const formError = ref('')
const statusMessage = ref('')
const isSaving = ref(false)
const editingAlbumId = ref<number | null>(null)
const artistFormError = ref('')
const artistStatusMessage = ref('')
const isSavingArtist = ref(false)
const editingArtistId = ref<number | null>(null)
const selectedArtistFilter = ref<number | null>(null)
const previewAlbum = ref<Album | null>(null)
const managerPanel = ref<HTMLElement | null>(null)
const selectedLocale = locale
const selectedTheme = theme
const cart = ref<CartItem[]>(typeof window === 'undefined' ? [] : loadCart(window.localStorage))
const isCartOpen = ref(false)
const form = ref<AlbumFormState>({
  title: '',
  artistId: 0,
  price: '',
  releaseDate: '',
  imageUrl: ''
})
const artistForm = ref<ArtistFormState>({
  name: '',
  genre: ''
})
const cartCount = computed(() => getCartCount(cart.value))
const cartSubtotal = computed(() => getCartTotal(cart.value))
const cartTax = computed(() => getCartTax(cartSubtotal.value))
const cartShipping = computed(() => getCartShipping(cartSubtotal.value))
const cartTotal = computed(() => getCartGrandTotal(cartSubtotal.value))
const canManageAlbums = computed(() => artists.value.length > 0 && artistLoadError.value.length === 0)
const selectedAlbumArtist = computed(() => artists.value.find((artist) => artist.id === form.value.artistId) ?? null)
const filteredAlbums = computed(() =>
  selectedArtistFilter.value === null
    ? albums.value
    : albums.value.filter((album) => album.artist_id === selectedArtistFilter.value)
)
const albumCountByArtistId = computed<Record<number, number>>(() =>
  albums.value.reduce<Record<number, number>>((counts, album) => {
    counts[album.artist_id] = (counts[album.artist_id] ?? 0) + 1
    return counts
  }, {})
)
const managedArtistAlbumCount = computed(() => {
  if (editingArtistId.value === null) {
    return null
  }

  return albumCountByArtistId.value[editingArtistId.value] ?? 0
})

function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: unknown } }).response

    if (typeof response?.data === 'string' && response.data.trim().length > 0) {
      return response.data
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message
  }

  return fallback
}

const fetchAlbums = async (): Promise<void> => {
  try {
    loading.value = true
    hasError.value = false
    albums.value = await listAlbums()
  } catch (err) {
    hasError.value = true
    console.error('Error fetching albums:', err)
  } finally {
    loading.value = false
  }
}

const fetchArtists = async (): Promise<void> => {
  try {
    artistLoadError.value = ''
    artists.value = await listArtists()

    if (selectedArtistFilter.value !== null && !artists.value.some((artist) => artist.id === selectedArtistFilter.value)) {
      selectedArtistFilter.value = null
    }

    if (form.value.artistId > 0 && !artists.value.some((artist) => artist.id === form.value.artistId)) {
      form.value.artistId = 0
    }

    if (editingArtistId.value !== null && !artists.value.some((artist) => artist.id === editingArtistId.value)) {
      resetArtistForm()
    }
  } catch (err) {
    artistLoadError.value = t('artistsLoadError')
    console.error('Error fetching artists:', err)
  }
}

const refreshCatalog = async (): Promise<void> => {
  await fetchAlbums()
  await fetchArtists()
}

function resetForm(): void {
  editingAlbumId.value = null
  formError.value = ''
  form.value = {
    title: '',
    artistId: 0,
    price: '',
    releaseDate: '',
    imageUrl: ''
  }
}

function resetArtistForm(): void {
  editingArtistId.value = null
  artistFormError.value = ''
  artistForm.value = {
    name: '',
    genre: ''
  }
}

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const candidate = new Date(year, month - 1, day)

  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 && candidate.getDate() === day
}

function buildAlbumInput(): AlbumWriteInput | null {
  const normalizedTitle = form.value.title.trim()
  const normalizedImageUrl = form.value.imageUrl.trim()
  const normalizedPrice = Number(form.value.price)
  const normalizedReleaseDate = form.value.releaseDate.trim()

  if (!normalizedTitle) {
    formError.value = t('titleRequiredError')
    return null
  }

  if (form.value.artistId <= 0) {
    formError.value = t('artistRequiredError')
    return null
  }

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    formError.value = t('priceInvalidError')
    return null
  }

  if (!normalizedImageUrl) {
    formError.value = t('imageUrlRequiredError')
    return null
  }

  if (normalizedReleaseDate && !isValidDateOnly(normalizedReleaseDate)) {
    formError.value = t('releaseDateInvalidError')
    return null
  }

  return {
    title: normalizedTitle,
    artist_id: form.value.artistId,
    price: normalizedPrice,
    image_url: normalizedImageUrl,
    release_date: normalizedReleaseDate || null
  }
}

function buildArtistInput(): ArtistWriteInput | null {
  const normalizedName = artistForm.value.name.trim()
  const normalizedGenre = artistForm.value.genre.trim()

  if (!normalizedName) {
    artistFormError.value = t('artistNameRequiredError')
    return null
  }

  return {
    name: normalizedName,
    genre: normalizedGenre || null
  }
}

async function submitAlbum(): Promise<void> {
  const input = buildAlbumInput()
  if (!input) {
    return
  }

  try {
    isSaving.value = true
    formError.value = ''
    statusMessage.value = ''

    if (editingAlbumId.value === null) {
      const createdAlbum = await createAlbum(input)
      albums.value = [...albums.value, createdAlbum]
      statusMessage.value = t('albumCreatedMessage')
    } else {
      const updatedAlbum = await updateAlbum(editingAlbumId.value, input)
      albums.value = albums.value.map((album) => (album.id === updatedAlbum.id ? updatedAlbum : album))
      statusMessage.value = t('albumUpdatedMessage')
    }

    resetForm()
  } catch (err) {
    formError.value = extractErrorMessage(err, t('albumSaveError'))
  } finally {
    isSaving.value = false
  }
}

async function submitArtist(): Promise<void> {
  const input = buildArtistInput()
  if (!input) {
    return
  }

  try {
    isSavingArtist.value = true
    artistFormError.value = ''
    artistStatusMessage.value = ''

    let persistedArtistId: number | null = null

    if (editingArtistId.value === null) {
      const createdArtist = await createArtist(input)
      persistedArtistId = createdArtist.id
      artistStatusMessage.value = t('artistCreatedMessage')
      form.value.artistId = createdArtist.id
    } else {
      const updatedArtist = await updateArtist(editingArtistId.value, input)
      persistedArtistId = updatedArtist.id
      artistStatusMessage.value = t('artistUpdatedMessage')
    }

    await refreshCatalog()
    resetArtistForm()
    if (persistedArtistId !== null) {
      form.value.artistId = persistedArtistId
    }
  } catch (err) {
    artistFormError.value = extractErrorMessage(err, t('artistSaveError'))
  } finally {
    isSavingArtist.value = false
  }
}

async function startEditing(album: Album): Promise<void> {
  editingAlbumId.value = album.id
  formError.value = ''
  statusMessage.value = ''
  form.value = {
    title: album.title,
    artistId: album.artist_id,
    price: album.price.toFixed(2),
    releaseDate: album.release_date ?? '',
    imageUrl: album.image_url
  }

  await nextTick()
  managerPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function startEditingArtist(artist: Artist): void {
  editingArtistId.value = artist.id
  artistFormError.value = ''
  artistStatusMessage.value = ''
  artistForm.value = {
    name: artist.name,
    genre: artist.genre ?? ''
  }
}

function previewSelectedAlbum(album: Album): void {
  previewAlbum.value = album
}

async function removeAlbum(albumId: number): Promise<void> {
  if (typeof window !== 'undefined' && !window.confirm(t('deleteAlbumConfirm'))) {
    return
  }

  try {
    formError.value = ''
    statusMessage.value = ''
    await deleteAlbum(albumId)
    albums.value = albums.value.filter((album) => album.id !== albumId)
    if (editingAlbumId.value === albumId) {
      resetForm()
    }
    statusMessage.value = t('albumDeletedMessage')
  } catch (err) {
    formError.value = extractErrorMessage(err, t('albumDeleteError'))
  }
}

async function removeArtist(): Promise<void> {
  if (editingArtistId.value === null) {
    return
  }

  if (typeof window !== 'undefined' && !window.confirm(t('deleteArtistConfirm'))) {
    return
  }

  try {
    isSavingArtist.value = true
    artistFormError.value = ''
    artistStatusMessage.value = ''
    const artistId = editingArtistId.value

    await deleteArtist(artistId)
    await refreshCatalog()

    if (selectedArtistFilter.value === artistId) {
      selectedArtistFilter.value = null
    }

    if (form.value.artistId === artistId) {
      form.value.artistId = 0
    }

    resetArtistForm()
    artistStatusMessage.value = t('artistDeletedMessage')
  } catch (err) {
    artistFormError.value = extractErrorMessage(err, t('artistDeleteError'))
  } finally {
    isSavingArtist.value = false
  }
}

const addToCart = (album: Album): void => {
  cart.value = addAlbumToCart(cart.value, album)
  isCartOpen.value = true
}

const removeFromCart = (albumId: number): void => {
  cart.value = removeAlbumFromCart(cart.value, albumId)
}

const increaseQuantity = (albumId: number): void => {
  cart.value = increaseCartItemQuantity(cart.value, albumId)
}

const decreaseQuantity = (albumId: number): void => {
  cart.value = decreaseCartItemQuantity(cart.value, albumId)
}

const clearCartItems = (): void => {
  cart.value = clearCart()
}

const toggleCart = (): void => {
  isCartOpen.value = !isCartOpen.value
}

watch(
  cart,
  (value) => {
    if (typeof window !== 'undefined') {
      saveCart(window.localStorage, value)
    }
  },
  { deep: true }
)

onMounted(() => {
  void refreshCatalog()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
}

.header {
  margin-bottom: 3rem;
  color: var(--page-text);
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: var(--header-title-shadow);
}

.header p {
  font-size: 1.2rem;
  color: var(--header-muted);
}

.preference-selector {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: left;
}

.preference-selector span {
  color: var(--header-muted);
}

.preference-selector select {
  min-width: 9rem;
  border: 1px solid var(--header-control-border);
  border-radius: 10px;
  background: var(--header-control-bg);
  color: var(--header-control-text);
  box-shadow: var(--header-control-shadow);
  backdrop-filter: blur(16px);
  padding: 0.6rem 0.75rem;
  font-size: 0.95rem;
}

.preference-selector select:hover {
  background: var(--header-control-bg-hover);
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

.manager-panel {
  background: var(--surface-primary);
  color: var(--text-primary);
  border-radius: 26px;
  padding: 1.5rem;
  box-shadow: var(--shadow-panel);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.artist-panel {
  background: var(--surface-secondary);
  color: var(--text-primary);
  border-radius: 26px;
  padding: 1.5rem;
  box-shadow: var(--shadow-panel-soft);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manager-copy {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.manager-copy h2 {
  margin: 0;
  font-size: 1.6rem;
}

.manager-copy p {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
}

.manager-badge {
  background: var(--surface-accent-strong);
  color: var(--text-accent);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
}

.manager-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.artist-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.manager-form label,
.artist-form label,
.manager-hint {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.manager-form span,
.artist-form span,
.manager-hint span {
  font-size: 0.9rem;
  font-weight: 700;
}

.manager-form input,
.manager-form select,
.artist-form input {
  border: 1px solid var(--border-default);
  border-radius: 12px;
  background: var(--input-bg);
  color: var(--input-text);
  padding: 0.8rem 0.95rem;
  font-size: 0.96rem;
}

.manager-form input:disabled,
.manager-form select:disabled,
.artist-form input:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.manager-form-wide {
  grid-column: 1 / -1;
}

.artist-form-wide {
  grid-column: 1 / -1;
}

.manager-hint {
  background: var(--surface-accent);
  border-radius: 16px;
  padding: 0.85rem 1rem;
  color: var(--text-accent);
}

.manager-actions {
  display: flex;
  gap: 0.85rem;
}

.manager-submit,
.manager-reset {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
}

.manager-submit {
  background: var(--gradient-accent);
  color: var(--text-on-accent);
}

.manager-reset {
  background: var(--surface-subtle);
  color: var(--text-primary);
}

.artist-delete {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface-danger);
  color: var(--text-danger);
}

.artist-delete:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.manager-message {
  margin: 0;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  font-weight: 600;
}

.manager-message-success {
  background: var(--surface-success);
  color: var(--text-success);
}

.manager-message-error {
  background: var(--surface-danger);
  color: var(--text-danger);
}

.manager-unavailable {
  margin: 0;
  color: var(--text-tertiary);
}

.artist-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.artist-list-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  border: 1px solid var(--border-accent);
  border-radius: 18px;
  background: var(--surface-card-muted);
  padding: 0.9rem 1rem;
  text-align: left;
  cursor: pointer;
}

.artist-list-item-selected {
  border-color: var(--border-accent-strong);
  box-shadow: var(--shadow-selected);
}

.artist-list-item-name {
  font-weight: 800;
}

.artist-list-item-meta {
  color: var(--text-tertiary);
  font-size: 0.92rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--page-text);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--header-control-border);
  border-top: 4px solid var(--page-text);
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
  color: var(--page-text);
}

.error p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.retry-btn {
  background: var(--header-control-bg-hover);
  color: var(--page-text);
  border: 2px solid var(--page-text);
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--surface-pill);
  color: var(--text-accent-strong);
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

  .header {
    text-align: center;
  }

  .header-top {
    flex-direction: column;
    align-items: center;
  }

  .header-actions {
    width: 100%;
    flex-direction: column-reverse;
    align-items: center;
  }

  .manager-copy {
    flex-direction: column;
  }

  .manager-form {
    grid-template-columns: 1fr;
  }

  .artist-form {
    grid-template-columns: 1fr;
  }

  .manager-actions {
    flex-direction: column;
  }
  
  .header h1 {
    font-size: 2rem;
  }

  .preference-selector {
    width: 100%;
    max-width: 18rem;
  }
  
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
