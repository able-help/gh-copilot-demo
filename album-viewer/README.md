# Album Viewer

A modern Vue.js 3 application built with TypeScript that displays albums from the albums API.

## Features

- 🎵 Display album collection in a beautiful grid layout
- 🧭 Browse artists and filter the album grid by artist
- 🛠️ Manage artists and albums from dedicated studio panels
- 🔍 Preview richer album metadata including release dates and creation timestamps
- 🎨 Modern, responsive design with gradient background
- 🖼️ Album cover images with hover effects
- 💰 Price display for each album
- 📱 Mobile-friendly responsive design
- ⚡ Built with Vue 3, TypeScript, and Vite
- 🔧 Full TypeScript support with type safety
- 📝 Modern Composition API with `<script setup>`

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- TypeScript knowledge (helpful but not required)
- The albums-api should be running on `http://localhost:3000`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3001`

## API Integration

The app fetches album data from the albums API endpoints `/albums` and `/artists`. Make sure the album API is running before starting the Vue app.

Album reads use a joined shape like this:
```json
[
  {
    "id": 1,
    "title": "Album Title",
    "artist_id": 2,
    "artist": {
      "id": 2,
      "name": "Artist Name",
      "genre": "Artist Genre",
      "created_at": "2024-02-15T00:00:00.000Z"
    },
    "price": 10.99,
    "image_url": "https://example.com/image.jpg",
    "release_date": "2026-01-12",
    "created_at": "2026-01-13T00:00:00.000Z",
    "year": 2026
  }
]
```

Album writes use `artist_id` and `release_date`, while artist management uses `/artists` with `name` and optional `genre`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (with TypeScript compilation)
- `npm run preview` - Preview production build
- `npm run smoke` - Run Playwright smoke coverage for browse, cart, artist, and album flows
- `npm run type-check` - Run TypeScript type checking without building

## Project Structure

```
album-viewer/
├── src/
│   ├── components/
│   │   └── AlbumCard.vue    # Individual album card component (TypeScript)
│   ├── types/
│   │   └── album.ts         # TypeScript type definitions
│   ├── App.vue              # Main app component (TypeScript)
│   └── main.ts              # App entry point (TypeScript)
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration (TypeScript)
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript config
├── env.d.ts                 # Environment type declarations
└── package.json             # Dependencies and scripts
```

## Technologies Used

- Vue 3 (Composition API with `<script setup>`)
- TypeScript (Static type checking and better developer experience)
- Vite (Build tool with TypeScript support)
- Axios (HTTP client with TypeScript generics)
- CSS3 (Grid, Flexbox, Animations)

## TypeScript Features

This application leverages TypeScript for enhanced development experience:

- **Type Safety**: All components, functions, and data structures are strongly typed
- **Interface Definitions**: Clear contracts for data structures (Album interface)
- **Better IDE Support**: Enhanced IntelliSense, auto-completion, and error detection
- **Compile-time Error Checking**: Catch errors before runtime
- **Modern Vue 3 Syntax**: Uses `<script setup lang="ts">` for optimal TypeScript integration

## Features in Detail

### Album Cards
Each album is displayed in a card with:
- Album cover image
- Title and joined artist information
- Price display
- Hover effects with play button overlay
- Add to Cart and Preview buttons

### Studio Panels
The app now includes two management surfaces:

- `Artist Studio` for creating, editing, and deleting artists that are not currently referenced by albums
- `Catalog Studio` for creating, editing, and deleting albums using the normalized artist catalog

### Artist Browsing and Preview
- The `Artists` panel filters the grid by joined artist identity
- The album preview dialog shows artist genre, release date, derived year, album creation time, and artist creation time

### Responsive Design
The app adapts to different screen sizes:
- Desktop: Multi-column grid layout
- Mobile: Single column layout with stacked buttons

### Error Handling
- Loading spinner while fetching data
- Error message with retry button if API is unavailable
- Fallback placeholder image for broken album covers
- Safe API error messages for blocked artist deletes and failed catalog writes
