// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import sanity from '@sanity/astro';
import react from '@astrojs/react';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const env = loadEnv(mode, process.cwd(), '');

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId: env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
      dataset: env.PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2026-03-01',
      useCdn: true,
      studioBasePath: '/admin',
      injectTypes: true,
    }),
    react(),
  ],
});
