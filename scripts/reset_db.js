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

const reset = async () => {
  console.log('Resetting database…');
  try {
    await pool.query('BEGIN;');
    await pool.query(
      `TRUNCATE
        playlist_song,
        follow,
        song_external_id,
        song_genre,
        song,
        album,
        playlist,
        artist_external_id,
        artist,
        account,
        genre,
        data_source
      RESTART IDENTITY CASCADE;`
    );
    await pool.query('COMMIT;');
    const sampleAccounts = [
      { user_name: 'alice', email: 'alice@example.com', subscription_type: 'free' },
      { user_name: 'bob', email: 'bob@example.com', subscription_type: 'premium' }
    ];
    for (const account of sampleAccounts) {
      await pool.query(
        `INSERT INTO account (user_name, email, subscription_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_name) DO UPDATE
           SET email = EXCLUDED.email,
               subscription_type = EXCLUDED.subscription_type;`,
        [account.user_name, account.email, account.subscription_type]
      );
    }
    console.log('Database tables truncated and identities reset.');
    console.log('Run `npm run seed-artists` to repopulate sample data.');
  } catch (error) {
    await pool.query('ROLLBACK;');
    console.error('Database reset failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

reset();

