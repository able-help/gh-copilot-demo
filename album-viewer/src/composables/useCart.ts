import { ref, computed } from 'vue'
import type { Album } from '../types/album'

const cartItems = ref<Album[]>([])

export function useCart() {
  const cartCount = computed(() => cartItems.value.length)

  const isInCart = (albumId: number): boolean =>
    cartItems.value.some((a) => a.id === albumId)

  const addToCart = (album: Album): void => {
    if (!isInCart(album.id)) {
      cartItems.value = [...cartItems.value, album]
    }
  }

  const removeFromCart = (albumId: number): void => {
    cartItems.value = cartItems.value.filter((a) => a.id !== albumId)
  }

  const clearCart = (): void => {
    cartItems.value = []
  }

  return { cartItems, cartCount, isInCart, addToCart, removeFromCart, clearCart }
}
