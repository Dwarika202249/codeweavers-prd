import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/codeweavers',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Resend
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'CodeWeavers <noreply@codeweavers.in>',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Certificate defaults (paths to optional logo and signature images)
  // These can point to files on the server filesystem (recommended: public/logo.png and public/signature.png)
  certificateLogoPath: process.env.CERTIFICATE_LOGO_PATH || (process.env.NODE_ENV === 'production' ? '' : path.resolve(process.cwd(), 'public', 'logo.png')),
  certificateSignaturePath: process.env.CERTIFICATE_SIGNATURE_PATH || (process.env.NODE_ENV === 'production' ? '' : path.resolve(process.cwd(), 'public', 'signature.png')),

  // Certificate design
  certificatePrimaryColor: process.env.CERTIFICATE_PRIMARY_COLOR || '#3B82F6', // app primary (Tailwind primary)

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Cloudinary (for file/image uploads)
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'codeweavers',

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'contact@codeweavers.in',
  
  // Derived
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export default config;
