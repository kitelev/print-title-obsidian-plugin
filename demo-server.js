const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  // Serve files that BRAT would request
  const routes = {
    '/': 'Repository root - BRAT ready',
    '/main.js': fs.readFileSync('main.js', 'utf8'),
    '/manifest.json': fs.readFileSync('manifest.json', 'utf8'),
    '/versions.json': fs.readFileSync('versions.json', 'utf8'),
    '/check': JSON.stringify({
      status: 'ready',
      files: {
        'main.js': fs.existsSync('main.js'),
        'manifest.json': fs.existsSync('manifest.json'),
        'versions.json': fs.existsSync('versions.json')
      },
      manifest: JSON.parse(fs.readFileSync('manifest.json', 'utf8'))
    }, null, 2)
  };

  const content = routes[req.url];
  
  if (content) {
    res.writeHead(200, { 'Content-Type': req.url.endsWith('.json') ? 'application/json' : 'text/plain' });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`
🚀 Print Title Plugin Demo Server
=================================
Server running at http://localhost:${PORT}

BRAT-required files available at:
- http://localhost:${PORT}/main.js
- http://localhost:${PORT}/manifest.json  
- http://localhost:${PORT}/versions.json

Check plugin status:
- http://localhost:${PORT}/check

This simulates what BRAT will see when fetching from GitHub.
Press Ctrl+C to stop.
  `);
});