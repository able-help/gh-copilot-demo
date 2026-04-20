import type { DetectionEndpointConfig } from './config'
import { DogBreedFeatureError } from './errors'
import { assertSecureEndpoint, sanitizeFileName } from './security'
import type { BreedDetectionApiResponse, DogImageAsset, FetchLike, FormDataFactory, FormDataLike } from './types'

function isBreedDetectionApiResponse(value: unknown): value is BreedDetectionApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Partial<BreedDetectionApiResponse>
  return (
    typeof candidate.breed === 'string' &&
    (candidate.subBreed === undefined || typeof candidate.subBreed === 'string') &&
    typeof candidate.confidence === 'number' &&
    candidate.confidence >= 0 &&
    candidate.confidence <= 1 &&
    typeof candidate.modelVersion === 'string' &&
    typeof candidate.requestId === 'string'
  )
}

function buildMultipartBody(asset: DogImageAsset, createFormData: FormDataFactory): FormDataLike {
  const body = createFormData()

  body.append('image', {
    uri: asset.uri,
    name: sanitizeFileName(asset.fileName),
    type: asset.mimeType
  })
  body.append('fileSize', String(asset.fileSize))
  body.append('width', String(asset.width))
  body.append('height', String(asset.height))

  return body
}

export async function requestBreedDetection(params: {
  asset: DogImageAsset
  endpoint: DetectionEndpointConfig
  fetchImpl: FetchLike
  formDataFactory: FormDataFactory
}): Promise<BreedDetectionApiResponse> {
  const endpointUrl = assertSecureEndpoint(params.endpoint)
  const response = await params.fetchImpl(endpointUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: buildMultipartBody(params.asset, params.formDataFactory) as BodyInit
  })

  if (!response.ok) {
    throw new DogBreedFeatureError('breed_detection_failed', `Breed detection failed with status ${response.status}.`)
  }

  const payload: unknown = await response.json()
  if (!isBreedDetectionApiResponse(payload)) {
    throw new DogBreedFeatureError('breed_detection_invalid', 'Breed detection service returned an unexpected response schema.')
  }

  return payload
}
