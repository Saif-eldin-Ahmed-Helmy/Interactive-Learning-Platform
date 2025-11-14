import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
  res.json({ status: 'ok', message: 'server is running' });
});

// error handling middleware (must be last)
app.use(errorHandler);

// start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
      console.log(`environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('failed to start server:', error);
    process.exit(1);
  }
};

startServer();
