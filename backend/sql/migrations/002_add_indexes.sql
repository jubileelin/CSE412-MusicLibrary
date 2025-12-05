-- 002_add_indexes.sql
-- Additional indexes and constraints for performance/search

-- Trigram search indexes for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_artist_name_trgm
  ON artist USING gin (artist_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_song_title_trgm
  ON song USING gin (song_title gin_trgm_ops);

-- Common lookup indexes
CREATE INDEX IF NOT EXISTS idx_song_release_date
  ON song (release_date);

CREATE INDEX IF NOT EXISTS idx_album_release_date
  ON album (release_date);

CREATE INDEX IF NOT EXISTS idx_genre_name
  ON genre (genre_name);

-- Foreign key optimization (optional, improves join speed)
CREATE INDEX IF NOT EXISTS idx_playlist_user
  ON playlist (user_id);

CREATE INDEX IF NOT EXISTS idx_follow_user
  ON follow (user_id);

CREATE INDEX IF NOT EXISTS idx_follow_artist
  ON follow (artist_id);

CREATE INDEX IF NOT EXISTS idx_song_album
  ON song (album_id);

CREATE INDEX IF NOT EXISTS idx_song_artist
  ON song (artist_id);
