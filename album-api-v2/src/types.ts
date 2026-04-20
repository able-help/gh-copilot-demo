export interface Artist {
  id: number
  name: string
  genre: string | null
  created_at: string
}

export interface Album {
  id: number
  title: string
  artist_id: number
  artist: Artist
  price: number
  image_url: string
  release_date: string | null
  created_at: string
  year: number | null
}

export interface ArtistRecord {
  id: number
  name: string
  genre: string | null
  created_at: string
}

export interface ArtistInput {
  name: string
  genre: string | null
}

export interface AlbumRecord {
  id: number
  title: string
  artist_id: number
  price: number
  image_url: string
  release_date: string | null
  created_at: string
}

export interface AlbumInput {
  title: string
  artist_id: number
  price: number
  image_url: string
  release_date: string | null
}

export type SortBy = 'title' | 'artist' | 'price'
export type SortOrder = 'asc' | 'desc'