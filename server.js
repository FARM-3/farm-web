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

// 2. Fallback for Client-Side Routing (THE FIX!)
// Use '/*' instead of '*' to avoid the PathError. This correctly catches all routes.
app.get('/*', (req, res) => {
  // Check if the request path looks like a file (e.g., /assets/style.css)
  // We only want to serve index.html for unknown HTML routes, not for missing assets.
  if (req.accepts('html')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // For non-HTML requests (like missing CSS or JS files), let Express send the 404
    res.status(404).end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`AfriHealth Connect Server running on http://localhost:${port}`);
  console.log('Serving files from:', buildPath);
});

// IMPORTANT: This file must be named server.js and placed in the root of your project.
