import { seedAlbums, seedArtists } from './data'
import type { Album, AlbumInput, AlbumRecord, Artist, ArtistInput, ArtistRecord, SortBy, SortOrder } from './types'

function cloneArtist(artist: ArtistRecord): Artist {
  return {
    ...artist
  }
}

function cloneAlbumRecord(album: AlbumRecord): AlbumRecord {
  return {
    ...album
  }
}

function deriveYear(releaseDate: string | null): number | null {
  if (!releaseDate) {
    return null
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10)
  return Number.isInteger(year) ? year : null
}

export class AlbumStore {
  private albums: AlbumRecord[]
  private artists: ArtistRecord[]

  constructor(initialAlbums: AlbumRecord[] = seedAlbums, initialArtists: ArtistRecord[] = seedArtists) {
    this.albums = initialAlbums.map(cloneAlbumRecord)
    this.artists = initialArtists.map(cloneArtist)
  }

  reset(initialAlbums: AlbumRecord[] = seedAlbums, initialArtists: ArtistRecord[] = seedArtists): void {
    this.albums = initialAlbums.map(cloneAlbumRecord)
    this.artists = initialArtists.map(cloneArtist)
  }

  hasArtist(id: number): boolean {
    return this.artists.some((artist) => artist.id === id)
  }

  getArtistById(id: number): Artist | undefined {
    const artist = this.artists.find((entry) => entry.id === id)
    return artist ? cloneArtist(artist) : undefined
  }

  listArtists(): Artist[] {
    return this.artists.map(cloneArtist)
  }

  createArtist(input: ArtistInput): Artist {
    const nextId = this.artists.reduce((maxId, artist) => Math.max(maxId, artist.id), 0) + 1
    const createdArtist: ArtistRecord = {
      id: nextId,
      name: input.name,
      genre: input.genre,
      created_at: new Date().toISOString()
    }

    this.artists.push(createdArtist)
    return cloneArtist(createdArtist)
  }

  updateArtist(id: number, input: ArtistInput): Artist | undefined {
    const index = this.artists.findIndex((artist) => artist.id === id)

    if (index === -1) {
      return undefined
    }

    const updatedArtist: ArtistRecord = {
      id,
      name: input.name,
      genre: input.genre,
      created_at: this.artists[index].created_at
    }

    this.artists[index] = updatedArtist
    return cloneArtist(updatedArtist)
  }

  deleteArtist(id: number): { deleted: boolean; reason?: 'in-use' | 'missing' } {
    const index = this.artists.findIndex((artist) => artist.id === id)

    if (index === -1) {
      return { deleted: false, reason: 'missing' }
    }

    if (this.albums.some((album) => album.artist_id === id)) {
      return { deleted: false, reason: 'in-use' }
    }

    this.artists.splice(index, 1)
    return { deleted: true }
  }

  private joinAlbum(record: AlbumRecord): Album {
    const artist = this.artists.find((entry) => entry.id === record.artist_id)

    if (!artist) {
      throw new Error(`Album ${record.id} references missing artist ${record.artist_id}.`)
    }

    return {
      ...record,
      artist: cloneArtist(artist),
      year: deriveYear(record.release_date)
    }
  }

  list(): Album[] {
    return this.albums.map((album) => this.joinAlbum(album))
  }

  getById(id: number): Album | undefined {
    const album = this.albums.find((entry) => entry.id === id)
    return album ? this.joinAlbum(album) : undefined
  }

  searchByYear(year: number): Album[] {
    return this.albums.filter((album) => deriveYear(album.release_date) === year).map((album) => this.joinAlbum(album))
  }

  listSorted(sortBy: SortBy, order: SortOrder): Album[] {
    const sorted = this.list().sort((left, right) => {
      switch (sortBy) {
        case 'title':
          return left.title.localeCompare(right.title)
        case 'artist':
          return left.artist.name.localeCompare(right.artist.name)
        case 'price':
          return left.price - right.price
      }
    })

    return order === 'desc' ? sorted.reverse() : sorted
  }

  create(input: AlbumInput): Album {
    const nextId = this.albums.reduce((maxId, album) => Math.max(maxId, album.id), 0) + 1
    const createdAlbum: AlbumRecord = {
      id: nextId,
      title: input.title,
      artist_id: input.artist_id,
      price: input.price,
      image_url: input.image_url,
      release_date: input.release_date,
      created_at: new Date().toISOString()
    }

    this.albums.push(createdAlbum)
    return this.joinAlbum(createdAlbum)
  }

  update(id: number, input: AlbumInput): Album | undefined {
    const index = this.albums.findIndex((album) => album.id === id)

    if (index === -1) {
      return undefined
    }

    const updatedAlbum: AlbumRecord = {
      id,
      title: input.title,
      artist_id: input.artist_id,
      price: input.price,
      image_url: input.image_url,
      release_date: input.release_date,
      created_at: this.albums[index].created_at
    }

    this.albums[index] = updatedAlbum
    return this.joinAlbum(updatedAlbum)
  }

  delete(id: number): boolean {
    const index = this.albums.findIndex((album) => album.id === id)

    if (index === -1) {
      return false
    }

    this.albums.splice(index, 1)
    return true
  }
}

export const albumStore = new AlbumStore()