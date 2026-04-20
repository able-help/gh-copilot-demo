import { defaultSecurityPolicy, type DetectionEndpointConfig, type DogBreedSecurityPolicy } from './config'
import { DogBreedFeatureError } from './errors'
import type { DogImageAsset } from './types'

const safeFileNamePattern = /^[A-Za-z0-9._-]+$/

function getUriScheme(uri: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z\d+.-]*):/.exec(uri)
  return match ? match[1].toLowerCase() : null
}

export function sanitizeFileName(fileName: string | undefined, maxLength = defaultSecurityPolicy.maxFileNameLength): string {
  const candidate = (fileName ?? 'dog-image').trim()

  if (candidate.length === 0 || candidate.length > maxLength || !safeFileNamePattern.test(candidate)) {
    throw new DogBreedFeatureError('invalid_file_name', 'Image file name contains unsupported characters or is too long.')
  }

  return candidate
}

export function validateDogImageAsset(
  asset: DogImageAsset,
  policy: DogBreedSecurityPolicy = defaultSecurityPolicy
): DogImageAsset {
  const scheme = getUriScheme(asset.uri)

  if (!scheme || !policy.allowedUriSchemes.includes(scheme)) {
    throw new DogBreedFeatureError('invalid_uri_scheme', 'Only local device image URIs are allowed.')
  }

  if (!policy.allowedMimeTypes.includes(asset.mimeType ?? '')) {
    throw new DogBreedFeatureError('invalid_mime_type', 'Unsupported image type. Allowed types are JPEG, PNG, and WebP.')
  }

  if (asset.fileSize <= 0 || asset.fileSize > policy.maxImageBytes) {
    throw new DogBreedFeatureError('invalid_file_size', 'Image exceeds the allowed file-size limit.')
  }

  if (asset.width < policy.minWidth || asset.height < policy.minHeight) {
    throw new DogBreedFeatureError('image_too_small', 'Image dimensions are too small for reliable classification.')
  }

  if (asset.width > policy.maxWidth || asset.height > policy.maxHeight) {
    throw new DogBreedFeatureError('image_too_large', 'Image dimensions exceed the allowed maximum.')
  }

  sanitizeFileName(asset.fileName, policy.maxFileNameLength)

  return asset
}

export function assertSecureEndpoint(config: DetectionEndpointConfig): URL {
  const url = new URL(config.url)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  if (url.protocol !== 'https:' && !(config.allowHttpLocalhost && isLocalhost && url.protocol === 'http:')) {
    throw new DogBreedFeatureError('insecure_endpoint', 'The breed detection endpoint must use HTTPS except for localhost development.')
  }

  if (config.allowedHosts && config.allowedHosts.length > 0 && !config.allowedHosts.includes(url.hostname)) {
    throw new DogBreedFeatureError('untrusted_host', 'The breed detection endpoint host is not allowlisted.')
  }

  return url
}
