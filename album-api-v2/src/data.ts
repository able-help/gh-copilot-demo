import type { AlbumRecord, ArtistRecord } from './types'

export const seedArtists: ArtistRecord[] = [
  {
    id: 1,
    name: 'Daprize',
    genre: 'Cloud Native Pop',
    created_at: '2024-01-12T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'The Blue-Green Stripes',
    genre: 'Deployment Rock',
    created_at: '2024-02-15T00:00:00.000Z'
  },
  {
    id: 3,
    name: 'KEDA Club',
    genre: 'Autoscaling Electronica',
    created_at: '2024-03-20T00:00:00.000Z'
  },
  {
    id: 4,
    name: 'MegaDNS',
    genre: 'Distributed Ambient',
    created_at: '2024-04-18T00:00:00.000Z'
  },
  {
    id: 5,
    name: 'V is for VNET',
    genre: 'Network Ballads',
    created_at: '2024-05-10T00:00:00.000Z'
  },
  {
    id: 6,
    name: 'Guns N Probeses',
    genre: 'Container Metal',
    created_at: '2024-06-05T00:00:00.000Z'
  }
]

export const seedAlbums: AlbumRecord[] = [
  {
    id: 1,
    title: 'You, Me and an App Id',
    artist_id: 1,
    price: 10.99,
    image_url: 'https://aka.ms/albums-daprlogo',
    release_date: '2026-01-12',
    created_at: '2026-01-13T00:00:00.000Z'
  },
  {
    id: 2,
    title: 'Seven Revision Army',
    artist_id: 2,
    price: 13.99,
    image_url: 'https://aka.ms/albums-containerappslogo',
    release_date: '2025-02-14',
    created_at: '2025-02-15T00:00:00.000Z'
  },
  {
    id: 3,
    title: 'Scale It Up',
    artist_id: 3,
    price: 13.99,
    image_url: 'https://aka.ms/albums-kedalogo',
    release_date: '2024-03-18',
    created_at: '2024-03-19T00:00:00.000Z'
  },
  {
    id: 4,
    title: 'Lost in Translation',
    artist_id: 4,
    price: 12.99,
    image_url: 'https://aka.ms/albums-envoylogo',
    release_date: '2023-04-09',
    created_at: '2023-04-10T00:00:00.000Z'
  },
  {
    id: 5,
    title: 'Lock Down Your Love',
    artist_id: 5,
    price: 12.99,
    image_url: 'https://aka.ms/albums-vnetlogo',
    release_date: '2022-05-06',
    created_at: '2022-05-07T00:00:00.000Z'
  },
  {
    id: 6,
    title: "Sweet Container O' Mine",
    artist_id: 6,
    price: 14.99,
    image_url: 'https://aka.ms/albums-containerappslogo',
    release_date: '2021-06-11',
    created_at: '2021-06-12T00:00:00.000Z'
  }
]