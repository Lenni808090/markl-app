import { createServer } from 'http';
import { parse } from 'url';
import handler from './proxy-image.js';

const PORT = 3001;

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url || '', true);
  
  // Only handle /api/proxy-image
  if (parsedUrl.pathname === '/api/proxy-image') {
    // Convert Node request/response to Vercel format
    const vercelReq = {
      query: parsedUrl.query,
    };
    
    const vercelRes = {
      status: (code) => ({
        json: (data) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return vercelRes;
        },
        send: (data) => {
          res.statusCode = code;
          res.end(data);
          return vercelRes;
        },
      }),
      setHeader: (name, value) => {
        res.setHeader(name, value);
        return vercelRes;
      },
      send: (data) => {
        res.end(data);
        return vercelRes;
      },
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error('Error handling request:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`   Proxying /api/* requests from Vite dev server`);
});
