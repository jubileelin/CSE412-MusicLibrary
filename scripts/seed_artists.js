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
  'Billie Eilish',
  'The Weeknd',
  'Adele',
  'Ed Sheeran',
  'Bruno Mars',
  'Halsey',
  'Dua Lipa',
  'SZA',
  'Ariana Grande',
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

const fetchAlbumsForArtist = async (name) => {
  const url = `${BASE_URL}/${THEAUDIODB_KEY}/searchalbum.php?s=${encodeURIComponent(name)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch albums for ${name}: ${response.statusText}`);
  }
  const data = await response.json();
  return data.album || [];
};

const fetchTracksForAlbum = async (albumExternalId) => {
  if (!albumExternalId) {
    return [];
  }
  const url = `${BASE_URL}/${THEAUDIODB_KEY}/track.php?m=${albumExternalId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch tracks for album ${albumExternalId}: ${response.statusText}`);
  }
  const data = await response.json();
  return data.track || [];
};

const createPlaylistForUser = async (userName, playlistName, offset = 0) => {
  const accountResult = await pool.query('SELECT id FROM account WHERE user_name = $1', [userName]);
  if (accountResult.rowCount === 0) {
    console.log(`  ➜ account ${userName} missing, skipping playlist ${playlistName}`);
    return;
  }

  const userId = accountResult.rows[0].id;
  await pool.query(
    `DELETE FROM playlist_song
     WHERE playlist_id IN (
       SELECT id FROM playlist WHERE user_id = $1 AND playlist_name = $2
     );`,
    [userId, playlistName]
  );
  await pool.query('DELETE FROM playlist WHERE user_id = $1 AND playlist_name = $2;', [userId, playlistName]);

  const playlistResult = await pool.query(
    `INSERT INTO playlist (user_id, playlist_name, created_date)
     VALUES ($1, $2, NOW())
     RETURNING id;`,
    [userId, playlistName]
  );
  const playlistId = playlistResult.rows[0]?.id;
  if (!playlistId) {
    return;
  }

  const tracksResult = await pool.query(
    `SELECT id FROM song
     ORDER BY release_date DESC NULLS LAST
     LIMIT 3
     OFFSET $1;`,
    [offset]
  );

  if (tracksResult.rowCount === 0) {
    console.log(`  ➜ no songs available for ${playlistName}`);
    return;
  }

  for (const [index, trackRow] of tracksResult.rows.entries()) {
    await pool.query(
      `INSERT INTO playlist_song (playlist_id, song_id, date_added, pos)
       VALUES ($1, $2, NOW(), $3)
       ON CONFLICT DO NOTHING;`,
      [playlistId, trackRow.id, index + 1]
    );
  }

  console.log(`  ➜ created playlist "${playlistName}" for ${userName}`);
};

const ensureImageColumns = async () => {
  await pool.query(`
    ALTER TABLE artist
    ADD COLUMN IF NOT EXISTS artist_image TEXT;
  `);
  await pool.query(`
    ALTER TABLE album
    ADD COLUMN IF NOT EXISTS album_image TEXT;
  `);
};

const seed = async () => {
  await ensureImageColumns();
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

      const albums = await fetchAlbumsForArtist(artist.strArtist);
      if (albums.length === 0) {
        console.log(`  ➜ ${artist.strArtist} has no albums in TheAudioDB, skipping`);
        continue;
      }
      const sortedByPopularity = albums
        .map((album) => ({
          ...album,
          popularity: parseInt(album.intScore, 10) || parseInt(album.intLoved ?? 0, 10) || 0,
          year: parseInt(album.intYearReleased, 10) || 0
        }))
        .sort((a, b) => {
          if (b.popularity !== a.popularity) {
            return b.popularity - a.popularity;
          }
          return b.year - a.year;
        });
      const limitedAlbums = sortedByPopularity.slice(0, 3);

      const artistImage =
        artist.strArtistThumb || artist.strArtistBanner || artist.strArtistClearart || null;
      const insertResult = await pool.query(
        `INSERT INTO artist (artist_name, genre, artist_language, bio, start_date, artist_image)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id;`,
        [
          artist.strArtist,
          artist.strGenre || null,
          artist.strArtist == null ? null : artist.strArtistLocale || null,
          artist.strBiographyEN || null,
          artist.intFormedYear ? `${artist.intFormedYear}-01-01` : null,
          artistImage
        ]
      );

      const artistId = insertResult.rows[0].id;
      insertedArtistIds.push(artistId);
      console.log(`  ➜ inserted ${artist.strArtist} (id=${artistId})`);

      console.log(`    › found ${albums.length} albums for ${artist.strArtist} (using top ${limitedAlbums.length} by popularity)`);

      for (const album of limitedAlbums) {
        const albumExternalId = album.idAlbum;
        const albumLabel = album.strAlbum || 'Unknown Album';
        const releaseDate = album.intYearReleased
          ? `${album.intYearReleased}-01-01`
          : album.strReleaseDate || null;
        const existingAlbum = await pool.query(
          'SELECT id FROM album WHERE artist_id = $1 AND external_id = $2 LIMIT 1;',
          [artistId, albumExternalId]
        );

        let storedAlbumId;

        if (existingAlbum.rowCount > 0) {
          storedAlbumId = existingAlbum.rows[0].id;
        } else {
          const albumImage = album.strAlbumThumb || album.strAlbumCDart || null;
          const insertAlbumResult = await pool.query(
            `INSERT INTO album (artist_id, album_name, genre, release_date, external_id, album_image)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id;`,
            [
              artistId,
              album.strAlbum || 'Unknown Album',
              album.strGenre || artist.strGenre || null,
              releaseDate,
              albumExternalId,
              albumImage
            ]
          );
          storedAlbumId = insertAlbumResult.rows[0]?.id;
          if (storedAlbumId) {
            console.log(`    ➜ inserted album ${albumLabel} (id=${storedAlbumId})`);
          }
        }

        if (!storedAlbumId) {
          continue;
        }

        const tracks = await fetchTracksForAlbum(albumExternalId);
        console.log(`      › album ${albumLabel} has ${tracks.length} tracks`);

        for (const track of tracks) {
          if (!track.strTrack) {
            continue;
          }
          const trackNumber = track.intTrackNumber ? parseInt(track.intTrackNumber, 10) : null;
          const durationSeconds = track.intDuration ? Math.round(parseInt(track.intDuration, 10) / 1000) : null;
          const isExplicit = track.strExplicit?.toLowerCase() === 'explicit';
          const existingTrack = await pool.query(
            'SELECT 1 FROM song WHERE album_id = $1 AND track_number = $2 AND song_title = $3 LIMIT 1;',
            [storedAlbumId, trackNumber, track.strTrack]
          );
          if (existingTrack.rowCount > 0) {
            continue;
          }

          await pool.query(
            `INSERT INTO song (artist_id, album_id, track_number, song_title, duration, is_explicit, release_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [
              artistId,
              storedAlbumId,
              trackNumber,
              track.strTrack,
              durationSeconds,
              isExplicit,
              track.strReleaseDate || null
            ]
          );
        }
        await delay(300);
      }

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

    await createPlaylistForUser('alice', 'Alice Morning Drive', 0);
    await createPlaylistForUser('bob', 'Bob Midnight Ride', 3);

    console.log('Artist seeding complete');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await pool.end();
  }
};

seed();

