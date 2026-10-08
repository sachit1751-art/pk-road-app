import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import apiClassifyHandler from './api/classify-issue';

dotenv.config();

function aiClassifierPlugin(): Plugin {
  return {
    name: 'ai-classifier-plugin',
    configureServer(server) {
      server.middlewares.use('/api/classify-issue', async (req: any, res: any) => {
        let bodyStr = '';
        req.on('data', (chunk: any) => {
          bodyStr += chunk;
        });
        req.on('end', async () => {
          try {
            req.body = bodyStr ? JSON.parse(bodyStr) : {};
          } catch (e) {
            req.body = {};
          }
          await apiClassifyHandler(req, res);
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), aiClassifierPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
