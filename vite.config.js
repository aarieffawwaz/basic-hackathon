import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      input: { landing: 'index.html', play: 'play/index.html' },
    },
  },
})
