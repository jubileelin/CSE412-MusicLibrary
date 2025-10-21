# Demo steps (psql console)

1. Start DB:
   docker-compose up -d

2. Enter psql:
   psql -h localhost -U pguser -d music_db

3. Run DDL (if not auto-run):
   \i sql/migrations/001_create_tables.sql

4. Seed sample data:
   \i sql/seeds/seed_sample_data.sql

5. Run example queries:
   \i sql/queries_examples.sql

6. Show tables:
   \dt

7. Demonstrate:
   - Search: run the 'Search tracks by title' example.
   - Social: run SELECT for follows and run an INSERT follow.
   - Comments: INSERT a comment then SELECT comments for an artist.
