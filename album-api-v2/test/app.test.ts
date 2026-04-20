import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { albumStore } from '../src/store'

describe('album-api-v2 routes', () => {
  const app = createApp()

  beforeEach(() => {
    albumStore.reset()
  })

  it('returns the seed collection from GET /albums', async () => {
    const response = await request(app).get('/albums')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(6)
    expect(response.body[0]).toMatchObject({
      id: 1,
      title: 'You, Me and an App Id',
      year: 2026,
      price: 10.99,
      image_url: 'https://aka.ms/albums-daprlogo'
    })
  })

  it('returns a single album from GET /albums/:id', async () => {
    const response = await request(app).get('/albums/3')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 3,
      title: 'Scale It Up'
    })
  })

  it('returns 404 when an album is missing', async () => {
    const response = await request(app).get('/albums/999')

    expect(response.status).toBe(404)
  })

  it('creates an album', async () => {
    const response = await request(app)
      .post('/albums')
      .send({
        title: 'Created Album',
        artist: {
          name: 'Created Artist',
          birthdate: '1990-01-01',
          birthPlace: 'Madrid, Spain'
        },
        year: 2030,
        price: 12.5,
        image_url: 'https://example.com/created.png'
      })

    expect(response.status).toBe(201)
    expect(response.headers.location).toBe('/albums/7')
    expect(response.body).toMatchObject({
      id: 7,
      title: 'Created Album'
    })
  })

  it('validates create payloads', async () => {
    const response = await request(app)
      .post('/albums')
      .send({
        title: '  ',
        artist: {
          name: 'Artist',
          birthdate: '1990-01-01',
          birthPlace: 'City'
        },
        year: 2030,
        price: 10,
        image_url: 'https://example.com/image.png'
      })

    expect(response.status).toBe(400)
    expect(response.text).toBe('Title is required.')
  })

  it('updates an existing album', async () => {
    const response = await request(app)
      .put('/albums/2')
      .send({
        title: 'Updated Album',
        artist: {
          name: 'Updated Artist',
          birthdate: '1991-02-02',
          birthPlace: 'Oslo, Norway'
        },
        year: 2031,
        price: 15.75,
        image_url: 'https://example.com/updated.png'
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 2,
      title: 'Updated Album',
      year: 2031
    })
  })

  it('returns 404 when updating a missing album', async () => {
    const response = await request(app)
      .put('/albums/999')
      .send({
        title: 'Updated Album',
        artist: {
          name: 'Updated Artist',
          birthdate: '1991-02-02',
          birthPlace: 'Oslo, Norway'
        },
        year: 2031,
        price: 15.75,
        image_url: 'https://example.com/updated.png'
      })

    expect(response.status).toBe(404)
  })

  it('deletes an existing album', async () => {
    const response = await request(app).delete('/albums/2')
    const afterDelete = await request(app).get('/albums/2')

    expect(response.status).toBe(204)
    expect(afterDelete.status).toBe(404)
  })

  it('returns 404 when deleting a missing album', async () => {
    const response = await request(app).delete('/albums/999')

    expect(response.status).toBe(404)
  })

  it('sorts albums by price descending', async () => {
    const response = await request(app).get('/albums/sorted?sortBy=price&order=desc')

    expect(response.status).toBe(200)
    expect(response.body[0]?.title).toBe("Sweet Container O' Mine")
  })

  it('returns 400 for invalid sort fields', async () => {
    const response = await request(app).get('/albums/sorted?sortBy=invalid&order=asc')

    expect(response.status).toBe(400)
    expect(response.text).toBe('Invalid sortBy value. Use: title, artist, or price.')
  })

  it('searches albums by year', async () => {
    const response = await request(app).get('/albums/search?year=2024')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]?.year).toBe(2024)
  })

  it('returns 400 for invalid search year', async () => {
    const response = await request(app).get('/albums/search?year=0')

    expect(response.status).toBe(400)
    expect(response.text).toBe('Year must be greater than 0.')
  })
})