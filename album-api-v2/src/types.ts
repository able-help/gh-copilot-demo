export interface Artist {
  name: string
  birthdate: string
  birthPlace: string
}

export interface Album {
  id: number
  title: string
  artist: Artist
  year: number
  price: number
  image_url: string
}

export interface ArtistInput {
  name: string
  birthdate: string
  birthPlace: string
}

export interface AlbumInput {
  title: string
  artist: ArtistInput
  year: number
  price: number
  image_url: string
}

export type SortBy = 'title' | 'artist' | 'price'
export type SortOrder = 'asc' | 'desc'