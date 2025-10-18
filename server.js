import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility for __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;
const buildPath = path.join(__dirname, 'dist'); // Path to your built files (Vite output)

// 1. Serve static files from the 'dist' directory
app.use(express.static(buildPath));

// 2. Fallback for Client-Side Routing (The 404 Fix!)
// For any GET request that doesn't match a static file, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`AfriHealth Connect Server running on http://localhost:${port}`);
  console.log('Serving files from:', buildPath);
});

// IMPORTANT: This file must be named server.js and placed in the root of your project.
// We are using 'import' syntax so ensure 'type': 'module' is in package.json
