import { defaultSecurityPolicy } from '../config'
import { DogBreedFeatureError } from '../errors'
import { assertSecureEndpoint, sanitizeFileName, validateDogImageAsset } from '../security'
import type { DogImageAsset } from '../types'

const validAsset: DogImageAsset = {
  uri: 'file:///tmp/dog.png',
  fileName: 'dog.png',
  mimeType: 'image/png',
  fileSize: 1024,
  width: 512,
  height: 512
}

describe('security helpers', () => {
  it('accepts a valid local image asset', () => {
    expect(validateDogImageAsset(validAsset)).toEqual(validAsset)
  })

  it('rejects remote image urls to avoid SSRF-style misuse', () => {
    expect(() =>
      validateDogImageAsset({
        ...validAsset,
        uri: 'https://example.com/dog.png'
      })
    ).toThrow(DogBreedFeatureError)
  })

  it('rejects unsupported mime types', () => {
    expect(() =>
      validateDogImageAsset({
        ...validAsset,
        mimeType: 'image/svg+xml'
      })
    ).toThrow('Unsupported image type')
  })

  it('rejects oversized images', () => {
    expect(() =>
      validateDogImageAsset({
        ...validAsset,
        fileSize: defaultSecurityPolicy.maxImageBytes + 1
      })
    ).toThrow('file-size limit')
  })

  it('rejects dangerous filenames', () => {
    expect(() => sanitizeFileName('../dog.png')).toThrow('unsupported characters')
  })

  it('requires https for production endpoints', () => {
    expect(() =>
      assertSecureEndpoint({
        url: 'http://api.example.com/v1/detect',
        allowedHosts: ['api.example.com']
      })
    ).toThrow('must use HTTPS')
  })

  it('allows localhost http for development only', () => {
    const url = assertSecureEndpoint({
      url: 'http://localhost:3000/v1/detect',
      allowHttpLocalhost: true,
      allowedHosts: ['localhost']
    })

    expect(url.hostname).toBe('localhost')
  })

  it('enforces an endpoint allowlist', () => {
    expect(() =>
      assertSecureEndpoint({
        url: 'https://evil.example.com/v1/detect',
        allowedHosts: ['api.example.com']
      })
    ).toThrow('allowlisted')
  })
})
