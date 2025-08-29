import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/logger';
import { config } from './config/environment';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import pdfRoutes from './routes/pdf';
import healthRoutes from './routes/health';
import documentRoutes from './routes/documentRoutes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for PDF generation
}));

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (lower for resource-intensive operations)
  message: 'Too many document generation requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '50mb' })); // Higher limit for document generation
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for templates and assets
app.use('/templates', express.static('templates'));
app.use('/public', express.static('public'));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/documents', documentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `${req.method} ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  logger.info(`🚀 BrainSAIT Document Service running on port ${PORT}`);
  logger.info(`📄 PDF Generation: http://localhost:${PORT}/api/pdf`);
  logger.info(`📋 Document Generation: http://localhost:${PORT}/api/documents`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
  logger.info(`🌐 API Templates: http://localhost:${PORT}/api/documents/templates`);
});

export { app };