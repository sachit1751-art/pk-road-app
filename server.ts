import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiClassifyHandler from './api/classify-issue.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint for AI Issue Classification
  app.post('/api/classify-issue', apiClassifyHandler);

  // Authentication API Endpoints
  app.post('/api/auth/validate', (req, res) => {
    const { email, password, name, mode } = req.body || {};

    const errors: string[] = [];

    if (!email || typeof email !== 'string') {
      errors.push('Email is required.');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email address format.');
      }
    }

    if (mode === 'register') {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('Full name must be at least 2 characters.');
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
      }
    } else if (mode === 'login') {
      if (!password || typeof password !== 'string' || password.length < 1) {
        errors.push('Password is required.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors });
    }

    return res.json({
      valid: true,
      message: 'Credentials pass format validation.',
      colonyDomain: email?.trim().endsWith('greenwood.org') || email?.trim().endsWith('colony.local'),
    });
  });

  app.get('/api/auth/roles', (req, res) => {
    res.json({
      roles: [
        { id: 'resident', name: 'Resident', description: 'Colony resident / allottee with flat access' },
        { id: 'rwa_admin', name: 'RWA Administrator', description: 'Resident Welfare Association committee' },
        { id: 'security_guard', name: 'Security Guard', description: 'Main gate and visitor control staff' },
        { id: 'water_worker', name: 'Water Supply Worker', description: 'Municipal water & pipeline maintenance' },
        { id: 'electrical_worker', name: 'Electrical Worker', description: 'Substation and wiring maintenance' },
        { id: 'sanitation_worker', name: 'Sanitation Worker', description: 'Waste collection and cleaning' },
        { id: 'maintenance_worker', name: 'General Maintenance', description: 'Civil and structural repairs' },
      ],
    });
  });

  app.post('/api/auth/audit', (req, res) => {
    const { event, email, uid, role } = req.body || {};
    const timestamp = new Date().toISOString();
    console.log(`[AUTH AUDIT ${timestamp}] Event: ${event} | Email: ${email} | UID: ${uid} | Role: ${role}`);
    res.json({ recorded: true, timestamp });
  });

  // Health and System Status Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      app: 'PK Road App',
      version: '1.0.0',
    });
  });

  // Colony Public Facts Endpoint
  app.get('/api/colony-info', (req, res) => {
    res.json({
      name: 'Panchkuian Road Railway Colony',
      area: 'Railway Colony, Paharganj',
      city: 'New Delhi',
      state: 'Delhi',
      pin: '110055',
      country: 'India',
      mapUrl: 'https://maps.app.goo.gl/R54A6rW274PAqUE28',
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
