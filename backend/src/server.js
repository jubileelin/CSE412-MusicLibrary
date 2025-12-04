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

app.get('/accounts/:id/followed-artists', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT
      a.id AS artist_id,
      a.artist_name,
      a.bio,
      a.genre,
      a.artist_language,
      a.start_date,
      a.artist_image,
      f.is_favorite AS is_favorite,
      true AS is_following,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'id', al.id,
          'name', al.album_name,
          'release_date', al.release_date,
          'image', al.album_image,
          'external_id', al.external_id
        )), '[]'::json)
        FROM (
          SELECT al.*
          FROM album al
          WHERE al.artist_id = a.id
          ORDER BY COALESCE(al.release_date, '1970-01-01') DESC
          LIMIT 3
        ) al
      ) AS albums
    FROM follow f
    JOIN artist a ON a.id = f.artist_id
    WHERE f.user_id = $1
    ORDER BY f.follow_date DESC NULLS LAST;`,
    [id]
  );

  console.log(`Returning ${result.rowCount} followed artists for account ${id}`);
  result.rows.forEach((row) => {
    console.log(`  - ${row.artist_name} has ${row.albums.length} stored albums`);
  });

  res.json(result.rows);
});

app.post('/accounts/:id/follows', async (req, res) => {
  const { id } = req.params;
  const { artist_id } = req.body;

  if (!artist_id) {
    res.status(400).json({ message: 'artist_id is required' });
    return;
  }

  const insertResult = await pool.query(
    `INSERT INTO follow (user_id, artist_id, follow_date, is_favorite)
     VALUES ($1, $2, NOW(), false)
     ON CONFLICT (user_id, artist_id) DO UPDATE
       SET follow_date = NOW()
     RETURNING artist_id;`,
    [id, artist_id]
  );

  console.log(`User ${id} followed artist ${artist_id}`);
  res.status(201).json({ artist_id: insertResult.rows[0].artist_id });
});

app.delete('/accounts/:id/follows/:artistId', async (req, res) => {
  const { id, artistId } = req.params;
  await pool.query('DELETE FROM follow WHERE user_id = $1 AND artist_id = $2;', [id, artistId]);
  console.log(`User ${id} unfollowed artist ${artistId}`);
  res.status(204).send();
});

app.get('/accounts/:id/playlists', async (req, res) => {
  const { id } = req.params;
  res.set('Cache-Control', 'no-store');
  const result = await pool.query(
    `SELECT
      p.id,
      p.playlist_name,
      p.duration,
      p.is_explicit,
      p.created_date,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'track_number', ps.pos,
          'song_title', s.song_title,
          'duration', s.duration,
          'is_explicit', s.is_explicit
        ) ORDER BY ps.pos), '[]'::json)
        FROM playlist_song ps
        JOIN song s ON s.id = ps.song_id
        WHERE ps.playlist_id = p.id
      ) AS tracks
    FROM playlist p
    WHERE p.user_id = $1
    ORDER BY p.created_date DESC;`,
    [id]
  );

  console.log(`Returning ${result.rowCount} playlists for account ${id}`);
  res.json(result.rows);
});

app.get('/accounts/:id/discover-artists', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT
      a.id AS artist_id,
      a.artist_name,
      a.bio,
      a.genre,
      a.artist_language,
      a.start_date,
      a.artist_image,
      false AS is_following,
      false AS is_favorite,
      (
        SELECT COALESCE(json_agg(json_build_object(
          'id', al.id,
          'name', al.album_name,
          'release_date', al.release_date,
          'image', al.album_image,
          'external_id', al.external_id
        )), '[]'::json)
        FROM (
          SELECT al.*
          FROM album al
          WHERE al.artist_id = a.id
          ORDER BY COALESCE(al.release_date, '1970-01-01') DESC
          LIMIT 3
        ) al
      ) AS albums
    FROM artist a
    WHERE NOT EXISTS (
      SELECT 1 FROM follow f WHERE f.user_id = $1 AND f.artist_id = a.id
    )
    ORDER BY random()
    LIMIT 9;`,
    [id]
  );

  console.log(`Returning ${result.rowCount} discover artists for account ${id}`);
  res.json(result.rows);
});

app.post('/accounts/:id/playlists', async (req, res) => {
  const { id } = req.params;
  const { playlist_name } = req.body;

  if (!playlist_name) {
    res.status(400).json({ message: 'Playlist name is required' });
    return;
  }

  const playlistResult = await pool.query(
    `INSERT INTO playlist (user_id, playlist_name, created_date)
     VALUES ($1, $2, NOW())
     RETURNING id, playlist_name, is_explicit, created_date;`,
    [id, playlist_name]
  );

  const playlistId = playlistResult.rows[0]?.id;

  const trackRows = await pool.query(
    `SELECT
      s.track_number,
      s.song_title,
      s.duration,
      s.is_explicit,
      s.id
     FROM song s
     JOIN follow f ON f.artist_id = s.artist_id
     WHERE f.user_id = $1
     ORDER BY random()
     LIMIT 3;`,
    [id]
  );

  await Promise.all(
    trackRows.rows.map((track, idx) =>
      pool.query(
        `INSERT INTO playlist_song (playlist_id, song_id, date_added, pos)
         VALUES ($1, $2, NOW(), $3)
         ON CONFLICT DO NOTHING;`,
        [playlistId, track.id, idx + 1]
      )
    )
  );

  const responsePayload = {
    ...playlistResult.rows[0],
    tracks: trackRows.rows.map((track, idx) => ({
      track_number: track.track_number || idx + 1,
      song_title: track.song_title,
      duration: track.duration,
      is_explicit: track.is_explicit
    }))
  };

  res.status(201).json(responsePayload);
});

app.get('/albums/:id/tracks', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT song_title AS title,
            track_number,
            duration,
            is_explicit
     FROM song
     WHERE album_id = $1
     ORDER BY track_number;`,
    [id]
  );

  console.log(`Fetched ${result.rowCount} tracks for album ${id}`);
  res.json(result.rows);
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

app.post('/accounts', async (req, res) => {
  const { user_name, email, subscription_type } = req.body;

  if (!user_name || !email) {
    res.status(400).json({ message: 'Name and email are required' });
    return;
  }

  const result = await pool.query(
    `INSERT INTO account (user_name, email, subscription_type)
     VALUES ($1, $2, $3)
     RETURNING id, user_name, email, subscription_type, date_joined;`,
    [user_name, email, subscription_type || 'Standard']
  );

  const created = result.rows[0];
  console.log('Created account:', created);
  res.status(201).json(created);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
