import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration with validation
const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  
  // Database configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/artmarketplace',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
    return 'dev-secret-key-change-in-production';
  })(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // Frontend configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Security configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  
  // Rate limiting configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  UPLOAD_RATE_LIMIT_MAX: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
  
  // File upload configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES ? 
    process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim()) : 
    ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production environment');
    }
    return 'dev-session-secret-change-in-production';
  })(),
  
  // Logging configuration
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // API configuration
  API_VERSION: process.env.API_VERSION || 'v1',
  API_PREFIX: process.env.API_PREFIX || '/api',
  
  // Email configuration (if needed later)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Payment configuration (if needed later)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  
  // Cloud storage configuration (if needed later)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

// Validation function
const validateConfig = () => {
  const requiredFields = ['MONGO_URI', 'JWT_SECRET'];
  
  if (process.env.NODE_ENV === 'production') {
    requiredFields.push('FRONTEND_URL');
  }
  
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required environment variables: ${missingFields.join(', ')}`);
  }
  
  // Validate JWT secret length in production
  if (process.env.NODE_ENV === 'production' && config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
  
  // Validate MongoDB URI format
  if (!config.MONGO_URI.startsWith('mongodb://') && !config.MONGO_URI.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MongoDB URI format');
  }
  
  return true;
};

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export default config;
