-- seed_sample_data.sql

-- data sources
INSERT INTO data_source (user_name, api_base_url)
VALUES
  ('spotify', 'https://api.spotify.com'),
  ('apple_music', 'https://api.music.apple.com')
ON CONFLICT DO NOTHING;

-- accounts
INSERT INTO account (id, user_name, email, subscription_type, date_joined)
VALUES
  (uuid_generate_v4(), 'alice', 'alice@example.com', 'free', '2024-01-15'),
  (uuid_generate_v4(), 'bob', 'bob@example.com', 'premium', '2024-06-10');

-- artists
INSERT INTO artist (id, artist_name, genre, artist_language, bio, start_date)
VALUES
  (uuid_generate_v4(), 'The Blue Notes', 'Jazz', 'English', 'Indie jazz band.', '2015-03-01'),
  (uuid_generate_v4(), 'Synth Waves', 'Synthwave', 'English', 'Electronic synth duo.', '2019-05-20');

-- albums
INSERT INTO album (id, artist_id, album_name, duration, genre, release_date, external_id)
VALUES
  (uuid_generate_v4(),
   (SELECT id FROM artist WHERE artist_name = 'The Blue Notes'),
   'Blue Album', NULL, 'Jazz', '2020-03-01', 'ext-album-001'),
  (uuid_generate_v4(),
   (SELECT id FROM artist WHERE artist_name = 'Synth Waves'),
   'Neon Nights', NULL, 'Synthwave', '2022-07-15', 'ext-album-002');

-- songs
INSERT INTO song (id, artist_id, album_id, track_number, song_title, duration, is_explicit, release_date)
VALUES
  (uuid_generate_v4(),
   (SELECT id FROM artist WHERE artist_name = 'The Blue Notes'),
   (SELECT id FROM album WHERE album_name = 'Blue Album'),
   1, 'Blue Sunrise', 210, false, '2020-03-01'),
  (uuid_generate_v4(),
   (SELECT id FROM artist WHERE artist_name = 'Synth Waves'),
   (SELECT id FROM album WHERE album_name = 'Neon Nights'),
   1, 'Midnight Drive', 245, false, '2022-07-15');

-- genres
INSERT INTO genre (genre_name)
VALUES ('Jazz'), ('Synthwave')
ON CONFLICT DO NOTHING;

-- song_genres
INSERT INTO song_genre (song_id, genre_id)
VALUES
  ((SELECT id FROM song WHERE song_title = 'Blue Sunrise'),
   (SELECT id FROM genre WHERE genre_name = 'Jazz')),
  ((SELECT id FROM song WHERE song_title = 'Midnight Drive'),
   (SELECT id FROM genre WHERE genre_name = 'Synthwave'));

-- artist_external_ids
INSERT INTO artist_external_id (artist_id, source_id, external_artist_id)
VALUES
  ((SELECT id FROM artist WHERE artist_name = 'The Blue Notes'),
   (SELECT id FROM data_source WHERE user_name='spotify'),
   'spotify-artist-111'),
  ((SELECT id FROM artist WHERE artist_name = 'Synth Waves'),
   (SELECT id FROM data_source WHERE user_name='spotify'),
   'spotify-artist-222');

-- song_external_ids
INSERT INTO song_external_id (song_id, source_id, external_track_id)
VALUES
  ((SELECT id FROM song WHERE song_title = 'Blue Sunrise'),
   (SELECT id FROM data_source WHERE user_name='spotify'),
   'spotify-track-123'),
  ((SELECT id FROM song WHERE song_title = 'Midnight Drive'),
   (SELECT id FROM data_source WHERE user_name='spotify'),
   'spotify-track-456');

-- playlists
INSERT INTO playlist (id, user_id, playlist_name, duration, is_explicit, created_date)
VALUES
  (uuid_generate_v4(),
   (SELECT id FROM account WHERE user_name='alice'),
   'Morning Drive', NULL, false, '2024-10-01');

-- playlist_songs
INSERT INTO playlist_song (playlist_id, song_id, date_added, pos)
VALUES
  ((SELECT id FROM playlist WHERE playlist_name='Morning Drive'),
   (SELECT id FROM song WHERE song_title='Midnight Drive'),
   '2024-10-10', 1);

-- follows
INSERT INTO follow (user_id, artist_id, follow_date, is_favorite, comment)
VALUES
  ((SELECT id FROM account WHERE user_name='alice'),
   (SELECT id FROM artist WHERE artist_name='Synth Waves'),
   '2024-10-11', true, 'Love their latest album!');
