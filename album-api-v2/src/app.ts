import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { albumStore } from './store'
import type { SortBy, SortOrder } from './types'
import { validateAlbumInput } from './validation'

const validSortFields = new Set<SortBy>(['title', 'artist', 'price'])

function parseId(rawId: string | string[] | undefined): number {
  const value = Array.isArray(rawId) ? rawId[0] : rawId
  return Number.parseInt(value ?? '', 10)
}

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/', (_request: Request, response: Response) => {
    response.send('Hit the /albums endpoint to retrieve a list of albums!')
  })

  app.get('/albums', (_request: Request, response: Response) => {
    response.json(albumStore.list())
  })

  app.get('/albums/sorted', (request: Request, response: Response) => {
    const rawSortBy = typeof request.query.sortBy === 'string' ? request.query.sortBy.trim().toLowerCase() : 'title'
    const rawOrder = typeof request.query.order === 'string' ? request.query.order.trim().toLowerCase() : 'asc'

    if (!validSortFields.has(rawSortBy as SortBy)) {
      response.status(400).send('Invalid sortBy value. Use: title, artist, or price.')
      return
    }

    const sortBy = rawSortBy as SortBy
    const order: SortOrder = rawOrder === 'desc' ? 'desc' : 'asc'

    response.json(albumStore.listSorted(sortBy, order))
  })

  app.get('/albums/search', (request: Request, response: Response) => {
    const year = Number(request.query.year)

    if (!Number.isInteger(year) || year <= 0) {
      response.status(400).send('Year must be greater than 0.')
      return
    }

    response.json(albumStore.searchByYear(year))
  })

  app.get('/albums/:id', (request: Request, response: Response) => {
    const id = parseId(request.params.id)
    const album = albumStore.getById(id)

    if (!album) {
      response.sendStatus(404)
      return
    }

    response.json(album)
  })

  app.post('/albums', (request: Request, response: Response) => {
    const { error, data } = validateAlbumInput(request.body)

    if (error || !data) {
      response.status(400).send(error)
      return
    }

    const album = albumStore.create(data)
    response.status(201).location(`/albums/${album.id}`).json(album)
  })

  app.put('/albums/:id', (request: Request, response: Response) => {
    const { error, data } = validateAlbumInput(request.body)

    if (error || !data) {
      response.status(400).send(error)
      return
    }

    const id = parseId(request.params.id)
    const album = albumStore.update(id, data)

    if (!album) {
      response.sendStatus(404)
      return
    }

    response.json(album)
  })

  app.delete('/albums/:id', (request: Request, response: Response) => {
    const id = parseId(request.params.id)
    const deleted = albumStore.delete(id)

    if (!deleted) {
      response.sendStatus(404)
      return
    }

    response.sendStatus(204)
  })

  return app
}