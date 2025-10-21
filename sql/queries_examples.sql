-- 1) Search tracks by title (case-insensitive & trigram similarity)
-- Find tracks with title like 'midnight' ordered by similarity
SELECT id, title, release_date, popularity
FROM tracks
WHERE title ILIKE '%midnight%'
ORDER BY similarity(title, 'midnight') DESC, popularity DESC
LIMIT 25;

-- 2) Search across track + artist + album text using full-text (you could build tsvector)
-- Example assuming you have a tsvector column 'search_vector'
-- SELECT t.id, t.title, a.name AS artist, al.title AS album
-- FROM tracks t
-- JOIN albums al ON al.id = t.album_id
-- JOIN artists a ON a.id = al.artist_id
-- WHERE to_tsvector(coalesce(t.title,'') || ' ' || coalesce(a.name,'') || ' ' || coalesce(al.title,'')) @@ plainto_tsquery('electronic');

-- 3) Filter discovery: get popular synthwave tracks released after 2020
SELECT t.id, t.title, t.release_date, t.popularity, a.name AS artist
FROM tracks t
JOIN track_genres tg ON tg.track_id = t.id
JOIN genres g ON g.id = tg.genre_id
LEFT JOIN albums al ON al.id = t.album_id
LEFT JOIN artists a ON a.id = al.artist_id
WHERE g.name = 'Synthwave' AND t.release_date >= '2020-01-01'
ORDER BY t.popularity DESC
LIMIT 50;

-- 4) Get artists followed by a user
SELECT a.id, a.name, f.created_at AS followed_at
FROM follows f
JOIN artists a ON a.id = f.artist_id
WHERE f.user_id = (SELECT id FROM users WHERE username='alice')
ORDER BY f.created_at DESC;

-- 5) Get comments about an artist (with user info)
SELECT c.id, u.username, u.display_name, c.body, c.created_at
FROM comments c
LEFT JOIN users u ON u.id = c.user_id
WHERE c.artist_id = (SELECT id FROM artists WHERE name='Synth Waves')
ORDER BY c.created_at DESC;

-- 6) Add a new follow (INSERT) with check to avoid duplicates (INSERT ... ON CONFLICT)
INSERT INTO follows (user_id, artist_id)
VALUES (
  (SELECT id FROM users WHERE username='alice'),
  (SELECT id FROM artists WHERE name='The Blue Notes')
)
ON CONFLICT (user_id, artist_id) DO NOTHING;

-- 7) Mark artist as favorite (upsert)
INSERT INTO favorites (user_id, artist_id)
VALUES (
  (SELECT id FROM users WHERE username='bob'),
  (SELECT id FROM artists WHERE name='Synth Waves')
)
ON CONFLICT (user_id, artist_id) DO UPDATE SET created_at = EXCLUDED.created_at;

-- 8) Add a comment (INSERT)
INSERT INTO comments (user_id, artist_id, body)
VALUES (
  (SELECT id FROM users WHERE username='bob'),
  (SELECT id FROM artists WHERE name='The Blue Notes'),
  'This track saved my weekend!'
);

-- 9) Update track popularity (UPDATE)
UPDATE tracks
SET popularity = GREATEST(0, popularity + 1)
WHERE id = (SELECT id FROM tracks WHERE title = 'Midnight Drive');

-- 10) Delete an old ingestion record (DELETE)
DELETE FROM ingestions WHERE ingested_at < now() - interval '90 days';
