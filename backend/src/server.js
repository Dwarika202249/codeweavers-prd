import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import userRoutes from './routes/user.routes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});

export default app;
