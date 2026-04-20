import type { AlbumInput, ArtistInput } from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return false
  }

  const normalized = value.trim()
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const candidate = new Date(Date.UTC(year, month - 1, day))

  return candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day
}

export function validateAlbumInput(value: unknown): { error?: string; data?: AlbumInput } {
  if (!isPlainObject(value)) {
    return { error: 'Request body must be a JSON object.' }
  }

  if (!hasNonEmptyText(value.title)) {
    return { error: 'Title is required.' }
  }

  if (typeof value.artist_id !== 'number' || !Number.isInteger(value.artist_id) || value.artist_id <= 0) {
    return { error: 'Artist_id must be greater than 0.' }
  }

  if (value.release_date !== undefined && value.release_date !== null && !isValidDateOnly(value.release_date)) {
    return { error: 'Release_date must be a valid YYYY-MM-DD date or null.' }
  }

  if (typeof value.price !== 'number' || Number.isNaN(value.price) || value.price < 0) {
    return { error: 'Price cannot be negative.' }
  }

  if (!hasNonEmptyText(value.image_url)) {
    return { error: 'Image_url is required.' }
  }

  return {
    data: {
      title: value.title.trim(),
      artist_id: value.artist_id,
      price: value.price,
      image_url: value.image_url.trim(),
      release_date: typeof value.release_date === 'string' ? value.release_date.trim() : null
    }
  }
}

export function validateArtistInput(value: unknown): { error?: string; data?: ArtistInput } {
  if (!isPlainObject(value)) {
    return { error: 'Request body must be a JSON object.' }
  }

  if (!hasNonEmptyText(value.name)) {
    return { error: 'Name is required.' }
  }

  if (value.genre !== undefined && value.genre !== null && typeof value.genre !== 'string') {
    return { error: 'Genre must be a string or null.' }
  }

  const normalizedGenre = typeof value.genre === 'string' ? value.genre.trim() : null

  return {
    data: {
      name: value.name.trim(),
      genre: normalizedGenre && normalizedGenre.length > 0 ? normalizedGenre : null
    }
  }
}