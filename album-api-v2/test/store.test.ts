import { beforeEach, describe, expect, it } from 'vitest'
import { seedAlbums } from '../src/data'
import { AlbumStore } from '../src/store'

describe('AlbumStore', () => {
  let store: AlbumStore

  beforeEach(() => {
    store = new AlbumStore(seedAlbums)
  })

  it('returns the seeded albums', () => {
    const albums = store.list()

    expect(albums).toHaveLength(6)
    expect(albums[0]?.title).toBe('You, Me and an App Id')
  })

  it('creates a new album with the next id', () => {
    const created = store.create({
      title: 'New Album',
      artist: {
        name: 'New Artist',
        birthdate: '2000-01-01',
        birthPlace: 'Paris, France'
      },
      year: 2030,
      price: 19.99,
      image_url: 'https://example.com/new.png'
    })

    expect(created.id).toBe(7)
    expect(store.getById(7)?.title).toBe('New Album')
  })

  it('updates an existing album', () => {
    const updated = store.update(1, {
      title: 'Updated Album',
      artist: {
        name: 'Updated Artist',
        birthdate: '2001-01-01',
        birthPlace: 'Rome, Italy'
      },
      year: 2031,
      price: 17.5,
      image_url: 'https://example.com/updated.png'
    })

    expect(updated?.title).toBe('Updated Album')
    expect(store.getById(1)?.artist.name).toBe('Updated Artist')
  })

  it('deletes an album by id', () => {
    expect(store.delete(1)).toBe(true)
    expect(store.getById(1)).toBeUndefined()
  })

  it('filters by year', () => {
    const albums = store.searchByYear(2024)

    expect(albums).toHaveLength(1)
    expect(albums[0]?.title).toBe('Scale It Up')
  })

  it('sorts by price descending', () => {
    const albums = store.listSorted('price', 'desc')

    expect(albums[0]?.price).toBeGreaterThanOrEqual(albums[1]?.price ?? 0)
    expect(albums[0]?.title).toBe("Sweet Container O' Mine")
  })
})