import type { Album } from './types'

export const seedAlbums: Album[] = [
  {
    id: 1,
    title: 'You, Me and an App Id',
    artist: {
      name: 'Daprize',
      birthdate: '1998-04-12',
      birthPlace: 'Seattle, USA'
    },
    year: 2026,
    price: 10.99,
    image_url: 'https://aka.ms/albums-daprlogo'
  },
  {
    id: 2,
    title: 'Seven Revision Army',
    artist: {
      name: 'The Blue-Green Stripes',
      birthdate: '1996-09-08',
      birthPlace: 'Austin, USA'
    },
    year: 2025,
    price: 13.99,
    image_url: 'https://aka.ms/albums-containerappslogo'
  },
  {
    id: 3,
    title: 'Scale It Up',
    artist: {
      name: 'KEDA Club',
      birthdate: '1994-01-21',
      birthPlace: 'London, UK'
    },
    year: 2024,
    price: 13.99,
    image_url: 'https://aka.ms/albums-kedalogo'
  },
  {
    id: 4,
    title: 'Lost in Translation',
    artist: {
      name: 'MegaDNS',
      birthdate: '1992-07-17',
      birthPlace: 'Dublin, Ireland'
    },
    year: 2023,
    price: 12.99,
    image_url: 'https://aka.ms/albums-envoylogo'
  },
  {
    id: 5,
    title: 'Lock Down Your Love',
    artist: {
      name: 'V is for VNET',
      birthdate: '1990-03-02',
      birthPlace: 'Toronto, Canada'
    },
    year: 2022,
    price: 12.99,
    image_url: 'https://aka.ms/albums-vnetlogo'
  },
  {
    id: 6,
    title: "Sweet Container O' Mine",
    artist: {
      name: 'Guns N Probeses',
      birthdate: '1989-11-30',
      birthPlace: 'Berlin, Germany'
    },
    year: 2021,
    price: 14.99,
    image_url: 'https://aka.ms/albums-containerappslogo'
  }
]