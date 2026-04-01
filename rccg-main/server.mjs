import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distDir = path.join(__dirname, 'dist');

app.disable('x-powered-by');

app.use(
  express.static(distDir, {
    index: false,
    maxAge: '1h',
    etag: true,
  }),
);

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Serving dist/ on http://${host}:${port}`);
});
