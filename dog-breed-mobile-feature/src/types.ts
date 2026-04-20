export type DogImageAsset = {
  uri: string
  fileName?: string
  mimeType?: string
  fileSize: number
  width: number
  height: number
}

export type DogBreedCatalog = Record<string, string[]>

export type BreedWeightRange = {
  min: number
  max: number
}

export type BreedLifeRange = {
  min: number
  max: number
}

export type Breed = {
  id: string
  name: string
  description: string
  hypoallergenic: boolean
  life: BreedLifeRange
  maleWeight: BreedWeightRange
  femaleWeight: BreedWeightRange
}

export type BreedCatalogResponse = {
  status: 'success'
  message: Record<string, string[]>
}

export type DogApiBreedResource = {
  id: string
  type: 'breed'
  attributes: {
    name: string
    description: string
    hypoallergenic: boolean
    life: BreedLifeRange
    male_weight: BreedWeightRange
    female_weight: BreedWeightRange
  }
}

export type DogApiBreedsResponse = {
  data: DogApiBreedResource[]
  links?: {
    next?: string | null
  }
}

export type BreedDetectionApiResponse = {
  breed: string
  subBreed?: string
  confidence: number
  modelVersion: string
  requestId: string
}

export type ResolvedBreedDetection = {
  breed: string
  subBreed?: string
  displayName: string
  confidence: number
  modelVersion: string
  requestId: string
}

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>

export type FormDataLike = {
  append(name: string, value: unknown): void
}

export type FormDataFactory = () => FormDataLike
