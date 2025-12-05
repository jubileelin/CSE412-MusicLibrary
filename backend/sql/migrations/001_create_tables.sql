-- 001_create_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS citext;

-- user
CREATE TABLE account (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  subscription_type VARCHAR(255),
  date_joined DATE DEFAULT now()
);

-- data_source (Spotify, Apple, etc.)
CREATE TABLE data_source (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL UNIQUE,
  api_base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- artist
CREATE TABLE artist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_name VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  artist_language VARCHAR(255),
  bio TEXT,
  start_date DATE DEFAULT now()
);

-- playlist
CREATE TABLE playlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES account(id) ON DELETE CASCADE,
  playlist_name VARCHAR(255) NOT NULL,
  duration TIME,
  is_explicit BOOLEAN,
  created_date DATE DEFAULT now()
);

-- artist_external_id
CREATE TABLE artist_external_id (
  artist_id UUID REFERENCES artist(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_source(id) ON DELETE SET NULL,
  external_artist_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (artist_id, source_id)
);

-- album
CREATE TABLE album (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist(id) ON DELETE SET NULL,
  album_name VARCHAR(255) NOT NULL,
  duration TIME,
  genre VARCHAR(255),
  release_date DATE,
  external_id VARCHAR(255)
);

-- song
CREATE TABLE song (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist(id) ON DELETE SET NULL,
  album_id UUID REFERENCES album(id) ON DELETE SET NULL,
  track_number INTEGER,
  song_title VARCHAR(400) NOT NULL,
  duration INTEGER,
  is_explicit BOOLEAN,
  release_date DATE
);

-- song_external_id
CREATE TABLE song_external_id (
  song_id UUID REFERENCES song(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_source(id) ON DELETE SET NULL,
  external_track_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (song_id, source_id)
);

-- genre
CREATE TABLE genre (
  id SERIAL PRIMARY KEY,
  genre_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE song_genre (
  song_id UUID REFERENCES song(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genre(id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, genre_id)
);

-- follow (user follows artist)
CREATE TABLE follow (
  user_id UUID REFERENCES account(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artist(id) ON DELETE CASCADE,
  follow_date DATE,
  is_favorite BOOLEAN,
  comment TEXT,
  PRIMARY KEY (user_id, artist_id)
);

-- playlist_song
CREATE TABLE playlist_song (
  playlist_id UUID REFERENCES playlist(id) ON DELETE CASCADE,
  song_id UUID REFERENCES song(id) ON DELETE SET NULL,
  date_added DATE,
  pos INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, song_id)
);

-- indexes
CREATE INDEX idx_artist_artist_name_trgm ON artist USING gin (artist_name gin_trgm_ops);
CREATE INDEX idx_song_song_title_trgm ON song USING gin (song_title gin_trgm_ops);

CREATE INDEX idx_song_release_date ON song(release_date);
CREATE INDEX idx_album_release_date ON album(release_date);
CREATE INDEX idx_genre_genre_name ON genre(genre_name);
