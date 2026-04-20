import { DogBreedFeatureError } from '../errors'
import { fetchBreedCatalog, isKnownBreed, normalizeBreedName, toDisplayBreedName } from '../dogCeoClient'
import type { FetchLike } from '../types'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

describe('dogCeoClient', () => {
  it('normalizes breed names', () => {
    expect(normalizeBreedName(' Golden Retriever ')).toBe('golden-retriever')
  })

  it('builds a display label for a sub-breed', () => {
    expect(toDisplayBreedName('bulldog', 'french')).toBe('French Bulldog')
  })

  it('loads and normalizes the breed catalog', async () => {
    const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
      jsonResponse({
        status: 'success',
        message: {
          bulldog: ['french', 'english'],
          pug: []
        }
      })
    )

    const catalog = await fetchBreedCatalog(fetchImpl)

    expect(catalog).toEqual({
      bulldog: ['french', 'english'],
      pug: []
    })
    expect(isKnownBreed(catalog, 'Bulldog', 'French')).toBe(true)
    expect(isKnownBreed(catalog, 'Pug')).toBe(true)
  })

  it('rejects malformed dog ceo payloads', async () => {
    const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
      jsonResponse({ status: 'success', message: 'bad-shape' })
    )

    await expect(fetchBreedCatalog(fetchImpl)).rejects.toMatchObject({
      code: 'breed_catalog_invalid'
    })
  })

  it('rejects dog ceo http failures', async () => {
    const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
      jsonResponse({ status: 'error' }, 503)
    )

    await expect(fetchBreedCatalog(fetchImpl)).rejects.toMatchObject({
      code: 'breed_catalog_failed'
    })
  })
})
