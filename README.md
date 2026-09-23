# Interactive Learning Platform

A React and Express/MongoDB course prototype with lessons, quizzes, progress, challenges, and admin screens. The repository has separate `client` and `server` applications. It is a student project, not a production learning service.

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

The client defaults to `http://localhost:5000/api`; set `VITE_API_URL` to override it. The development UI runs at `http://localhost:5173`. The server requires MongoDB, so a successful compile is not proof that the full application runs without local setup.

## Current limits

The code exercise checks HTML content in the browser and runs the live preview in a sandboxed iframe. These checks are educational feedback, not trusted grading. Challenge scores are still submitted by clients, so leaderboard points should not be treated as tamper-proof. No end-to-end deployment or production security review is claimed.
