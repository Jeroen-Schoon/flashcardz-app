import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    allowedHosts: ['bba2c.text99.com'], // Add custom host here
    https: {
      key: fs.readFileSync('/home/jeroens/ssl/localhost.key'),
      cert: fs.readFileSync('/home/jeroens/ssl/localhost.crt'),
    },
    host: '0.0.0.0', // Optional: Makes the dev server accessible on your network
    port: 3000,      // Optional: Change default port
  },
});