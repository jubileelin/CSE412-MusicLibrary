to start repository and setup project:

git clone ...
make sure docker is open and running
cd ~/CSE412-MusicLibrary
docker-compose up -d
cd backend
npm install


populate database:

psql -h localhost -U pguser -d music_db -f sql/migrations/001_create_tables.sql

password is pgpass

psql -h localhost -U pguser -d music_db -f sql/seeds/seed_sample_data.sql

psql -h localhost -U pguser -d music_db -f sql/migrations/002_add_indexes.sql



to start and run database:

docker exec -it music_pg psql -U pguser -d music_db

\di  -- list all indexes in psql

example queries: 
INSERT INTO artist (id, artist_name, genre, artist_language, bio, start_date)
VALUES
  (uuid_generate_v4(), 'Fujii Kaze', 'J-Pop', 'Japanese', 'Japanese singer-songwriter', '2019-11-18'),
  (uuid_generate_v4(), 'Eminem', 'Hip-Hop', 'English', 'American rapper and songwriter', '1998-03-09'),
  (uuid_generate_v4(), 'Sabrina Carpenter', 'Pop', 'English', 'American singer, songwriter, and actress', '2014-04-08');

SELECT * FROM artist ORDER BY start_date;




UPDATE artist
SET bio = 'japanese singer-songwriter and pianist'
WHERE artist_name = 'Fujii Kaze';

DELETE FROM artist WHERE artist_name= 'Fujii Kaze';

SELECT id FROM artist WHERE artist_name = 'Eminem';

SELECT artist_name from artist WHERE genre = 'Pop';


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
│     ├─ index.js
│     ├─ App.js
│     ├─ styles/
│     │  └─ global.css
│     ├─ layouts/
│     │  └─ MainLayout/
│     │     └─ index.js
│     ├─ pages/
│     │  ├─ HomePage/
│     │  │  └─ index.js
│     │  ├─ ProfilePage/
│     │  │  └─ index.js
│     │  └─ DiscoverPage/
│     │     └─ index.js
│     └─ components/
│        ├─ NavigationSidebar/
│        │  └─ index.js
│        ├─ Home/
│        │  ├─ FollowedArtistCarousel/
│        │  │  └─ index.js
│        │  ├─ PlaylistCarousel/
│        │  │  └─ index.js
│        │  ├─ ArtistCard/
│        │  │  └─ index.js
│        │  ├─ AlbumCard/
│        │  │  └─ index.js
│        │  ├─ PlaylistCard/
│        │  │  └─ index.js
│        │  └─ RemoveSongCard/
│        │     └─ index.js
│        ├─ Profile/
│        │  └─ ProfileCard/
│        │     └─ index.js
│        └─ Discover/
│           ├─ SelectArtistCarousel/
│           │  └─ index.js
│           └─ ArtistCard/
│              └─ index.js
└─ docs/
   ├─ demo_instructions.md
   └─ architecture.md

## Frontend scaffold

The `frontend` folder currently hosts a minimal Node-based view layer. Pages map to the navigation items you described, with carousels and cards grouped by feature so you can hook in the database later.

```
frontend/
├── package.json
└── src/
    ├── index.js           ← entry point that loads global styles
    ├── App.js             ← top-level shell for sidebar + pages
    ├── styles/
    │   └── global.css     ← placeholder for shared styling
    ├── layouts/
    │   └── MainLayout/
    │       └── index.js   ← combines navigation + routed content
    ├── pages/
    │   ├── HomePage/
    │   │  └── index.js    ← followed artist + playlist carousels
    │   ├── ProfilePage/
    │   │  └── index.js    ← profile card area
    │   └── DiscoverPage/
    │      └── index.js    ← select artist carousel
    └── components/
        ├── NavigationSidebar/
        │  └── index.js    ← links to the three main pages
        ├── Home/
        │  ├── FollowedArtistCarousel/
        │  │  └── index.js
        │  ├── PlaylistCarousel/
        │  │  └── index.js
        │  ├── ArtistCard/
        │  │  └── index.js
        │  ├── AlbumCard/
        │  │  └── index.js
        │  ├── PlaylistCard/
        │  │  └── index.js
        │  └── RemoveSongCard/
        │     └── index.js
        ├── Profile/
        │  └── ProfileCard/
        │     └── index.js
        └── Discover/
           ├── SelectArtistCarousel/
           │  └── index.js
           └── ArtistCard/
              └── index.js
```

Each file currently returns `null` so you can start wiring routes and database data.