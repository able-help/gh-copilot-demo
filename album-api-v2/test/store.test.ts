import { beforeEach, describe, expect, it } from 'vitest'
import { seedAlbums, seedArtists } from '../src/data'
import { AlbumStore } from '../src/store'

describe('AlbumStore', () => {
  let store: AlbumStore

  beforeEach(() => {
    store = new AlbumStore(seedAlbums, seedArtists)
  })

  it('returns the seeded albums', () => {
    const albums = store.list()

    expect(albums).toHaveLength(6)
    expect(albums[0]?.title).toBe('You, Me and an App Id')
  })

  it('creates a new album with the next id', () => {
    const created = store.create({
      title: 'New Album',
      artist_id: 2,
      price: 19.99,
      image_url: 'https://example.com/new.png',
      release_date: '2030-09-01'
    })

    expect(created.id).toBe(7)
    expect(store.getById(7)?.title).toBe('New Album')
    expect(store.getById(7)?.artist.name).toBe('The Blue-Green Stripes')
  })

  it('updates an existing album', () => {
    const updated = store.update(1, {
      title: 'Updated Album',
      artist_id: 3,
      price: 17.5,
      image_url: 'https://example.com/updated.png',
      release_date: '2031-10-03'
    })

    expect(updated?.title).toBe('Updated Album')
    expect(store.getById(1)?.artist.name).toBe('KEDA Club')
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

  it('lists normalized artists for joining', () => {
    const artists = store.listArtists()

    expect(artists[0]).toMatchObject({
      id: 1,
      name: 'Daprize',
      genre: 'Cloud Native Pop'
    })
  })

  it('creates an artist with the next id', () => {
    const created = store.createArtist({
      name: 'Release Notes',
      genre: 'Docs Rock'
    })

    expect(created.id).toBe(7)
    expect(store.getArtistById(7)?.name).toBe('Release Notes')
  })

  it('updates an existing artist', () => {
    const updated = store.updateArtist(1, {
      name: 'Daprize Deluxe',
      genre: 'Cloud Native Pop'
    })

    expect(updated?.name).toBe('Daprize Deluxe')
    expect(store.getById(1)?.artist.name).toBe('Daprize Deluxe')
  })

  it('prevents deleting artists that are still referenced by albums', () => {
    const result = store.deleteArtist(1)

    expect(result).toEqual({ deleted: false, reason: 'in-use' })
  })

  it('deletes an artist when no albums reference it', () => {
    const created = store.createArtist({
      name: 'Release Notes',
      genre: null
    })

    expect(store.deleteArtist(created.id)).toEqual({ deleted: true })
    expect(store.getArtistById(created.id)).toBeUndefined()
  })
})