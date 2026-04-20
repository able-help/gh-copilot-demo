import { seedAlbums } from './data'
import type { Album, AlbumInput, SortBy, SortOrder } from './types'

function cloneAlbum(album: Album): Album {
  return {
    ...album,
    artist: {
      ...album.artist
    }
  }
}

export class AlbumStore {
  private albums: Album[]

  constructor(initialAlbums: Album[] = seedAlbums) {
    this.albums = initialAlbums.map(cloneAlbum)
  }

  reset(initialAlbums: Album[] = seedAlbums): void {
    this.albums = initialAlbums.map(cloneAlbum)
  }

  list(): Album[] {
    return this.albums.map(cloneAlbum)
  }

  getById(id: number): Album | undefined {
    const album = this.albums.find((entry) => entry.id === id)
    return album ? cloneAlbum(album) : undefined
  }

  searchByYear(year: number): Album[] {
    return this.albums.filter((album) => album.year === year).map(cloneAlbum)
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
    const createdAlbum: Album = {
      id: nextId,
      title: input.title,
      artist: {
        ...input.artist
      },
      year: input.year,
      price: input.price,
      image_url: input.image_url
    }

    this.albums.push(createdAlbum)
    return cloneAlbum(createdAlbum)
  }

  update(id: number, input: AlbumInput): Album | undefined {
    const index = this.albums.findIndex((album) => album.id === id)

    if (index === -1) {
      return undefined
    }

    const updatedAlbum: Album = {
      id,
      title: input.title,
      artist: {
        ...input.artist
      },
      year: input.year,
      price: input.price,
      image_url: input.image_url
    }

    this.albums[index] = updatedAlbum
    return cloneAlbum(updatedAlbum)
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