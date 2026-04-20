import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../album-api-v2',
      url: 'http://127.0.0.1:3000/albums',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        PORT: '3000'
      }
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 3001',
      cwd: '.',
      url: 'http://127.0.0.1:3001',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})