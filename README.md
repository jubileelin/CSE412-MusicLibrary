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
npm run seed-artists       # fetches artists, inserts them, and creates follow records

to reset:
npm run reset-db


after seeding the database : 
npm run dev on the frontend and backend terminals
