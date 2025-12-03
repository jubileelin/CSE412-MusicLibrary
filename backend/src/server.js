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

app.get('/accounts', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const result = await pool.query(
    `SELECT id, user_name, email, subscription_type, date_joined
     FROM account
     ORDER BY date_joined DESC
     LIMIT 20;`
  );
  res.json(result.rows);
});

app.get('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  res.set('Cache-Control', 'no-store');
  const result = await pool.query(
    `SELECT
       a.id,
       a.user_name,
       a.email,
       a.subscription_type,
       a.date_joined,
       COUNT(p.id) AS playlist_count,
       COUNT(f.artist_id) AS followed_artist_count
     FROM account a
     LEFT JOIN playlist p ON p.user_id = a.id
     LEFT JOIN follow f ON f.user_id = a.id
     WHERE a.id = $1
     GROUP BY a.id;`,
    [id]
  );

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }

  res.json(result.rows[0]);
});

app.patch('/accounts/:id', async (req, res) => {
  const { id } = req.params;
  const { user_name, email, subscription_type } = req.body;
  const updates = [];
  const values = [];
  let idx = 1;

  if (user_name) {
    updates.push(`user_name = $${idx++}`);
    values.push(user_name);
  }
  if (email) {
    updates.push(`email = $${idx++}`);
    values.push(email);
  }
  if (subscription_type) {
    updates.push(`subscription_type = $${idx++}`);
    values.push(subscription_type);
  }

  if (updates.length === 0) {
    res.status(400).json({ message: 'No fields provided for update' });
    return;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE account
     SET ${updates.join(', ')}
     WHERE id = $${idx}
     RETURNING id, user_name, email, subscription_type, date_joined;`,
    values
  );

  if (result.rowCount === 0) {
    res.status(404).json({ message: 'Account not found' });
    return;
  }

  const updated = result.rows[0];
  console.log('Updated account:', updated);
  res.json(updated);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
