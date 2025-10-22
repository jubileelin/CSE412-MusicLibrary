-- 001_create_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- for text similarity / trigram indexes (optional)
CREATE EXTENSION IF NOT EXISTS citext;  -- case-insensitive text (optional)

-- USERS
CREATE TABLE Users (
  userId UUID PRIMARY KEY DEFAULT uuid_generate_v4(), --autogenerate a random id
  userName VARCHAR(255) NOT NULL UNIQUE,
  email CITEXT NOT NULL UNIQUE,
  subscriptionType VARCHAR(255),
  dateJoined DATE DEFAULT now(),
);

-- EXTERNAL DATA SOURCES (Spotify, Apple, etc.)
CREATE TABLE data_sources (
  id SERIAL PRIMARY KEY,
  userName VARCHAR(100) NOT NULL UNIQUE,
  api_base_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ARTISTS
CREATE TABLE Artists (
  artistId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artistName VARCHAR(255) NOT NULL,
  genre VARCHAR(255),
  artistLanguage VARCHAR(255),
  bio TEXT,
  startDate DATE DEFAULT now()
);

-- PLAYLISTS
CREATE TABLE Playlists (
  playlistId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID REFERENCES Users(userId) ON DELETE CASCADE,
  playlistName VARCHAR(255) NOT NULL,
  duration TIME,
  isExplicit BOOLEAN,
  createdDate DATE DEFAULT now()
);

--???
-- Artist external IDs to map to Spotify/Apple objects
CREATE TABLE artist_external_ids (
  artistId UUID REFERENCES artists(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  external_artist_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (artist_id, source_id)
);

-- ALBUMS
CREATE TABLE Albums (
  albumId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artistId UUID REFERENCES Artists(artistId) ON DELETE SET NULL,
  albumName VARCHAR(255) NOT NULL,
  duration TIME,
  genre VARCHAR(255),
  releaseDate DATE,
  externalId VARCHAR(255),
);

-- SONGS
CREATE TABLE Songs (
  songId UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artistId UUID REFERENCES Artists(artistId) ON DELETE SET NULL,
  albumId UUID REFERENCES Albums(albumId) ON DELETE SET NULL,
  trackNumber INTEGER,
  songTitle VARCHAR(400) NOT NULL,
  duration INTEGER,
  isExplicit BOOLEAN,
  releaseDate DATE,
);

-- Map track to multiple external sources (Spotify track id, Apple id, etc.)
CREATE TABLE song_external_ids (
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  source_id INTEGER REFERENCES data_sources(id) ON DELETE SET NULL,
  external_track_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (track_id, source_id)
);

-- GENRES and many-to-many track_genres
CREATE TABLE genres (
  genreId SERIAL PRIMARY KEY,
  genreName VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE track_genres (
  songId UUID REFERENCES tracks(id) ON DELETE CASCADE,
  genreId INTEGER REFERENCES genres(genreId) ON DELETE CASCADE,
  PRIMARY KEY (songIid, genreId)
);

-- USER follows ARTIST
CREATE TABLE Follows (
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  artistId UUID REFERENCES artists(id) ON DELETE CASCADE,
  followDate DATE,
  isFavorite BOOLEAN,
  comment TEXT,
  PRIMARY KEY (userId, artistId)
);

CREATE TABLE PlaylistSongs (
  playlistId UUID REFERENCES Playlists(playlistId) ON DELETE CASCADE,
  songId UUID REFERENCES Songs(songId) ON DELETE SET NULL,
  dateAdded DATE,
  PRIMARY KEY (playlistId, songId),
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
