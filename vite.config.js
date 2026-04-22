import { defineConfig } from ‘vite’
import react from ‘@vitejs/plugin-react’
import { VitePWA } from ‘vite-plugin-pwa’

export default defineConfig({
plugins: [
react(),
VitePWA({
registerType: ‘autoUpdate’,
includeAssets: [‘icon-192.png’, ‘icon-512.png’],
manifest: {
name: ‘მარგალური’,
short_name: ‘მარგალური’,
description: ‘Мегрельский словарь и переводчик’,
theme_color: ‘#0f1a12’,
background_color: ‘#0f1a12’,
display: ‘standalone’,
orientation: ‘portrait’,
start_url: ‘/’,
icons: [
{
src: ‘icon-192.png’,
sizes: ‘192x192’,
type: ‘image/png’
},
{
src: ‘icon-512.png’,
sizes: ‘512x512’,
type: ‘image/png’
}
]
},
workbox: {
globPatterns: [’**/*.{js,css,html,ico,png,svg,woff,woff2}’],
runtimeCaching: [
{
urlPattern: /^https://fonts.googleapis.com/.*/i,
handler: ‘CacheFirst’,
options: {
cacheName: ‘google-fonts-cache’,
expiration: {
maxEntries: 10,
maxAgeSeconds: 60 * 60 * 24 * 365
},
cacheableResponse: { statuses: [0, 200] }
}
},
{
urlPattern: /^https://fonts.gstatic.com/.*/i,
handler: ‘CacheFirst’,
options: {
cacheName: ‘gstatic-fonts-cache’,
expiration: {
maxEntries: 10,
maxAgeSeconds: 60 * 60 * 24 * 365
},
cacheableResponse: { statuses: [0, 200] }
}
}
]
}
})
],
})