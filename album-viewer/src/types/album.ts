export interface Artist {
  name: string
  birthdate: string
  birthPlace: string
}

export interface Album {
  id: number
  title: string
  artist: Artist
  price: number
  image_url: string
}
