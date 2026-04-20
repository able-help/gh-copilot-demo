const frontendBaseUrl = process.env.ALBUM_VIEWER_URL ?? 'http://localhost:3001'
const backendProxyUrl = `${frontendBaseUrl}/albums`

async function assertOk(response, description) {
  if (!response.ok) {
    throw new Error(`${description} failed with status ${response.status}`)
  }
}

async function main() {
  const rootResponse = await fetch(`${frontendBaseUrl}/`)
  await assertOk(rootResponse, 'Vue app root request')

  const html = await rootResponse.text()

  if (!html.includes('<div id="app"></div>')) {
    throw new Error('Vue app root HTML did not include the app mount point')
  }

  const albumsResponse = await fetch(backendProxyUrl)
  await assertOk(albumsResponse, 'Vue dev server album proxy request')

  const albums = await albumsResponse.json()

  if (!Array.isArray(albums) || albums.length !== 6) {
    throw new Error(`Expected 6 albums from proxy route, received ${Array.isArray(albums) ? albums.length : 'non-array data'}`)
  }

  if (albums[0]?.title !== 'You, Me and an App Id') {
    throw new Error('Unexpected first album title returned from proxy route')
  }

  console.log('Smoke test passed: Vue dev server is up and /albums is proxying album-api-v2 correctly.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})