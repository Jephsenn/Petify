import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import approvalRoutes from './routes/approval.js';
import uploadRoutes from './routes/upload.js';
import generateRoutes from './routes/generate.js';
import printifyRoutes from './routes/printify.js';

// Import services
import { storageService } from './services/storage.service.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve static files
const rootDir = path.join(__dirname, '..');
app.use('/uploads', express.static(path.join(rootDir, 'uploads')));
app.use('/generated', express.static(path.join(rootDir, 'generated')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Petify Backend API'
  });
});

// API Routes
app.use('/approval', approvalRoutes);
app.use('/upload', uploadRoutes);
app.use('/generate', generateRoutes);
app.use('/printify', printifyRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Petify Backend API',
    version: '1.0.0',
    description: 'Backend API for Petify e-commerce application with approval system integration',
    endpoints: {
      health: 'GET /health',
      approval: 'POST /approval',
      upload: 'POST /upload',
      generate: 'POST /generate',
      generateStyles: 'GET /generate/styles',
      printifyCreate: 'POST /printify/create',
      printifyPublish: 'POST /printify/publish/:productId'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Initialize storage and start server
async function startServer() {
  try {
    // Ensure storage directories exist
    await storageService.ensureDirectories();
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Petify Backend API started`);
      console.log(`📍 Server running on http://localhost:${PORT}`);
      console.log(`🔗 Approval bot URL: ${process.env.APPROVAL_BOT_URL || 'http://localhost:3000'}`);
      console.log('='.repeat(50));
      console.log('Available endpoints:');
      console.log(`  GET  /health - Health check`);
      console.log(`  POST /approval - Receive approval decisions`);
      console.log(`  GET  /approval/pending - List pending operations`);
      console.log(`  POST /upload - Upload pet photo`);
      console.log(`  GET  /generate/styles - Get available art styles`);
      console.log(`  POST /generate - Generate AI artwork (requires approval)`);
      console.log(`  POST /printify/create - Create Printify product (requires approval)`);
      console.log(`  POST /printify/publish/:id - Publish product to Shopify`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
