export type DogBreedSecurityPolicy = {
  maxImageBytes: number
  minWidth: number
  minHeight: number
  maxWidth: number
  maxHeight: number
  minConfidence: number
  maxFileNameLength: number
  allowedMimeTypes: readonly string[]
  allowedUriSchemes: readonly string[]
}

export type DetectionEndpointConfig = {
  url: string
  allowedHosts?: readonly string[]
  allowHttpLocalhost?: boolean
}

export const defaultSecurityPolicy: DogBreedSecurityPolicy = {
  maxImageBytes: 5 * 1024 * 1024,
  minWidth: 64,
  minHeight: 64,
  maxWidth: 4096,
  maxHeight: 4096,
  minConfidence: 0.75,
  maxFileNameLength: 120,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedUriSchemes: ['file', 'content', 'ph', 'assets-library']
}

export const dogCeoBaseUrl = 'https://dog.ceo/api'
export const dogApiBaseUrl = 'https://dogapi.dog/api/v2'
