
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject process.env.API_KEY from the Vercel environment into the client-side bundle
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
