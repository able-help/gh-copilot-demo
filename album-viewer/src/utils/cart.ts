import type { Album } from '../types/album'

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export type CartItem = {
  album: Album
  quantity: number
}

export const cartStorageKey = 'album-viewer-cart'
export const checkoutTaxRate = 0.08
export const checkoutShippingFee = 4.99

function isAlbum(value: unknown): value is Album {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<Album>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.artist_id === 'number' &&
    typeof candidate.price === 'number' &&
    typeof candidate.image_url === 'string' &&
    (candidate.release_date === null || typeof candidate.release_date === 'string') &&
    typeof candidate.created_at === 'string' &&
    typeof candidate.artist?.name === 'string' &&
    typeof candidate.artist?.id === 'number' &&
    (candidate.artist.genre === null || typeof candidate.artist.genre === 'string') &&
    typeof candidate.artist.created_at === 'string'
  )
}

function isLegacyAlbum(value: unknown): value is {
  id: number
  title: string
  price: number
  image_url: string
  artist: {
    name: string
    birthdate: string
    birthPlace: string
  }
} {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as {
    id?: unknown
    title?: unknown
    price?: unknown
    image_url?: unknown
    artist?: {
      name?: unknown
      birthdate?: unknown
      birthPlace?: unknown
    }
  }

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.title === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.image_url === 'string' &&
    typeof candidate.artist?.name === 'string' &&
    typeof candidate.artist.birthdate === 'string' &&
    typeof candidate.artist.birthPlace === 'string'
  )
}

function toAlbum(value: Album | ReturnType<typeof normalizeLegacyAlbum>): Album {
  return value
}

function normalizeLegacyAlbum(value: {
  id: number
  title: string
  price: number
  image_url: string
  artist: {
    name: string
    birthdate: string
    birthPlace: string
  }
}): Album {
  return {
    id: value.id,
    title: value.title,
    artist_id: 0,
    artist: {
      id: 0,
      name: value.artist.name,
      genre: null,
      created_at: ''
    },
    price: value.price,
    image_url: value.image_url,
    release_date: null,
    created_at: '',
    year: null
  }
}

function normalizeAlbum(value: unknown): Album | undefined {
  if (isAlbum(value)) {
    return toAlbum(value)
  }

  if (isLegacyAlbum(value)) {
    return normalizeLegacyAlbum(value)
  }

  return undefined
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<CartItem>
  return isAlbum(candidate.album) && typeof candidate.quantity === 'number' && candidate.quantity > 0
}

function isCartItemLike(value: unknown): value is { album: unknown; quantity: number } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { album?: unknown; quantity?: unknown }
  return 'album' in candidate && typeof candidate.quantity === 'number' && candidate.quantity > 0
}

function normalizeCartItem(value: unknown): CartItem | undefined {
  if (!isCartItemLike(value)) {
    return undefined
  }

  const album = normalizeAlbum(value.album)
  if (!album) {
    return undefined
  }

  return {
    album,
    quantity: value.quantity
  }
}

export function addAlbumToCart(cart: CartItem[], album: Album): CartItem[] {
  const existingItem = cart.find((item) => item.album.id === album.id)

  if (existingItem) {
    return cart.map((item) =>
      item.album.id === album.id ? { ...item, quantity: item.quantity + 1 } : item
    )
  }

  return [...cart, { album, quantity: 1 }]
}

export function removeAlbumFromCart(cart: CartItem[], albumId: number): CartItem[] {
  return cart.filter((item) => item.album.id !== albumId)
}

export function clearCart(): CartItem[] {
  return []
}

export function isAlbumInCart(cart: CartItem[], albumId: number): boolean {
  return cart.some((item) => item.album.id === albumId)
}

export function getAlbumQuantity(cart: CartItem[], albumId: number): number {
  return cart.find((item) => item.album.id === albumId)?.quantity ?? 0
}

export function increaseCartItemQuantity(cart: CartItem[], albumId: number): CartItem[] {
  return cart.map((item) =>
    item.album.id === albumId ? { ...item, quantity: item.quantity + 1 } : item
  )
}

export function decreaseCartItemQuantity(cart: CartItem[], albumId: number): CartItem[] {
  return cart.flatMap((item) => {
    if (item.album.id !== albumId) {
      return [item]
    }

    if (item.quantity <= 1) {
      return []
    }

    return [{ ...item, quantity: item.quantity - 1 }]
  })
}

export function getCartItemSubtotal(item: CartItem): number {
  return item.album.price * item.quantity
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0)
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + getCartItemSubtotal(item), 0)
}

export function getCartTax(subtotal: number): number {
  return Number((subtotal * checkoutTaxRate).toFixed(2))
}

export function getCartShipping(subtotal: number): number {
  return subtotal > 0 ? checkoutShippingFee : 0
}

export function getCartGrandTotal(subtotal: number): number {
  return Number((subtotal + getCartTax(subtotal) + getCartShipping(subtotal)).toFixed(2))
}

export function loadCart(storage?: StorageLike | null): CartItem[] {
  if (!storage) {
    return []
  }

  const rawCart = storage.getItem(cartStorageKey)
  if (!rawCart) {
    return []
  }

  try {
    const parsed = JSON.parse(rawCart)
    if (!Array.isArray(parsed)) {
      return []
    }

    const normalizedCartItems = parsed.map(normalizeCartItem)
    if (normalizedCartItems.every((item): item is CartItem => item !== undefined)) {
      return normalizedCartItems
    }

    const normalizedAlbums = parsed.map(normalizeAlbum)
    if (normalizedAlbums.every((album): album is Album => album !== undefined)) {
      return normalizedAlbums.map((album) => ({ album, quantity: 1 }))
    }

    return []
  } catch {
    return []
  }
}

export function saveCart(storage: StorageLike | null | undefined, cart: CartItem[]): void {
  if (!storage) {
    return
  }

  storage.setItem(cartStorageKey, JSON.stringify(cart))
}