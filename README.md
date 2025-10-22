to start repository and setup project:

git clone ...
make sure docker is open and running
cd ~/CSE412-MusicLibrary
docker-compose up -d
cd backend && npm install && npm run dev

to start and run database:
docker exec -it music_pg psql -U pguser -d music_db
psql -h localhost -U pguser -d music_db -f sql/migrations/001_create_tables.sql
password is pgpass

psql -h localhost -U pguser -d music_db -f sql/seeds/seed_sample_data.sql
psql -h localhost -U pguser -d music_db -f sql/migrations/002_add_indexes.sql
\di  -- list all indexes in psql
music-library/
├─ README.md
├─ .gitignore
├─ docker-compose.yml
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ sql/
│  ├─ migrations/
│  │  ├─ 001_create_tables.sql
│  │  └─ 002_add_indexes.sql
│  ├─ seeds/
│  │  └─ seed_sample_data.sql
│  └─ queries_examples.sql
├─ data/
│  ├─ artists.csv
│  ├─ albums.csv
│  └─ tracks.csv
├─ scripts/
│  ├─ run_migrate.sh
│  ├─ gen_seed_data.py
│  └─ ingest_spotify.js
├─ backend/
│  ├─ package.json
│  ├─ src/
│  │  ├─ server.ts / server.js
│  │  ├─ db/
│  │  │  ├─ index.js                ← initializes pg connection pool
│  │  │  ├─ migrations.js           ← helper to run SQL migrations
│  │  │  └─ queries/
│  │  │     ├─ search.js            ← sample search query
│  │  │     ├─ artists.js
│  │  │     └─ comments.js
│  │  └─ routes/
│  │     ├─ searchRoutes.js
│  │     ├─ artistRoutes.js
│  │     └─ userRoutes.js
│  └─ tests/
│     └─ integration.test.js
├─ frontend/
│  ├─ package.json
│  └─ src/
│     ├─ App.tsx
│     ├─ pages/
│     └─ components/
└─ docs/
   ├─ demo_instructions.md
   └─ architecture.md