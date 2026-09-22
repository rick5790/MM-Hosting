const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8000;
const host = process.env.HOST || '127.0.0.1';
const root = process.cwd();

const mime = {
  '.html':'text/html', '.htm':'text/html', '.css':'text/css', '.js':'application/javascript',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml',
  '.webp':'image/webp', '.gif':'image/gif', '.mp4':'video/mp4', '.webm':'video/webm', '.ogg':'audio/ogg',
  '.txt':'text/plain', '.xml':'application/xml'
};

const server = http.createServer((req, res) => {
  try {
    const safePath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, safePath);
    if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');
    // prevent path traversal
    if (!filePath.startsWith(root)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, {'Content-Type':'text/plain'});
        res.end('Not found');
        return;
      }
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      const type = mime[ext] || 'application/octet-stream';
      const stream = fs.createReadStream(filePath);
      res.writeHead(200, {'Content-Type': type});
      stream.pipe(res);
      stream.on('error', () => { res.writeHead(500); res.end('Server error'); });
    });
  } catch (e) {
    res.writeHead(500); res.end('Server error');
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`);
});

// Graceful shutdown
process.on('SIGINT', () => { console.log('Shutting down'); server.close(() => process.exit(0)); });
