-- 001_create_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for text similarity / trigram indexes (optional)
CREATE EXTENSION IF NOT EXISTS citext;  -- case-insensitive text (optional)

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(80) NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  display_name VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- EXTERNAL DATA SOURCES (Spotify, Apple, etc.)
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  api_base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ARTISTS (core entity)
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  popularity INTEGER, -- normalized popularity score if available
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Artist external IDs to map to Spotify/Apple objects
CREATE TABLE artist_external_ids (
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  external_artist_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (artist_id, source_id)
);

-- ALBUMS
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  release_date DATE,
  label VARCHAR(255),
  external_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRACKS (songs)
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(400) NOT NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  track_number INTEGER,
  disc_number INTEGER,
  release_date DATE,
  popularity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Map track to multiple external sources (Spotify track id, Apple id, etc.)
CREATE TABLE track_external_ids (
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  external_track_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (track_id, source_id)
);

-- GENRES and many-to-many track_genres
CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE track_genres (
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (track_id, genre_id)
);

-- USER follows ARTIST (social)
CREATE TABLE follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, artist_id)
);

-- USER favorites (favorite artist)
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, artist_id)
);

-- COMMENTS about artists (social)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Simple audit table for ingestion/sync jobs (optional)
CREATE TABLE ingestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  external_id VARCHAR(255),
  object_type VARCHAR(50), -- 'artist'|'track'|'album'
  ingested_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- Playlist (optional)
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE playlist_items (
  id BIGSERIAL PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  pos INTEGER NOT NULL
);

-- Indexes for search & joins
CREATE INDEX idx_artists_name_trgm ON artists USING gin (name gin_trgm_ops);
CREATE INDEX idx_tracks_title_trgm ON tracks USING gin (title gin_trgm_ops);

CREATE INDEX idx_tracks_release_date ON tracks(release_date);
CREATE INDEX idx_tracks_popularity ON tracks(popularity);
CREATE INDEX idx_albums_release_date ON albums(release_date);
CREATE INDEX idx_genres_name ON genres(name);

-- Optional: materialized view or full-text search vector for combined searching
-- (example: tracks + artist name + album)
CREATE MATERIALIZED VIEW search_tracks AS
SELECT
  t.id AS track_id,
  t.title || ' ' || coalesce(a.name,'') || ' ' || coalesce(al.title,'') AS text_for_search,
  t.release_date,
  t.popularity
FROM tracks t
LEFT JOIN artists a ON a.id = alartist.id
LEFT JOIN albums al ON al.id = t.album_id
-- Note: above join to artists by album artist is illustrative; you'll likely link track->album->artist
WITH NO DATA;

-- Trigger updated_at on update for users and comments
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
