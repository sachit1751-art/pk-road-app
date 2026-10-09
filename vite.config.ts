import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import apiClassifyHandler from './api/classify-issue.ts';
import { handleAuthValidate, handleAuthRoles, handleAuthAudit } from './api/auth-handler.ts';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/health') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'healthy',
              timestamp: new Date().toISOString(),
              app: 'PK Road App',
              version: '1.0.0',
            })
          );
          return;
        }

        if (url === '/api/colony-info') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              name: 'Panchkuian Road Railway Colony',
              area: 'Railway Colony, Paharganj',
              city: 'New Delhi',
              state: 'Delhi',
              pin: '110055',
              country: 'India',
              mapUrl: 'https://maps.app.goo.gl/R54A6rW274PAqUE28',
            })
          );
          return;
        }

        if (url === '/api/auth/roles') {
          handleAuthRoles(req, res);
          return;
        }

        if (url === '/api/auth/validate' || url === '/api/auth/audit' || url === '/api/classify-issue') {
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

            if (url === '/api/auth/validate') {
              handleAuthValidate(req, res);
            } else if (url === '/api/auth/audit') {
              handleAuthAudit(req, res);
            } else if (url === '/api/classify-issue') {
              await apiClassifyHandler(req, res);
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
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
