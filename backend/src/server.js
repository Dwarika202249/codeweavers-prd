import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import config from './config/index.js';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import contactRoutes from './routes/contact.routes.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/error.middleware.js';

// Initialize express app
const app = express();
// If running behind a proxy (e.g., Render/Vercel), trust proxy headers so req.protocol reflects X-Forwarded-Proto
app.set('trust proxy', true);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
// Allow larger payloads for profile avatar uploads (data URLs) — 5MB limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Ensure uploads folder exists and serve uploaded files (simple file uploads)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
import enrollmentRoutes from './routes/enrollment.routes.js';
app.use('/api/enrollments', enrollmentRoutes);
import certificateRoutes from './routes/certificate.routes.js';
app.use('/api/certificates', certificateRoutes);
import assignmentsRoutes from './routes/assignments.routes.js';
app.use('/api/assignments', assignmentsRoutes);
import notificationsRoutes from './routes/notifications.routes.js';
app.use('/api/notifications', notificationsRoutes);
import exportRoutes from './routes/export.routes.js';
app.use('/api/export', exportRoutes);
import paymentRoutes from './routes/payment.routes.js';
app.use('/api/payments', paymentRoutes);
import uploadRoutes from './routes/upload.routes.js';
app.use('/api/uploads', uploadRoutes);
// Admin settings
import settingsRoutes from './routes/settings.routes.js';
app.use('/api/admin/settings', settingsRoutes);

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
