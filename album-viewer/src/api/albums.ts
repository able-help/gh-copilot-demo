import axios from 'axios'
import type { Album, AlbumWriteInput, Artist, ArtistWriteInput } from '../types/album'

export async function listAlbums(): Promise<Album[]> {
  const response = await axios.get<Album[]>('/albums')
  return response.data
}

export async function listArtists(): Promise<Artist[]> {
  const response = await axios.get<Artist[]>('/artists')
  return response.data
}

export async function createArtist(input: ArtistWriteInput): Promise<Artist> {
  const response = await axios.post<Artist>('/artists', input)
  return response.data
}

export async function updateArtist(id: number, input: ArtistWriteInput): Promise<Artist> {
  const response = await axios.put<Artist>(`/artists/${id}`, input)
  return response.data
}

export async function deleteArtist(id: number): Promise<void> {
  await axios.delete(`/artists/${id}`)
}

export async function createAlbum(input: AlbumWriteInput): Promise<Album> {
  const response = await axios.post<Album>('/albums', input)
  return response.data
}

export async function updateAlbum(id: number, input: AlbumWriteInput): Promise<Album> {
  const response = await axios.put<Album>(`/albums/${id}`, input)
  return response.data
}

export async function deleteAlbum(id: number): Promise<void> {
  await axios.delete(`/albums/${id}`)
}