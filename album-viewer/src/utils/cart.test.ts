import { describe, expect, it } from 'vitest'
import {
  addAlbumToCart,
  cartStorageKey,
  clearCart,
  decreaseCartItemQuantity,
  getAlbumQuantity,
  getCartCount,
  getCartGrandTotal,
  getCartItemSubtotal,
  getCartShipping,
  getCartTax,
  getCartTotal,
  increaseCartItemQuantity,
  isAlbumInCart,
  loadCart,
  removeAlbumFromCart,
  saveCart
} from './cart'
import type { Album } from '../types/album'

const album = (id: number, title: string): Album => ({
  id,
  title,
  artist_id: id,
  price: 10 + id,
  image_url: `https://example.com/${id}.jpg`,
  release_date: `202${id % 10}-01-01`,
  created_at: `202${id % 10}-01-02T00:00:00.000Z`,
  year: 2020 + (id % 10),
  artist: {
    id,
    name: `Artist ${id}`,
    genre: 'Test Genre',
    created_at: `202${id % 10}-01-01T00:00:00.000Z`
  }
})

describe('cart utils', () => {
  it('adds a new album to the cart', () => {
    const result = addAlbumToCart([], album(1, 'One'))

    expect(result).toHaveLength(1)
    expect(result[0].album.id).toBe(1)
    expect(result[0].quantity).toBe(1)
  })

  it('increments quantity when adding a duplicate album', () => {
    const existing = addAlbumToCart([], album(1, 'One'))

    const result = addAlbumToCart(existing, album(1, 'One'))

    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(2)
  })

  it('removes an album by id', () => {
    const result = removeAlbumFromCart([
      { album: album(1, 'One'), quantity: 1 },
      { album: album(2, 'Two'), quantity: 1 }
    ], 1)

    expect(result.map((item) => item.album.id)).toEqual([2])
  })

  it('clears all cart items', () => {
    const populatedCart = addAlbumToCart(addAlbumToCart([], album(6, 'Six')), album(7, 'Seven'))

    expect(clearCart()).toEqual([])
    expect(clearCart()).not.toBe(populatedCart)
  })

  it('detects whether an album is in the cart', () => {
    const cart = addAlbumToCart([], album(2, 'Two'))

    expect(isAlbumInCart(cart, 2)).toBe(true)
    expect(isAlbumInCart(cart, 3)).toBe(false)
  })

  it('returns the quantity for a given album', () => {
    const cart = addAlbumToCart(addAlbumToCart([], album(3, 'Three')), album(3, 'Three'))

    expect(getAlbumQuantity(cart, 3)).toBe(2)
    expect(getAlbumQuantity(cart, 99)).toBe(0)
  })

  it('decreases quantity and removes the item at zero', () => {
    const doubled = addAlbumToCart(addAlbumToCart([], album(4, 'Four')), album(4, 'Four'))
    const once = decreaseCartItemQuantity(doubled, 4)
    const gone = decreaseCartItemQuantity(once, 4)

    expect(once[0].quantity).toBe(1)
    expect(gone).toEqual([])
  })

  it('increases quantity for an existing item', () => {
    const cart = increaseCartItemQuantity(addAlbumToCart([], album(5, 'Five')), 5)

    expect(cart[0].quantity).toBe(2)
  })

  it('calculates subtotal, item count, and total', () => {
    const first = addAlbumToCart(addAlbumToCart([], album(1, 'One')), album(1, 'One'))
    const cart = addAlbumToCart(first, album(2, 'Two'))
    const subtotal = getCartTotal(cart)

    expect(getCartItemSubtotal(cart[0])).toBe(22)
    expect(getCartCount(cart)).toBe(3)
    expect(subtotal).toBe(34)
    expect(getCartTax(subtotal)).toBe(2.72)
    expect(getCartShipping(subtotal)).toBe(4.99)
    expect(getCartGrandTotal(subtotal)).toBe(41.71)
  })

  it('loads persisted cart items from storage', () => {
    const storage = {
      getItem: (key: string) => (key === cartStorageKey ? JSON.stringify([{ album: album(4, 'Four'), quantity: 2 }]) : null),
      setItem: () => undefined
    }

    expect(loadCart(storage)).toEqual([{ album: album(4, 'Four'), quantity: 2 }])
  })

  it('migrates legacy persisted cart items with quantities into the joined album shape', () => {
    const storage = {
      getItem: (key: string) => (key === cartStorageKey ? JSON.stringify([
        {
          album: {
            id: 4,
            title: 'Four',
            price: 14,
            image_url: 'https://example.com/4.jpg',
            artist: {
              name: 'Artist 4',
              birthdate: '2000-01-01',
              birthPlace: 'Seattle'
            }
          },
          quantity: 2
        }
      ]) : null),
      setItem: () => undefined
    }

    expect(loadCart(storage)).toEqual([
      {
        album: {
          id: 4,
          title: 'Four',
          artist_id: 0,
          price: 14,
          image_url: 'https://example.com/4.jpg',
          release_date: null,
          created_at: '',
          year: null,
          artist: {
            id: 0,
            name: 'Artist 4',
            genre: null,
            created_at: ''
          }
        },
        quantity: 2
      }
    ])
  })

  it('migrates legacy persisted album arrays into quantity-based items', () => {
    const storage = {
      getItem: (key: string) => (key === cartStorageKey ? JSON.stringify([
        {
          id: 4,
          title: 'Four',
          price: 14,
          image_url: 'https://example.com/4.jpg',
          artist: {
            name: 'Artist 4',
            birthdate: '2000-01-01',
            birthPlace: 'Seattle'
          }
        }
      ]) : null),
      setItem: () => undefined
    }

    expect(loadCart(storage)).toEqual([
      {
        album: {
          id: 4,
          title: 'Four',
          artist_id: 0,
          price: 14,
          image_url: 'https://example.com/4.jpg',
          release_date: null,
          created_at: '',
          year: null,
          artist: {
            id: 0,
            name: 'Artist 4',
            genre: null,
            created_at: ''
          }
        },
        quantity: 1
      }
    ])
  })

  it('returns an empty cart when persisted data is invalid', () => {
    const storage = {
      getItem: () => '{bad json',
      setItem: () => undefined
    }

    expect(loadCart(storage)).toEqual([])
  })

  it('saves the cart to storage', () => {
    const writes: Array<{ key: string; value: string }> = []
    const storage = {
      getItem: () => null,
      setItem: (key: string, value: string) => {
        writes.push({ key, value })
      }
    }

    saveCart(storage, [{ album: album(5, 'Five'), quantity: 3 }])

    expect(writes).toEqual([
      {
        key: cartStorageKey,
        value: JSON.stringify([{ album: album(5, 'Five'), quantity: 3 }])
      }
    ])
  })
})