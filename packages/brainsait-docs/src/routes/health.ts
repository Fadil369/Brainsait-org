import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { pdfService } from '../services/pdfService';

const router = Router();

const healthCheck = asyncHandler(async (req: any, res: any) => {
  try {
    // Test PDF service
    await pdfService.initialize();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        pdfService: 'initialized',
        puppeteer: 'running',
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

router.get('/', healthCheck);

export default router;