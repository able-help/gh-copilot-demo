import { identifyDogBreed } from '../dogBreedFeature'
import type { DogBreedCatalog, DogImageAsset, FetchLike, FormDataFactory, FormDataLike } from '../types'

class FakeFormData implements FormDataLike {
  readonly entries: Array<{ name: string; value: unknown }> = []

  append(name: string, value: unknown): void {
    this.entries.push({ name, value })
  }
}

const asset: DogImageAsset = {
  uri: 'file:///dogs/frenchie.jpg',
  fileName: 'frenchie.jpg',
  mimeType: 'image/jpeg',
  fileSize: 2048,
  width: 800,
  height: 800
}

const breedCatalog: DogBreedCatalog = {
  bulldog: ['french', 'english'],
  pug: []
}

const formDataFactory: FormDataFactory = () => new FakeFormData()

function createFetchMock(): jest.MockedFunction<FetchLike> {
  return jest.fn(async (input, init) => {
    const url = String(input)

    if (url.includes('/breeds/list/all')) {
      return new Response(
        JSON.stringify({
          status: 'success',
          message: breedCatalog
        }),
        { status: 200 }
      )
    }

    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({ Accept: 'application/json' })

    return new Response(
      JSON.stringify({
        breed: 'Bulldog',
        subBreed: 'French',
        confidence: 0.93,
        modelVersion: '2026.04',
        requestId: 'req-123'
      }),
      { status: 200 }
    )
  })
}

describe('identifyDogBreed', () => {
  it('returns a normalized verified breed result', async () => {
    const fetchImpl = createFetchMock()

    const result = await identifyDogBreed({
      asset,
      endpoint: {
        url: 'https://api.example.com/v1/dog-breed/detect',
        allowedHosts: ['api.example.com']
      },
      breedCatalog,
      fetchImpl,
      formDataFactory
    })

    expect(result).toEqual({
      breed: 'bulldog',
      subBreed: 'french',
      displayName: 'French Bulldog',
      confidence: 0.93,
      modelVersion: '2026.04',
      requestId: 'req-123'
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('fetches the breed catalog when one is not provided', async () => {
    const fetchImpl = createFetchMock()

    await identifyDogBreed({
      asset,
      endpoint: {
        url: 'https://api.example.com/v1/dog-breed/detect',
        allowedHosts: ['api.example.com']
      },
      fetchImpl,
      formDataFactory
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(String(fetchImpl.mock.calls[0][0])).toContain('/breeds/list/all')
  })

  it('rejects low-confidence results', async () => {
    const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
      new Response(
        JSON.stringify({
          breed: 'Bulldog',
          subBreed: 'French',
          confidence: 0.4,
          modelVersion: '2026.04',
          requestId: 'req-456'
        }),
        { status: 200 }
      )
    )

    await expect(
      identifyDogBreed({
        asset,
        endpoint: {
          url: 'https://api.example.com/v1/dog-breed/detect',
          allowedHosts: ['api.example.com']
        },
        breedCatalog,
        fetchImpl,
        formDataFactory
      })
    ).rejects.toMatchObject({ code: 'low_confidence' })
  })

  it('rejects breeds missing from the Dog CEO catalog', async () => {
    const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
      new Response(
        JSON.stringify({
          breed: 'Wolfdog',
          confidence: 0.98,
          modelVersion: '2026.04',
          requestId: 'req-789'
        }),
        { status: 200 }
      )
    )

    await expect(
      identifyDogBreed({
        asset,
        endpoint: {
          url: 'https://api.example.com/v1/dog-breed/detect',
          allowedHosts: ['api.example.com']
        },
        breedCatalog,
        fetchImpl,
        formDataFactory
      })
    ).rejects.toMatchObject({ code: 'unknown_breed' })
  })
})
