import { dogCeoBaseUrl } from './config'
import { DogBreedFeatureError } from './errors'
import type { BreedCatalogResponse, DogBreedCatalog, FetchLike } from './types'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isBreedCatalogResponse(value: unknown): value is BreedCatalogResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<BreedCatalogResponse>
  return (
    candidate.status === 'success' &&
    typeof candidate.message === 'object' &&
    candidate.message !== null &&
    Object.values(candidate.message).every(isStringArray)
  )
}

export function normalizeBreedName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-')
}

export function toDisplayBreedName(breed: string, subBreed?: string): string {
  const pieces = [subBreed, breed]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '))

  return pieces.join(' ')
}

export function isKnownBreed(catalog: DogBreedCatalog, breed: string, subBreed?: string): boolean {
  const normalizedBreed = normalizeBreedName(breed)
  const normalizedSubBreed = subBreed ? normalizeBreedName(subBreed) : undefined
  const subBreeds = catalog[normalizedBreed]

  if (!subBreeds) {
    return false
  }

  if (!normalizedSubBreed) {
    return true
  }

  return subBreeds.includes(normalizedSubBreed)
}

export async function fetchBreedCatalog(
  fetchImpl: FetchLike,
  baseUrl = dogCeoBaseUrl
): Promise<DogBreedCatalog> {
  const response = await fetchImpl(`${baseUrl}/breeds/list/all`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new DogBreedFeatureError('breed_catalog_failed', `Dog CEO request failed with status ${response.status}.`)
  }

  const payload: unknown = await response.json()
  if (!isBreedCatalogResponse(payload)) {
    throw new DogBreedFeatureError('breed_catalog_invalid', 'Dog CEO returned an unexpected response schema.')
  }

  return Object.fromEntries(
    Object.entries(payload.message).map(([breed, subBreeds]) => [normalizeBreedName(breed), subBreeds.map(normalizeBreedName)])
  )
}
