import { dogApiBaseUrl } from './config'
import { DogBreedFeatureError } from './errors'
import type { Breed, DogApiBreedResource, DogApiBreedsResponse, FetchLike } from './types'

function isRange(value: unknown): value is { min: number; max: number } {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { min?: unknown; max?: unknown }
  return typeof candidate.min === 'number' && typeof candidate.max === 'number'
}

function isDogApiBreedResource(value: unknown): value is DogApiBreedResource {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<DogApiBreedResource>
  return (
    typeof candidate.id === 'string' &&
    candidate.type === 'breed' &&
    typeof candidate.attributes?.name === 'string' &&
    typeof candidate.attributes.description === 'string' &&
    typeof candidate.attributes.hypoallergenic === 'boolean' &&
    isRange(candidate.attributes.life) &&
    isRange(candidate.attributes.male_weight) &&
    isRange(candidate.attributes.female_weight)
  )
}

function isDogApiBreedsResponse(value: unknown): value is DogApiBreedsResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<DogApiBreedsResponse>
  const hasValidLinks =
    candidate.links === undefined ||
    (typeof candidate.links === 'object' &&
      candidate.links !== null &&
      (candidate.links.next === undefined || candidate.links.next === null || typeof candidate.links.next === 'string'))

  return Array.isArray(candidate.data) && candidate.data.every(isDogApiBreedResource) && hasValidLinks
}

function toBreed(resource: DogApiBreedResource): Breed {
  return {
    id: resource.id,
    name: resource.attributes.name,
    description: resource.attributes.description,
    hypoallergenic: resource.attributes.hypoallergenic,
    life: resource.attributes.life,
    maleWeight: resource.attributes.male_weight,
    femaleWeight: resource.attributes.female_weight
  }
}

export async function fetchAllBreeds(
  fetchImpl: FetchLike,
  options?: {
    baseUrl?: string
    pageSize?: number
  }
): Promise<Breed[]> {
  const baseUrl = options?.baseUrl ?? dogApiBaseUrl
  const pageSize = options?.pageSize ?? 1000

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 1000) {
    throw new DogBreedFeatureError('breed_list_invalid_page_size', 'Dog API page size must be an integer between 1 and 1000.')
  }

  const breeds: Breed[] = []
  let nextUrl: string | null = `${baseUrl}/breeds?page[number]=1&page[size]=${pageSize}`

  while (nextUrl) {
    const response = await fetchImpl(nextUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new DogBreedFeatureError('breed_list_failed', `Dog API request failed with status ${response.status}.`)
    }

    const payload: unknown = await response.json()
    if (!isDogApiBreedsResponse(payload)) {
      throw new DogBreedFeatureError('breed_list_invalid', 'Dog API returned an unexpected breed response schema.')
    }

    breeds.push(...payload.data.map(toBreed))
    nextUrl = payload.links?.next ?? null
  }

  return breeds
}