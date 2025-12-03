to start repository and setup project:

git clone ...
make sure docker is open and running
cd ~/CSE412-MusicLibrary
docker-compose up -d
cd backend
npm install


populate database:
cd /Users/jubileelin/CSE412-MusicLibrary
docker-compose up -d       # ensure Postgres is running
npm run seed-artists       # fetches artists, inserts them, and creates follow records



to start and run database:

docker exec -it music_pg psql -U pguser -d music_db

\di  -- list all indexes in psql






UPDATE artist
SET bio = 'japanese singer-songwriter and pianist'
WHERE artist_name = 'Fujii Kaze';

DELETE FROM artist WHERE artist_name= 'Fujii Kaze';

SELECT id FROM artist WHERE artist_name = 'Eminem';

SELECT artist_name from artist WHERE genre = 'Pop';


FRONTEND:
cd frontend
npm install        # installs Vite + React dependencies
npm run dev        # starts Vite's dev server at http://localhost:5173 (default)

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
│  ├─ package-lock.json
│  ├─ index.html
│  └─ src/
│     ├─ main.jsx
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

The frontend now runs on Vite + React so there is a proper dev server. `index.html` is the Vite entry point, `src/main.jsx` mounts `App`, and the styles live in `src/styles/global.css`. `App.jsx` renders `NavigationSidebar` alongside the `<Routes>` block, which keeps the sidebar visible as you move between the `Home`, `Profile`, and `Discover` pages. The component folders are still grouped under those sections so you can hook up the database data to carousels and cards once the UI wiring is ready.

```
frontend/
├── package.json
├── package-lock.json
├── index.html             ← Vite entry that loads `/src/main.jsx`
└── src/
    ├── main.jsx          ← mounts `App` into `#root`
    ├── App.jsx           ← top-level shell for sidebar + routed content
    ├── styles/
    │   └── global.css    ← shared base styling
    ├── layouts/
    │   └── MainLayout/
    │       └── index.jsx  ← navigation + page container
    ├── pages/
    │   ├── HomePage/
    │   │  └── index.jsx   ← followed artist + playlist carousels
    │   ├── ProfilePage/
    │   │  └── index.jsx   ← profile card area
    │   └── DiscoverPage/
    │      └── index.jsx   ← select artist carousel
    └── components/
        ├── NavigationSidebar/
        │  └── index.jsx   ← links to the three main pages
        ├── Home/
        │  ├── FollowedArtistCarousel/
        │  │  └── index.jsx
        │  ├── PlaylistCarousel/
        │  │  └── index.jsx
        │  ├── ArtistCard/
        │  │  └── index.jsx
        │  ├── AlbumCard/
        │  │  └── index.jsx
        │  ├── PlaylistCard/
        │  │  └── index.jsx
        │  └── RemoveSongCard/
        │     └── index.jsx
        ├── Profile/
        │  └── ProfileCard/
        │     └── index.jsx
        └── Discover/
           ├── SelectArtistCarousel/
           │  └── index.jsx
           └── ArtistCard/
              └── index.jsx
```

Each file currently returns `null` so you can start wiring routes and database data.

## Seed artists from TheAudioDB

If you want sample users to follow actual artists, run the standalone seeding script. It hits TheAudioDB v1 (key `123`) and populates `artist` + `follow` rows, logging every inserted artist and each account update.

```
cd /Users/jubileelin/CSE412-MusicLibrary
docker-compose up -d       # ensure Postgres is running
npm run seed-artists       # fetches artists, inserts them, and creates follow records
```

The script reads your Postgres credentials from `backend/.env`, so make sure that file still exists and points at the running database. You can rerun the script whenever you want fresh random artists without touching the UI.