'use client';

import {
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Error as ErrorIcon,
    FullscreenExit as FullscreenExitIcon,
    Fullscreen as FullscreenIcon,
    Info as InfoIcon,
    Language as LanguageIcon,
    Link as LinkIcon,
    PictureAsPdf as PdfIcon,
    Print as PrintIcon,
    Refresh as RefreshIcon,
    Share as ShareIcon,
    WhatsApp as WhatsAppIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    Toolbar,
    Tooltip,
    Typography
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppTheme } from '../../lib/ThemeProvider';
import type { DocumentResponse } from '../../services/documentService';

/**
 * DocumentPreview Component Props
 */
interface DocumentPreviewProps {
  document: DocumentResponse;
  language: 'ar' | 'en';
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: (method: string) => void;
  allowEdit?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  embedded?: boolean;
  maxHeight?: number | string;
}

/**
 * Document Metadata Interface
 */
interface DocumentMetadata {
  title: string;
  type: string;
  size: string;
  pages: number;
  createdAt: string;
  language: string;
  format: string;
  status: 'draft' | 'review' | 'approved' | 'final';
}

/**
 * Share Options Interface
 */
interface ShareOption {
  key: string;
  label: string;
  icon: React.ComponentType;
  action: (url: string) => void;
}

/**
 * DocumentPreview Component
 * 
 * Advanced document preview component with PDF/HTML rendering, zoom controls,
 * sharing options, and Arabic RTL support
 * 
 * @param props - Component properties
 * @returns JSX.Element
 */
const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  language,
  onEdit,
  onDownload,
  onShare,
  allowEdit = true,
  allowDownload = true,
  allowShare = true,
  embedded = false,
  maxHeight = 800,
}) => {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State management
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  
  // Refs
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mock metadata (in real implementation, this would come from the document response)
  const metadata: DocumentMetadata = {
    title: document.data?.filename || 'Document',
    type: document.data?.filename?.includes('business-plan') ? 'Business Plan' : 
          document.data?.filename?.includes('feasibility') ? 'Feasibility Study' :
          document.data?.filename?.includes('compliance') ? 'Compliance Report' : 'Document',
    size: document.data?.size ? `${(document.data.size / 1024).toFixed(1)} KB` : '0 KB',
    pages: 1, // This would be calculated from actual document
    createdAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US'),
    language: language === 'ar' ? 'العربية' : 'English',
    format: 'PDF',
    status: 'draft',
  };

  // Share options
  const shareOptions: ShareOption[] = [
    {
      key: 'email',
      label: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      icon: EmailIcon,
      action: (url) => {
        const subject = encodeURIComponent(`${metadata.title} - ${metadata.type}`);
        const body = encodeURIComponent(
          language === 'ar' 
            ? `يرجى مراجعة الوثيقة المرفقة: ${url}`
            : `Please review the attached document: ${url}`
        );
        window.open(`mailto:?subject=${subject}&amp;body=${body}`);
      },
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: WhatsAppIcon,
      action: (url) => {
        const text = encodeURIComponent(
          language === 'ar'
            ? `${metadata.title} - ${metadata.type}\n${url}`
            : `${metadata.title} - ${metadata.type}\n${url}`
        );
        window.open(`https://wa.me/?text=${text}`);
      },
    },
    {
      key: 'link',
      label: language === 'ar' ? 'نسخ الرابط' : 'Copy Link',
      icon: LinkIcon,
      action: (url) => {
        navigator.clipboard.writeText(url).then(() => {
          // Show success message
        });
      },
    },
  ];

  /**
   * Load document content
   */
  useEffect(() => {
    if (document.data?.downloadUrl) {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading for demo purposes
      const timer = setTimeout(() => {
        try {
          // In real implementation, fetch the actual document content
          setDocumentContent(document.data?.downloadUrl || '');
          setIsLoading(false);
        } catch (err) {
          setError(language === 'ar' ? 'فشل في تحميل المستند' : 'Failed to load document');
          setIsLoading(false);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [document, language]);

  /**
   * Handle zoom controls
   */
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  /**
   * Handle fullscreen toggle
   */
  const toggleFullscreen = useCallback(() => {
    if (!window.document.fullscreenElement) {
      previewContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  /**
   * Handle download
   */
  const handleDownload = useCallback(() => {
    if (document.data?.downloadUrl) {
      const link = window.document.createElement('a');
      link.href = document.data.downloadUrl;
      link.download = document.data.filename || 'document.pdf';
      link.click();
      onDownload?.();
    }
  }, [document, onDownload]);

  /**
   * Handle print
   */
  const handlePrint = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  }, []);

  /**
   * Handle share
   */
  const handleShare = useCallback((option: ShareOption) => {
    if (document.data?.downloadUrl) {
      option.action(document.data.downloadUrl);
      onShare?.(option.key);
    }
    setShareAnchorEl(null);
  }, [document, onShare]);

  /**
   * Render toolbar
   */
  const renderToolbar = () => (
    <Toolbar
      variant="dense"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: 2,
        gap: 1,
      }}
    >
      {/* Document Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <PdfIcon sx={{ mr: 1, color: 'error.main' }} />
        <Typography variant="subtitle2" noWrap>
          {metadata.title}
        </Typography>
        <Chip
          label={metadata.status}
          size="small"
          color={
            metadata.status === 'final' ? 'success' :
            metadata.status === 'approved' ? 'info' :
            metadata.status === 'review' ? 'warning' : 'default'
          }
          sx={{ ml: 1 }}
        />
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Zoom Controls */}
        <Tooltip title={language === 'ar' ? 'تكبير' : 'Zoom In'}>
          <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        
        <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'center' }}>
          {Math.round(zoomLevel * 100)}%
        </Typography>
        
        <Tooltip title={language === 'ar' ? 'تصغير' : 'Zoom Out'}>
          <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.25}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        {/* Action Buttons */}
        {allowEdit && onEdit && (
          <Tooltip title={language === 'ar' ? 'تعديل' : 'Edit'}>
            <IconButton size="small" onClick={onEdit} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {allowDownload && (
          <Tooltip title={language === 'ar' ? 'تحميل' : 'Download'}>
            <IconButton size="small" onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title={language === 'ar' ? 'طباعة' : 'Print'}>
          <IconButton size="small" onClick={handlePrint}>
            <PrintIcon />
          </IconButton>
        </Tooltip>
        
        {allowShare && (
          <Tooltip title={language === 'ar' ? 'مشاركة' : 'Share'}>
            <IconButton
              size="small"
              onClick={(e) => setShareAnchorEl(e.currentTarget)}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title={language === 'ar' ? 'معلومات المستند' : 'Document Info'}>
          <IconButton size="small" onClick={() => setShowMetadata(true)}>
            <InfoIcon />
          </IconButton>
        </Tooltip>
        
        {!embedded && (
          <Tooltip title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}>
            <IconButton size="small" onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Toolbar>
  );

  /**
   * Render document content
   */
  const renderDocumentContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4,
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {language === 'ar' 
              ? 'يرجى الانتظار بينما نحضر معاينة المستند'
              : 'Please wait while we prepare the document preview'
            }
          </Typography>
          
          {/* Loading skeleton */}
          <Box sx={{ width: '100%', maxWidth: 600, mt: 3 }}>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="90%" />
          </Box>
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4,
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="error">
            {language === 'ar' ? 'خطأ في تحميل المستند' : 'Document Loading Error'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-in-out',
          minHeight: '100%',
          background: '#f5f5f5',
          p: 2,
        }}
      >
        {/* Document Preview Area */}
        <Paper
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            bgcolor: 'white',
            minHeight: 600,
            p: 4,
            direction: language === 'ar' ? 'rtl' : 'ltr',
          }}
        >
          {/* Document Header */}
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
              {metadata.title}
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              {metadata.type}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Chip
                icon={<LanguageIcon />}
                label={metadata.language}
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Sample Document Content */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
            </Typography>
            <Typography variant="body1" paragraph>
              {language === 'ar'
                ? 'هذا نموذج لمعاينة المستند المُنتج. يحتوي هذا المستند على معلومات شاملة حول المشروع أو الدراسة المطلوبة. تم إنتاج هذا المستند باستخدام نظام BrainSAIT لتوليد المستندات مع الامتثال للمعايير السعودية.'
                : 'This is a sample preview of the generated document. This document contains comprehensive information about the project or study requested. This document was generated using the BrainSAIT document generation system with Saudi compliance standards.'
              }
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            </Typography>
            <Box component="ul" sx={{ pl: language === 'ar' ? 0 : 2, pr: language === 'ar' ? 2 : 0 }}>
              <li>
                <Typography variant="body1">
                  <strong>{language === 'ar' ? 'النوع:' : 'Type:'}</strong> {metadata.type}
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>{language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}</strong> {metadata.createdAt}
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>{language === 'ar' ? 'اللغة:' : 'Language:'}</strong> {metadata.language}
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  <strong>{language === 'ar' ? 'الحالة:' : 'Status:'}</strong> {metadata.status}
                </Typography>
              </li>
            </Box>
          </Box>

          {/* Placeholder sections */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'المحتوى التفصيلي' : 'Detailed Content'}
            </Typography>
            <Typography variant="body1" paragraph>
              {language === 'ar'
                ? 'سيظهر هنا المحتوى الكامل للمستند بناءً على البيانات المدخلة في النموذج. يتضمن ذلك جميع الأقسام والتفاصيل والتحليلات المطلوبة.'
                : 'The full document content will appear here based on the data entered in the form. This includes all sections, details, and required analyses.'
              }
            </Typography>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 6,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {language === 'ar'
                ? 'تم إنتاج هذا المستند بواسطة منصة BrainSAIT'
                : 'Generated by BrainSAIT Platform'
              }
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              {language === 'ar' 
                ? `تاريخ الإنتاج: ${metadata.createdAt}`
                : `Generated on: ${metadata.createdAt}`
              }
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box
      ref={previewContainerRef}
      sx={{
        width: '100%',
        height: embedded ? maxHeight : '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Toolbar */}
      {renderToolbar()}

      {/* Document Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {renderDocumentContent()}
      </Box>

      {/* Share Menu */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={() => setShareAnchorEl(null)}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        {shareOptions.map((option) => (
          <MenuItem key={option.key} onClick={() => handleShare(option)}>
            <ListItemIcon>
              <Box sx={{ fontSize: 'small' }}>
                <option.icon />
              </Box>
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Metadata Dialog */}
      <Dialog
        open={showMetadata}
        onClose={() => setShowMetadata(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {language === 'ar' ? 'معلومات المستند' : 'Document Information'}
        </DialogTitle>
        <DialogContent>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'العنوان:' : 'Title:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.title}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'النوع:' : 'Type:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.type}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'الحجم:' : 'Size:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.size}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'عدد الصفحات:' : 'Pages:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.pages}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.createdAt}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'اللغة:' : 'Language:'}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metadata.language}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  </Typography>
                  <Chip
                    label={metadata.status}
                    size="small"
                    color={
                      metadata.status === 'final' ? 'success' :
                      metadata.status === 'approved' ? 'info' :
                      metadata.status === 'review' ? 'warning' : 'default'
                    }
                    icon={
                      metadata.status === 'final' ? <CheckCircleIcon /> :
                      metadata.status === 'approved' ? <CheckCircleIcon /> : undefined
                    }
                  />
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                disabled={!allowDownload}
              >
                {language === 'ar' ? 'تحميل' : 'Download'}
              </Button>
              <Button
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                {language === 'ar' ? 'طباعة' : 'Print'}
              </Button>
            </CardActions>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMetadata(false)}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentPreview;