import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform';
    
    await mongoose.connect(mongoUri);
    
    console.log('mongodb connected successfully');
  } catch (error) {
    console.error('mongodb connection failed:', error);
    process.exit(1);
  }
};

// handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('mongodb disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('mongodb error:', error);
});
