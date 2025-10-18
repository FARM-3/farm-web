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

// 2. Fallback for Client-Side Routing (THE FINAL FIX!)
// Use app.use() without a path to guarantee it runs last for ANY request not handled above.
app.use((req, res) => {
  // We only send index.html if the client is expecting an HTML page.
  // This prevents infinite redirects or serving HTML for missing CSS/JS assets.
  if (req.accepts('html')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // For non-HTML requests (like missing assets), let Express send the 404
    res.status(404).end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`AfriHealth Connect Server running on http://localhost:${port}`);
  console.log('Serving files from:', buildPath);
});

// IMPORTANT: This file must be named server.js and placed in the root of your project.
