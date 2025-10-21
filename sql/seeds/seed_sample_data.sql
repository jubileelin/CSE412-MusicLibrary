-- seed_sample_data.sql

-- Data sources
INSERT INTO data_sources (name, api_base_url) VALUES
  ('spotify', 'https://api.spotify.com'),
  ('apple_music', 'https://api.music.apple.com');

-- Users
INSERT INTO users (id, username, email, display_name)
VALUES
  (uuid_generate_v4(), 'alice', 'alice@example.com', 'Alice'),
  (uuid_generate_v4(), 'bob', 'bob@example.com', 'Bob');

-- Artists
INSERT INTO artists (id, name, popularity) VALUES
  (uuid_generate_v4(), 'The Blue Notes', 70),
  (uuid_generate_v4(), 'Synth Waves', 85);

-- Albums
INSERT INTO albums (id, title, artist_id, release_date) VALUES
  (uuid_generate_v4(), 'Blue Album', (SELECT id FROM artists WHERE name='The Blue Notes'), '2020-03-01'),
  (uuid_generate_v4(), 'Neon Nights', (SELECT id FROM artists WHERE name='Synth Waves'), '2022-07-15');

-- Tracks
INSERT INTO tracks (id, title, album_id, duration_seconds, track_number, release_date, popularity) VALUES
  (uuid_generate_v4(), 'Blue Sunrise', (SELECT id FROM albums WHERE title='Blue Album'), 210, 1, '2020-03-01', 60),
  (uuid_generate_v4(), 'Midnight Drive', (SELECT id FROM albums WHERE title='Neon Nights'), 245, 1, '2022-07-15', 88);

-- Genres
INSERT INTO genres (name) VALUES ('Jazz'), ('Synthwave'), ('Electronic');

-- Track genres
INSERT INTO track_genres (track_id, genre_id)
VALUES
  ((SELECT id FROM tracks WHERE title='Blue Sunrise'), (SELECT id FROM genres WHERE name='Jazz')),
  ((SELECT id FROM tracks WHERE title='Midnight Drive'), (SELECT id FROM genres WHERE name='Synthwave'));

-- Follows & favorites
INSERT INTO follows (user_id, artist_id) VALUES
  ((SELECT id FROM users WHERE username='alice'), (SELECT id FROM artists WHERE name='Synth Waves'));

INSERT INTO favorites (user_id, artist_id) VALUES
  ((SELECT id FROM users WHERE username='bob'), (SELECT id FROM artists WHERE name='The Blue Notes'));

-- Comments
INSERT INTO comments (user_id, artist_id, body)
VALUES
  ((SELECT id FROM users WHERE username='alice'), (SELECT id FROM artists WHERE name='Synth Waves'), 'Love their latest synth textures!');
