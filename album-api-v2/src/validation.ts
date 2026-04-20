import type { AlbumInput } from './types'

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

  if (!isPlainObject(value.artist)) {
    return { error: 'Artist is required.' }
  }

  if (!hasNonEmptyText(value.artist.name)) {
    return { error: 'Artist.Name is required.' }
  }

  if (!isValidDateOnly(value.artist.birthdate)) {
    return { error: 'Artist.Birthdate is required.' }
  }

  if (!hasNonEmptyText(value.artist.birthPlace)) {
    return { error: 'Artist.BirthPlace is required.' }
  }

  if (typeof value.year !== 'number' || !Number.isInteger(value.year) || value.year <= 0) {
    return { error: 'Year must be greater than 0.' }
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
      artist: {
        name: value.artist.name.trim(),
        birthdate: value.artist.birthdate.trim(),
        birthPlace: value.artist.birthPlace.trim()
      },
      year: value.year,
      price: value.price,
      image_url: value.image_url.trim()
    }
  }
}