import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.LIVEKIT_API_KEY': JSON.stringify(env.LIVEKIT_API_KEY),
        'process.env.LIVEKIT_API_SECRET': JSON.stringify(env.LIVEKIT_API_SECRET),
        'process.env.LIVEKIT_URL': JSON.stringify(env.LIVEKIT_URL),
        'process.env.NEXT_PUBLIC_LIVEKIT_URL': JSON.stringify(env.LIVEKIT_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
