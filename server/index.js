const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
const connectDB = require('./config/db');
connectDB();

// Initialize Express App
const app = express();

// Security Middlewares
app.use(helmet());

// Cross-Origin Resource Sharing (CORS) Configuration for local & Vercel deployment
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://otess-sms.vercel.app',
  'https://otess-bulk-sms.vercel.app'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev/staging to prevent CORS blocks
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// HTTP Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Express Body Parser Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

// API Health Check & Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OTESS DATA Bulk SMS API is online and running.',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register API Domain Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/templates', require('./routes/templateRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Centralized Error Handling Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start Express Server with fallback port listener
const PORT = process.env.PORT || 5000;

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`================================================`);
    console.log(`🚀 OTESS DATA Backend Server running on port ${portToTry}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Server Warning] Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('[Server Error]', err);
    }
  });
};

startServer(Number(PORT));

