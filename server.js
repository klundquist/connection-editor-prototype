import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Configure CORS before routes
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Add explicit headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Test route
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.send('Proxy server is working!');
});

app.get('/proxy', async (req, res) => {
  console.log('=== Proxy Request Received ===');
  console.log('Query URL:', req.query.url);
  
  try {
    const url = req.query.url;
    if (!url) {
      throw new Error('URL parameter is required');
    }

    console.log('Fetching:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);

    // Get the content and modify it if needed
    const content = await response.text();
    console.log('Content length:', content.length);

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *");

    // Send the content
    res.send(content);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Try accessing http://localhost:3001/test in your browser');
  console.log('CORS enabled for all origins');
});
