import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const port = Number(process.env.PORT ?? 5173);
const host = '127.0.0.1';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);
  const cleanPath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, cleanPath === '/' ? 'index.html' : cleanPath);

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    response.end(body);
  } catch {
    const fallback = await readFile(join(root, 'index.html'));
    response.writeHead(200, {
      'Content-Type': contentTypes['.html'],
      'Cache-Control': 'no-store',
    });
    response.end(fallback);
  }
}).listen(port, host, () => {
  console.log(`Warehouse Picker Panic running at http://${host}:${port}`);
});
