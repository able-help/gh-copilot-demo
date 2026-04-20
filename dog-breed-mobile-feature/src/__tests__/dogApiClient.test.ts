import { fetchAllBreeds } from '../dogApiClient'
import type { FetchLike } from '../types'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function createBreedResource(id: string, name: string) {
  return {
    id,
    type: 'breed' as const,
    attributes: {
      name,
      description: `${name} description`,
      hypoallergenic: false,
      life: { min: 10, max: 14 },
      male_weight: { min: 25, max: 30 },
      female_weight: { min: 20, max: 25 }
    }
  }
}

describe('dogApiClient', () => {
  describe('fetchAllBreeds', () => {
    it('returns breeds from a single page', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        jsonResponse({
          data: [createBreedResource('breed-1', 'Akita'), createBreedResource('breed-2', 'Beagle')],
          links: {
            next: null
          }
        })
      )

      await expect(fetchAllBreeds(fetchImpl)).resolves.toEqual([
        {
          id: 'breed-1',
          name: 'Akita',
          description: 'Akita description',
          hypoallergenic: false,
          life: { min: 10, max: 14 },
          maleWeight: { min: 25, max: 30 },
          femaleWeight: { min: 20, max: 25 }
        },
        {
          id: 'breed-2',
          name: 'Beagle',
          description: 'Beagle description',
          hypoallergenic: false,
          life: { min: 10, max: 14 },
          maleWeight: { min: 25, max: 30 },
          femaleWeight: { min: 20, max: 25 }
        }
      ])
    })

    it('follows pagination links until all breeds are collected', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async (input) => {
        const url = String(input)

        if (url.includes('page[number]=1')) {
          return jsonResponse({
            data: [createBreedResource('breed-1', 'Akita')],
            links: {
              next: 'https://dogapi.dog/api/v2/breeds?page[number]=2&page[size]=1000'
            }
          })
        }

        return jsonResponse({
          data: [createBreedResource('breed-2', 'Beagle')],
          links: {
            next: null
          }
        })
      })

      await expect(fetchAllBreeds(fetchImpl)).resolves.toHaveLength(2)
      expect(fetchImpl).toHaveBeenCalledTimes(2)
    })

    it('uses the provided baseUrl and pageSize options', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        jsonResponse({
          data: [createBreedResource('breed-1', 'Akita')],
          links: {
            next: null
          }
        })
      )

      await fetchAllBreeds(fetchImpl, {
        baseUrl: 'https://example.test/api/v2',
        pageSize: 25
      })

      expect(fetchImpl).toHaveBeenCalledWith(
        'https://example.test/api/v2/breeds?page[number]=1&page[size]=25',
        expect.objectContaining({
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        })
      )
    })

    it('returns an empty array when the api has no breeds', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        jsonResponse({
          data: [],
          links: {
            next: null
          }
        })
      )

      await expect(fetchAllBreeds(fetchImpl)).resolves.toEqual([])
    })

    it('rejects invalid pageSize values', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>()

      await expect(fetchAllBreeds(fetchImpl, { pageSize: 0 })).rejects.toMatchObject({
        code: 'breed_list_invalid_page_size'
      })
      expect(fetchImpl).not.toHaveBeenCalled()
    })

    it('rejects malformed dog api payloads', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        jsonResponse({
          data: [{ id: 'breed-1', type: 'breed', attributes: { name: 'Akita' } }]
        })
      )

      await expect(fetchAllBreeds(fetchImpl)).rejects.toMatchObject({
        code: 'breed_list_invalid'
      })
    })

    it('rejects dog api http failures', async () => {
      const fetchImpl = jest.fn<ReturnType<FetchLike>, Parameters<FetchLike>>(async () =>
        jsonResponse({ errors: ['unavailable'] }, 503)
      )

      await expect(fetchAllBreeds(fetchImpl)).rejects.toMatchObject({
        code: 'breed_list_failed'
      })
    })
  })
})