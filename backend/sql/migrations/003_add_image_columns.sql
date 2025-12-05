-- 003_add_image_columns.sql
ALTER TABLE artist
  ADD COLUMN IF NOT EXISTS artist_image TEXT;

ALTER TABLE album
  ADD COLUMN IF NOT EXISTS album_image TEXT;

