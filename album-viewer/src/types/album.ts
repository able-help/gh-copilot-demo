export interface Artist {
  id: number
  name: string
  genre: string | null
  created_at: string
}

export interface ArtistWriteInput {
  name: string
  genre: string | null
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

export interface AlbumWriteInput {
  title: string
  artist_id: number
  price: number
  image_url: string
  release_date: string | null
}
