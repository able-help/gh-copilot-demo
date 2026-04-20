import { defaultSecurityPolicy, type DetectionEndpointConfig, type DogBreedSecurityPolicy } from './config'
import { fetchBreedCatalog, isKnownBreed, normalizeBreedName, toDisplayBreedName } from './dogCeoClient'
import { requestBreedDetection } from './breedDetectionClient'
import { DogBreedFeatureError } from './errors'
import { validateDogImageAsset } from './security'
import type {
  DogBreedCatalog,
  DogImageAsset,
  FetchLike,
  FormDataFactory,
  ResolvedBreedDetection
} from './types'

export async function identifyDogBreed(params: {
  asset: DogImageAsset
  endpoint: DetectionEndpointConfig
  fetchImpl: FetchLike
  formDataFactory: FormDataFactory
  breedCatalog?: DogBreedCatalog
  policy?: DogBreedSecurityPolicy
}): Promise<ResolvedBreedDetection> {
  const policy = params.policy ?? defaultSecurityPolicy
  const validatedAsset = validateDogImageAsset(params.asset, policy)
  const catalog = params.breedCatalog ?? (await fetchBreedCatalog(params.fetchImpl))
  const detection = await requestBreedDetection({
    asset: validatedAsset,
    endpoint: params.endpoint,
    fetchImpl: params.fetchImpl,
    formDataFactory: params.formDataFactory
  })

  const breed = normalizeBreedName(detection.breed)
  const subBreed = detection.subBreed ? normalizeBreedName(detection.subBreed) : undefined

  if (detection.confidence < policy.minConfidence) {
    throw new DogBreedFeatureError('low_confidence', 'Breed detection confidence is below the accepted threshold.')
  }

  if (!isKnownBreed(catalog, breed, subBreed)) {
    throw new DogBreedFeatureError('unknown_breed', 'The classifier returned a breed not present in the Dog CEO catalog.')
  }

  return {
    breed,
    subBreed,
    displayName: toDisplayBreedName(breed, subBreed),
    confidence: detection.confidence,
    modelVersion: detection.modelVersion,
    requestId: detection.requestId
  }
}
