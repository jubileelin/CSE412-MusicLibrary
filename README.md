to start repository and setup project:
easiest to have three terminals
one for frontend, one for backend, and one for database creation

git clone ...

cd ~/CSE412-MusicLibrary

first terminal:
cd backend
npm install

second terminal:
cd frontend
npm install


populate database:
make sure docker is open and running

third terminal:
cd /Users/jubileelin/CSE412-MusicLibrary
docker-compose up -d       # ensure Postgres is running

psql -h localhost -U pguser -d music_db -f backend/sql/migrations/001_create_tables.sql    

psql -h localhost -U pguser -d music_db -f backend/sql/migrations/002_add_indexes.sql

psql -h localhost -U pguser -d music_db -f backend/sql/seeds/seed_sample_data.sql

npm install dotend

npm run seed-artists       # fetches artists, inserts them, and creates follow records

to reset:
npm run reset-db


after seeding the database : 
npm run dev on the frontend and backend terminals



IMPORTANT: click user profile to start on profile, 
can switch between alice and bob, add new user, can edit profile 
can click album names to expand album tracklist multiple can open at once so make sure you close each one in demo lol
you can unfollow artist and they disappear i think,
you can follow artist and they appear in follow list
you can add new playlist and it randomly choose three songs

notes on how the code works:
i used The AudioDB as our online api, bcuz its free and easiest to use with endpoints
the script seed artists basically takes information from api and populates the database, and also creates user and playlists for them
the reset script just resets the database
all the buttons are just sql calls