import { describe, it, expect, beforeEach } from 'vitest'
import { useCart } from '../../composables/useCart'
import type { Album } from '../../types/album'

const makeAlbum = (id: number): Album => ({
  id,
  title: `Album ${id}`,
  artist: { name: `Artist ${id}`, birthdate: '1980-01-01', birthPlace: 'City' },
  price: 9.99,
  image_url: 'https://example.com/image.jpg',
})

describe('useCart', () => {
  let cart: ReturnType<typeof useCart>

  beforeEach(() => {
    // Reset cart by clearing it before each test
    cart = useCart()
    cart.clearCart()
  })

  it('starts with an empty cart', () => {
    expect(cart.cartItems.value).toHaveLength(0)
    expect(cart.cartCount.value).toBe(0)
  })

  it('adds an album to the cart', () => {
    const album = makeAlbum(1)
    cart.addToCart(album)
    expect(cart.cartItems.value).toHaveLength(1)
    expect(cart.cartCount.value).toBe(1)
    expect(cart.cartItems.value[0]).toEqual(album)
  })

  it('does not add a duplicate album', () => {
    const album = makeAlbum(1)
    cart.addToCart(album)
    cart.addToCart(album)
    expect(cart.cartItems.value).toHaveLength(1)
    expect(cart.cartCount.value).toBe(1)
  })

  it('reports isInCart correctly', () => {
    const album = makeAlbum(2)
    expect(cart.isInCart(album.id)).toBe(false)
    cart.addToCart(album)
    expect(cart.isInCart(album.id)).toBe(true)
  })

  it('removes an album from the cart', () => {
    const album1 = makeAlbum(1)
    const album2 = makeAlbum(2)
    cart.addToCart(album1)
    cart.addToCart(album2)
    expect(cart.cartCount.value).toBe(2)
    cart.removeFromCart(album1.id)
    expect(cart.cartCount.value).toBe(1)
    expect(cart.isInCart(album1.id)).toBe(false)
    expect(cart.isInCart(album2.id)).toBe(true)
  })

  it('updates cart count when removing an album', () => {
    const album = makeAlbum(3)
    cart.addToCart(album)
    expect(cart.cartCount.value).toBe(1)
    cart.removeFromCart(album.id)
    expect(cart.cartCount.value).toBe(0)
  })

  it('clears the cart', () => {
    cart.addToCart(makeAlbum(1))
    cart.addToCart(makeAlbum(2))
    cart.clearCart()
    expect(cart.cartItems.value).toHaveLength(0)
    expect(cart.cartCount.value).toBe(0)
  })

  it('handles removing a non-existent album gracefully', () => {
    cart.addToCart(makeAlbum(1))
    cart.removeFromCart(999)
    expect(cart.cartCount.value).toBe(1)
  })
})
