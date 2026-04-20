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
      artist_id: 1,
      artist: {
        id: 1,
        name: 'Daprize',
        genre: 'Cloud Native Pop'
      },
      year: 2026,
      release_date: '2026-01-12',
      price: 10.99,
      image_url: 'https://aka.ms/albums-daprlogo'
    })
  })

  it('returns the normalized artist collection from GET /artists', async () => {
    const response = await request(app).get('/artists')

    expect(response.status).toBe(200)
    expect(response.body[0]).toMatchObject({
      id: 1,
      name: 'Daprize',
      genre: 'Cloud Native Pop'
    })
  })

  it('returns a single artist from GET /artists/:id', async () => {
    const response = await request(app).get('/artists/2')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 2,
      name: 'The Blue-Green Stripes'
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
        artist_id: 2,
        price: 12.5,
        image_url: 'https://example.com/created.png',
        release_date: '2030-07-01'
      })

    expect(response.status).toBe(201)
    expect(response.headers.location).toBe('/albums/7')
    expect(response.body).toMatchObject({
      id: 7,
      title: 'Created Album',
      artist_id: 2,
      year: 2030,
      release_date: '2030-07-01'
    })
  })

  it('creates an artist', async () => {
    const response = await request(app)
      .post('/artists')
      .send({
        name: 'Release Notes',
        genre: 'Docs Rock'
      })

    expect(response.status).toBe(201)
    expect(response.headers.location).toBe('/artists/7')
    expect(response.body).toMatchObject({
      id: 7,
      name: 'Release Notes',
      genre: 'Docs Rock'
    })
  })

  it('validates create payloads', async () => {
    const response = await request(app)
      .post('/albums')
      .send({
        title: '  ',
        artist_id: 1,
        price: 10,
        image_url: 'https://example.com/image.png',
        release_date: '2030-07-01'
      })

    expect(response.status).toBe(400)
    expect(response.text).toBe('Title is required.')
  })

  it('validates artist create payloads', async () => {
    const response = await request(app)
      .post('/artists')
      .send({
        name: '  ',
        genre: 'Docs Rock'
      })

    expect(response.status).toBe(400)
    expect(response.text).toBe('Name is required.')
  })

  it('updates an existing album', async () => {
    const response = await request(app)
      .put('/albums/2')
      .send({
        title: 'Updated Album',
        artist_id: 4,
        price: 15.75,
        image_url: 'https://example.com/updated.png',
        release_date: '2031-08-02'
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 2,
      title: 'Updated Album',
      artist_id: 4,
      year: 2031
    })
  })

  it('updates an existing artist', async () => {
    const response = await request(app)
      .put('/artists/2')
      .send({
        name: 'The Blue-Green Deployers',
        genre: 'Deployment Rock'
      })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 2,
      name: 'The Blue-Green Deployers'
    })
  })

  it('returns 404 when updating a missing album', async () => {
    const response = await request(app)
      .put('/albums/999')
      .send({
        title: 'Updated Album',
        artist_id: 4,
        price: 15.75,
        image_url: 'https://example.com/updated.png',
        release_date: '2031-08-02'
      })

    expect(response.status).toBe(404)
  })

  it('returns 404 when updating a missing artist', async () => {
    const response = await request(app)
      .put('/artists/999')
      .send({
        name: 'Ghost Artist',
        genre: null
      })

    expect(response.status).toBe(404)
  })

  it('returns 400 when a create payload references a missing artist', async () => {
    const response = await request(app)
      .post('/albums')
      .send({
        title: 'Missing Artist Album',
        artist_id: 999,
        price: 12.5,
        image_url: 'https://example.com/created.png',
        release_date: '2030-07-01'
      })

    expect(response.status).toBe(400)
    expect(response.text).toBe('Artist_id must reference an existing artist.')
  })

  it('deletes an existing album', async () => {
    const response = await request(app).delete('/albums/2')
    const afterDelete = await request(app).get('/albums/2')

    expect(response.status).toBe(204)
    expect(afterDelete.status).toBe(404)
  })

  it('deletes an existing artist that is not referenced by albums', async () => {
    const created = await request(app)
      .post('/artists')
      .send({
        name: 'Disposable Artist',
        genre: null
      })

    const response = await request(app).delete(`/artists/${created.body.id}`)
    const afterDelete = await request(app).get(`/artists/${created.body.id}`)

    expect(response.status).toBe(204)
    expect(afterDelete.status).toBe(404)
  })

  it('returns 409 when deleting an artist still referenced by albums', async () => {
    const response = await request(app).delete('/artists/1')

    expect(response.status).toBe(409)
    expect(response.text).toBe('Artist is still referenced by one or more albums.')
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
    expect(response.body[0]?.release_date).toBe('2024-03-18')
  })

  it('returns 400 for invalid search year', async () => {
    const response = await request(app).get('/albums/search?year=0')

    expect(response.status).toBe(400)
    expect(response.text).toBe('Year must be greater than 0.')
  })
})