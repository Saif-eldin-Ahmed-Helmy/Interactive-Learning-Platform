# Interactive Learning Platform

A React and Express/MongoDB course prototype with lessons, quizzes, progress, challenges, and admin screens. The repository has separate `client` and `server` applications.

## Local setup

Use Node.js 22 and a MongoDB replica set (a single-node replica set is sufficient for local development). Copy `server/.env.example` to `server/.env` and set a random `SESSION_SECRET` of at least 32 characters. Adjust `MONGODB_URI` if MongoDB is elsewhere.

```powershell
cd server
npm ci
npm run build
npm test
npm start
```

In another terminal:

```powershell
cd client
npm ci
npm run build
npm run dev
```

The client defaults to `http://localhost:5000/api`; set `VITE_API_URL` to override it. The development UI runs at `http://localhost:5173`.

## Features

Practice quizzes, peer challenges, course progress, and interactive code previews. Quiz rewards and challenge completion use MongoDB transactions.

## Checks

`npm test` in `server/` compiles TypeScript and exercises grading, reward replay protection, course-scoped progress, and challenge authorization with model calls stubbed. `npm run build` in `client/` checks TypeScript and builds the Vite client.

For database integration tests, set `MONGODB_TEST_URI` to an isolated MongoDB replica set and run `npm test` in `server/`. Tests create and delete uniquely named test databases.
