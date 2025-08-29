import { Router } from 'express';
import { body, query } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { pdfService } from '../services/pdfService';
import { logger } from '../utils/logger';

const router = Router();

// Generate custom PDF
const generatePDF = asyncHandler(async (req: any, res: any) => {
  const { template, data, language = 'en', format = 'A4', orientation = 'portrait' } = req.body;

  try {
    const pdfBuffer = await pdfService.generatePDF({
      template,
      data,
      language,
      format,
      orientation,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${template}-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('PDF generated and sent', {
      template,
      language,
      size: pdfBuffer.length,
    });
  } catch (error) {
    logger.error('PDF generation failed', error);
    res.status(500).json({
      success: false,
      error: 'PDF generation failed',
    });
  }
});

// Generate certificate
const generateCertificate = asyncHandler(async (req: any, res: any) => {
  const { language = 'en' } = req.query;
  const data = req.body;

  try {
    const pdfBuffer = await pdfService.generateCertificate(data, language);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Certificate generated', {
      language,
      recipientName: data.recipientName,
      programName: data.programName,
    });
  } catch (error) {
    logger.error('Certificate generation failed', error);
    res.status(500).json({
      success: false,
      error: 'Certificate generation failed',
    });
  }
});

// Generate report
const generateReport = asyncHandler(async (req: any, res: any) => {
  const { language = 'en' } = req.query;
  const data = req.body;

  try {
    const pdfBuffer = await pdfService.generateReport(data, language);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Report generated', {
      language,
      reportType: data.type,
      dataPoints: Array.isArray(data.items) ? data.items.length : 0,
    });
  } catch (error) {
    logger.error('Report generation failed', error);
    res.status(500).json({
      success: false,
      error: 'Report generation failed',
    });
  }
});

// Generate invoice
const generateInvoice = asyncHandler(async (req: any, res: any) => {
  const { language = 'en' } = req.query;
  const data = req.body;

  try {
    const pdfBuffer = await pdfService.generateInvoice(data, language);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${data.invoiceNumber || Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Invoice generated', {
      language,
      invoiceNumber: data.invoiceNumber,
      amount: data.totalAmount,
    });
  } catch (error) {
    logger.error('Invoice generation failed', error);
    res.status(500).json({
      success: false,
      error: 'Invoice generation failed',
    });
  }
});

// Generate program summary
const generateProgramSummary = asyncHandler(async (req: any, res: any) => {
  const { language = 'en' } = req.query;
  const data = req.body;

  try {
    const pdfBuffer = await pdfService.generateProgramSummary(data, language);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="program-summary-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);

    logger.info('Program summary generated', {
      language,
      programId: data.id,
      programName: data.title,
    });
  } catch (error) {
    logger.error('Program summary generation failed', error);
    res.status(500).json({
      success: false,
      error: 'Program summary generation failed',
    });
  }
});

// Routes
router.post(
  '/generate',
  [
    body('template').notEmpty().withMessage('Template name is required'),
    body('data').isObject().withMessage('Data object is required'),
    body('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
    body('format').optional().isIn(['A4', 'Letter', 'Legal']).withMessage('Invalid format'),
    body('orientation').optional().isIn(['portrait', 'landscape']).withMessage('Invalid orientation'),
  ],
  generatePDF
);

router.post(
  '/certificate',
  [
    body('recipientName').notEmpty().withMessage('Recipient name is required'),
    body('programName').notEmpty().withMessage('Program name is required'),
    body('completionDate').notEmpty().withMessage('Completion date is required'),
    query('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
  ],
  generateCertificate
);

router.post(
  '/report',
  [
    body('title').notEmpty().withMessage('Report title is required'),
    body('type').notEmpty().withMessage('Report type is required'),
    body('data').isObject().withMessage('Report data is required'),
    query('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
  ],
  generateReport
);

router.post(
  '/invoice',
  [
    body('invoiceNumber').notEmpty().withMessage('Invoice number is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('items').isArray().withMessage('Items must be an array'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    query('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
  ],
  generateInvoice
);

router.post(
  '/program-summary',
  [
    body('id').notEmpty().withMessage('Program ID is required'),
    body('title').notEmpty().withMessage('Program title is required'),
    body('description').notEmpty().withMessage('Program description is required'),
    query('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
  ],
  generateProgramSummary
);

export default router;