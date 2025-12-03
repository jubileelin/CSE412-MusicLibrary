import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: './backend/.env' });

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

const artistNames = [
  'Coldplay',
  'Daft Punk',
  'Lorde',
  'Sabrina Carpenter',
  'Billie Eilish',
  'The Weeknd',
  'Adele',
  'Fujii Kaze',
  'Arctic Monkeys',
  'Halsey',
  'The Marias',
  'Taylor Swift',
  'Ariana Grande',
  'Justin Bieber',
  'Ed Sheeran',
  'Dua Lipa',
  'Katy Perry',
  'Lady Gaga',
  'Beyonce',
];

const THEAUDIODB_KEY = '123';
const BASE_URL = 'https://www.theaudiodb.com/api/v1/json';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchArtist = async (name) => {
  const url = `${BASE_URL}/${THEAUDIODB_KEY}/search.php?s=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${name}: ${response.statusText}`);
  }
  const data = await response.json();
  return data.artists?.[0] || null;
};

const seed = async () => {
  try {
    console.log('Seeding artists via TheAudioDB...');
    const insertedArtistIds = [];

    for (const name of artistNames) {
      console.log(`Fetching artist metadata for ${name}...`);
      const artist = await fetchArtist(name);
      if (!artist) {
        console.log(`  ➜ no data found for ${name}; skipping`);
        continue;
      }

      const existing = await pool.query('SELECT id FROM artist WHERE artist_name = $1', [
        artist.strArtist
      ]);
      if (existing.rowCount > 0) {
        console.log(`  ➜ ${artist.strArtist} already exists (skipping insert)`);
        insertedArtistIds.push(existing.rows[0].id);
        continue;
      }

      const insertResult = await pool.query(
        `INSERT INTO artist (artist_name, genre, artist_language, bio, start_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id;`,
        [
          artist.strArtist,
          artist.strGenre || null,
          artist.strArtist == null ? null : artist.strArtistLocale || null,
          artist.strBiographyEN || null,
          artist.intFormedYear ? `${artist.intFormedYear}-01-01` : null
        ]
      );

      const artistId = insertResult.rows[0].id;
      insertedArtistIds.push(artistId);
      console.log(`  ➜ inserted ${artist.strArtist} (id=${artistId})`);

      await delay(500);
    }

    if (insertedArtistIds.length === 0) {
      console.log('No new artists to follow. Aborting follow creation.');
      return;
    }

    const accountsRes = await pool.query('SELECT id FROM account');
    if (accountsRes.rowCount === 0) {
      console.log('No accounts found to follow artists.');
      return;
    }

    for (const { id: userId } of accountsRes.rows) {
      const shuffled = insertedArtistIds.sort(() => Math.random() - 0.5).slice(0, 3);
      for (const artistId of shuffled) {
        await pool.query(
          `INSERT INTO follow (user_id, artist_id, follow_date, is_favorite)
           VALUES ($1, $2, NOW(), $3)
           ON CONFLICT DO NOTHING;`,
          [userId, artistId, Math.random() > 0.7]
        );
      }
      console.log(`  ➜ user ${userId} now follows ${shuffled.length} new artists`);
    }

    console.log('Artist seeding complete');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await pool.end();
  }
};

seed();

