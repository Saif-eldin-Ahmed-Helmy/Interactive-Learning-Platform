import express from 'express';
import session from 'express-session';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { connectDatabase } from './config/database';
import { sessionConfig } from './config/session';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import progressRoutes from './routes/progressRoutes';
import challengeRoutes from './routes/challengeRoutes';
import adminRoutes from './routes/adminRoutes';
import quizRoutes from './routes/quizRoutes';
import userRoutes from './routes/userRoutes';
import achievementRoutes from './routes/achievementRoutes';

const app = express();
const PORT = Number(process.env.PORT || 5000);

// middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', application: 'interactive-learning-platform', message: 'server is running' });
});

app.use('/api', (_req, res) => { res.status(404).json({ error: 'API route not found' }); });
const clientDirectory = path.resolve(__dirname, '../../client/dist');
if (process.env.SERVE_CLIENT === 'true') {
  if (!fs.existsSync(path.join(clientDirectory, 'index.html'))) throw new Error('Build the client before starting the demo.');
  app.use(express.static(clientDirectory));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDirectory, 'index.html')));
}

// error handling middleware (must be last)
app.use(errorHandler);

// start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
      console.log(`server running on port ${PORT}`);
      console.log(`environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('failed to start server:', error);
    process.exit(1);
  }
};

startServer();
