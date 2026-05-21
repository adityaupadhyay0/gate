import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GATE CSE AI Learning Platform',
    short_name: 'GATE CSE',
    description: 'Elite GATE preparation platform with adaptive AI and FSRS v4 algorithms.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
