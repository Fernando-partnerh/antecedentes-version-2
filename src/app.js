// src/app.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import verifyRoute from './routes/verify.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CARPETA PUBLIC */

app.use(express.static(path.join(__dirname, '../public')));
app.use(
  "/documentos",
  express.static(
    path.join(__dirname, "../documentos")
  )
);
/* RUTA PRINCIPAL */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/* RUTA VALIDACION */

app.use('/verify', verifyRoute);

/* SERVIDOR */

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en: http://localhost:${PORT}`);
});