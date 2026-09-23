# Interactive Learning Platform

A React and Express/MongoDB course prototype with lessons, quizzes, progress, challenges, and admin screens. The repository has separate `client` and `server` applications.

## Local setup

Use Node.js and a local MongoDB instance. Copy `server/.env.example` to `server/.env` and set a random `SESSION_SECRET` of at least 32 characters. Adjust `MONGODB_URI` if MongoDB is elsewhere.

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

Practice quizzes, peer challenges, course progress, and interactive code previews.
