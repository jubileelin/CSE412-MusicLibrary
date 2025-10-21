import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/index.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.get('/tracks', async (req, res) => {
  const q = req.query.q || '';
  const result = await pool.query(
    `SELECT t.title, t.release_date
     FROM tracks t
     WHERE t.title ILIKE $1
     LIMIT 10;`,
    [`%${q}%`]
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
