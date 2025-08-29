'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Toolbar,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Tooltip,
  Zoom,
  Fade,
  Skeleton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  WhatsApp as WhatsAppIcon,
  PictureAsPdf as PdfIcon,
  Html as HtmlIcon,
  Language as LanguageIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAppTheme } from '../../lib/ThemeProvider';
import type { DocumentResponse } from '../../services/documentService';

/**
 * DocumentPreview Component Props
 */
interface DocumentPreviewProps {
  document: DocumentResponse;
  language: 'ar' | 'en';
  onEdit?: () =&gt; void;
  onDownload?: () =&gt; void;
  onShare?: (method: string) =&gt; void;
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
  action: (url: string) =&gt; void;
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
const DocumentPreview: React.FC&lt;DocumentPreviewProps&gt; = ({
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
}) =&gt; {
  const { t } = useTranslation(['documents', 'common']);
  const { direction } = useAppTheme();
  
  // State management
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState&lt;string | null&gt;(null);
  const [shareAnchorEl, setShareAnchorEl] = useState&lt;null | HTMLElement&gt;(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [documentContent, setDocumentContent] = useState&lt;string | null&gt;(null);
  
  // Refs
  const previewContainerRef = useRef&lt;HTMLDivElement&gt;(null);
  const iframeRef = useRef&lt;HTMLIFrameElement&gt;(null);

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
      action: (url) =&gt; {
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
      action: (url) =&gt; {
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
      action: (url) =&gt; {
        navigator.clipboard.writeText(url).then(() =&gt; {
          // Show success message
        });
      },
    },
  ];

  /**
   * Load document content
   */
  useEffect(() =&gt; {
    if (document.data?.downloadUrl) {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading for demo purposes
      const timer = setTimeout(() =&gt; {
        try {
          // In real implementation, fetch the actual document content
          setDocumentContent(document.data?.downloadUrl || '');
          setIsLoading(false);
        } catch (err) {
          setError(language === 'ar' ? 'فشل في تحميل المستند' : 'Failed to load document');
          setIsLoading(false);
        }
      }, 1500);
      
      return () =&gt; clearTimeout(timer);
    }
  }, [document, language]);

  /**
   * Handle zoom controls
   */
  const handleZoomIn = useCallback(() =&gt; {
    setZoomLevel(prev =&gt; Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() =&gt; {
    setZoomLevel(prev =&gt; Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() =&gt; {
    setZoomLevel(1);
  }, []);

  /**
   * Handle fullscreen toggle
   */
  const toggleFullscreen = useCallback(() =&gt; {
    if (!document.fullscreenElement) {
      previewContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  /**
   * Handle download
   */
  const handleDownload = useCallback(() =&gt; {
    if (document.data?.downloadUrl) {
      const link = document.createElement('a');
      link.href = document.data.downloadUrl;
      link.download = document.data.filename || 'document.pdf';
      link.click();
      onDownload?.();
    }
  }, [document, onDownload]);

  /**
   * Handle print
   */
  const handlePrint = useCallback(() =&gt; {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
  }, []);

  /**
   * Handle share
   */
  const handleShare = useCallback((option: ShareOption) =&gt; {
    if (document.data?.downloadUrl) {
      option.action(document.data.downloadUrl);
      onShare?.(option.key);
    }
    setShareAnchorEl(null);
  }, [document, onShare]);

  /**
   * Render toolbar
   */
  const renderToolbar = () =&gt; (
    &lt;Toolbar
      variant="dense"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        px: 2,
        gap: 1,
      }}
    &gt;
      {/* Document Info */}
      &lt;Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}&gt;
        &lt;PdfIcon sx={{ mr: 1, color: 'error.main' }} /&gt;
        &lt;Typography variant="subtitle2" noWrap&gt;
          {metadata.title}
        &lt;/Typography&gt;
        &lt;Chip
          label={metadata.status}
          size="small"
          color={
            metadata.status === 'final' ? 'success' :
            metadata.status === 'approved' ? 'info' :
            metadata.status === 'review' ? 'warning' : 'default'
          }
          sx={{ ml: 1 }}
        /&gt;
      &lt;/Box&gt;

      {/* Controls */}
      &lt;Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}&gt;
        {/* Zoom Controls */}
        &lt;Tooltip title={language === 'ar' ? 'تكبير' : 'Zoom In'}&gt;
          &lt;IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel &gt;= 3}&gt;
            &lt;ZoomInIcon /&gt;
          &lt;/IconButton&gt;
        &lt;/Tooltip&gt;
        
        &lt;Typography variant="caption" sx={{ minWidth: 45, textAlign: 'center' }}&gt;
          {Math.round(zoomLevel * 100)}%
        &lt;/Typography&gt;
        
        &lt;Tooltip title={language === 'ar' ? 'تصغير' : 'Zoom Out'}&gt;
          &lt;IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel &lt;= 0.25}&gt;
            &lt;ZoomOutIcon /&gt;
          &lt;/IconButton&gt;
        &lt;/Tooltip&gt;
        
        &lt;Divider orientation="vertical" flexItem sx={{ mx: 1 }} /&gt;
        
        {/* Action Buttons */}
        {allowEdit &amp;&amp; onEdit &amp;&amp; (
          &lt;Tooltip title={language === 'ar' ? 'تعديل' : 'Edit'}&gt;
            &lt;IconButton size="small" onClick={onEdit} color="primary"&gt;
              &lt;EditIcon /&gt;
            &lt;/IconButton&gt;
          &lt;/Tooltip&gt;
        )}
        
        {allowDownload &amp;&amp; (
          &lt;Tooltip title={language === 'ar' ? 'تحميل' : 'Download'}&gt;
            &lt;IconButton size="small" onClick={handleDownload} color="primary"&gt;
              &lt;DownloadIcon /&gt;
            &lt;/IconButton&gt;
          &lt;/Tooltip&gt;
        )}
        
        &lt;Tooltip title={language === 'ar' ? 'طباعة' : 'Print'}&gt;
          &lt;IconButton size="small" onClick={handlePrint}&gt;
            &lt;PrintIcon /&gt;
          &lt;/IconButton&gt;
        &lt;/Tooltip&gt;
        
        {allowShare &amp;&amp; (
          &lt;Tooltip title={language === 'ar' ? 'مشاركة' : 'Share'}&gt;
            &lt;IconButton
              size="small"
              onClick={(e) =&gt; setShareAnchorEl(e.currentTarget)}
            &gt;
              &lt;ShareIcon /&gt;
            &lt;/IconButton&gt;
          &lt;/Tooltip&gt;
        )}
        
        &lt;Tooltip title={language === 'ar' ? 'معلومات المستند' : 'Document Info'}&gt;
          &lt;IconButton size="small" onClick={() =&gt; setShowMetadata(true)}&gt;
            &lt;InfoIcon /&gt;
          &lt;/IconButton&gt;
        &lt;/Tooltip&gt;
        
        {!embedded &amp;&amp; (
          &lt;Tooltip title={language === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}&gt;
            &lt;IconButton size="small" onClick={toggleFullscreen}&gt;
              {isFullscreen ? &lt;FullscreenExitIcon /&gt; : &lt;FullscreenIcon /&gt;}
            &lt;/IconButton&gt;
          &lt;/Tooltip&gt;
        )}
      &lt;/Box&gt;
    &lt;/Toolbar&gt;
  );

  /**
   * Render document content
   */
  const renderDocumentContent = () =&gt; {
    if (isLoading) {
      return (
        &lt;Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4,
          }}
        &gt;
          &lt;CircularProgress size={60} sx={{ mb: 2 }} /&gt;
          &lt;Typography variant="h6" gutterBottom&gt;
            {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
          &lt;/Typography&gt;
          &lt;Typography variant="body2" color="text.secondary"&gt;
            {language === 'ar' 
              ? 'يرجى الانتظار بينما نحضر معاينة المستند'
              : 'Please wait while we prepare the document preview'
            }
          &lt;/Typography&gt;
          
          {/* Loading skeleton */}
          &lt;Box sx={{ width: '100%', maxWidth: 600, mt: 3 }}&gt;
            &lt;Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} /&gt;
            &lt;Skeleton variant="text" width="80%" /&gt;
            &lt;Skeleton variant="text" width="60%" /&gt;
            &lt;Skeleton variant="text" width="90%" /&gt;
          &lt;/Box&gt;
        &lt;/Box&gt;
      );
    }

    if (error) {
      return (
        &lt;Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 400,
            p: 4,
          }}
        &gt;
          &lt;ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} /&gt;
          &lt;Typography variant="h6" gutterBottom color="error"&gt;
            {language === 'ar' ? 'خطأ في تحميل المستند' : 'Document Loading Error'}
          &lt;/Typography&gt;
          &lt;Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}&gt;
            {error}
          &lt;/Typography&gt;
          &lt;Button
            variant="outlined"
            startIcon={&lt;RefreshIcon /&gt;}
            onClick={() =&gt; window.location.reload()}
          &gt;
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          &lt;/Button&gt;
        &lt;/Box&gt;
      );
    }

    return (
      &lt;Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-in-out',
          minHeight: '100%',
          background: '#f5f5f5',
          p: 2,
        }}
      &gt;
        {/* Document Preview Area */}
        &lt;Paper
          elevation={3}
          sx={{
            maxWidth: 800,
            mx: 'auto',
            bgcolor: 'white',
            minHeight: 600,
            p: 4,
            direction: language === 'ar' ? 'rtl' : 'ltr',
          }}
        &gt;
          {/* Document Header */}
          &lt;Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', pb: 2 }}&gt;
            &lt;Typography variant="h4" align="center" gutterBottom&gt;
              {metadata.title}
            &lt;/Typography&gt;
            &lt;Typography variant="subtitle1" align="center" color="text.secondary"&gt;
              {metadata.type}
            &lt;/Typography&gt;
            &lt;Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}&gt;
              &lt;Chip
                icon={&lt;LanguageIcon /&gt;}
                label={metadata.language}
                size="small"
                variant="outlined"
              /&gt;
            &lt;/Box&gt;
          &lt;/Box&gt;

          {/* Sample Document Content */}
          &lt;Box sx={{ mb: 3 }}&gt;
            &lt;Typography variant="h6" gutterBottom&gt;
              {language === 'ar' ? 'الملخص التنفيذي' : 'Executive Summary'}
            &lt;/Typography&gt;
            &lt;Typography variant="body1" paragraph&gt;
              {language === 'ar'
                ? 'هذا نموذج لمعاينة المستند المُنتج. يحتوي هذا المستند على معلومات شاملة حول المشروع أو الدراسة المطلوبة. تم إنتاج هذا المستند باستخدام نظام BrainSAIT لتوليد المستندات مع الامتثال للمعايير السعودية.'
                : 'This is a sample preview of the generated document. This document contains comprehensive information about the project or study requested. This document was generated using the BrainSAIT document generation system with Saudi compliance standards.'
              }
            &lt;/Typography&gt;
          &lt;/Box&gt;

          &lt;Box sx={{ mb: 3 }}&gt;
            &lt;Typography variant="h6" gutterBottom&gt;
              {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            &lt;/Typography&gt;
            &lt;Box component="ul" sx={{ pl: language === 'ar' ? 0 : 2, pr: language === 'ar' ? 2 : 0 }}&gt;
              &lt;li&gt;
                &lt;Typography variant="body1"&gt;
                  &lt;strong&gt;{language === 'ar' ? 'النوع:' : 'Type:'}&lt;/strong&gt; {metadata.type}
                &lt;/Typography&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Typography variant="body1"&gt;
                  &lt;strong&gt;{language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}&lt;/strong&gt; {metadata.createdAt}
                &lt;/Typography&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Typography variant="body1"&gt;
                  &lt;strong&gt;{language === 'ar' ? 'اللغة:' : 'Language:'}&lt;/strong&gt; {metadata.language}
                &lt;/Typography&gt;
              &lt;/li&gt;
              &lt;li&gt;
                &lt;Typography variant="body1"&gt;
                  &lt;strong&gt;{language === 'ar' ? 'الحالة:' : 'Status:'}&lt;/strong&gt; {metadata.status}
                &lt;/Typography&gt;
              &lt;/li&gt;
            &lt;/Box&gt;
          &lt;/Box&gt;

          {/* Placeholder sections */}
          &lt;Box sx={{ mb: 3 }}&gt;
            &lt;Typography variant="h6" gutterBottom&gt;
              {language === 'ar' ? 'المحتوى التفصيلي' : 'Detailed Content'}
            &lt;/Typography&gt;
            &lt;Typography variant="body1" paragraph&gt;
              {language === 'ar'
                ? 'سيظهر هنا المحتوى الكامل للمستند بناءً على البيانات المدخلة في النموذج. يتضمن ذلك جميع الأقسام والتفاصيل والتحليلات المطلوبة.'
                : 'The full document content will appear here based on the data entered in the form. This includes all sections, details, and required analyses.'
              }
            &lt;/Typography&gt;
          &lt;/Box&gt;

          {/* Footer */}
          &lt;Box
            sx={{
              mt: 6,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
            }}
          &gt;
            &lt;Typography variant="caption" color="text.secondary"&gt;
              {language === 'ar'
                ? 'تم إنتاج هذا المستند بواسطة منصة BrainSAIT'
                : 'Generated by BrainSAIT Platform'
              }
            &lt;/Typography&gt;
            &lt;br /&gt;
            &lt;Typography variant="caption" color="text.secondary"&gt;
              {language === 'ar' 
                ? `تاريخ الإنتاج: ${metadata.createdAt}`
                : `Generated on: ${metadata.createdAt}`
              }
            &lt;/Typography&gt;
          &lt;/Box&gt;
        &lt;/Paper&gt;
      &lt;/Box&gt;
    );
  };

  return (
    &lt;Box
      ref={previewContainerRef}
      sx={{
        width: '100%',
        height: embedded ? maxHeight : '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    &gt;
      {/* Toolbar */}
      {renderToolbar()}

      {/* Document Content */}
      &lt;Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      &gt;
        {renderDocumentContent()}
      &lt;/Box&gt;

      {/* Share Menu */}
      &lt;Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={() =&gt; setShareAnchorEl(null)}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      &gt;
        {shareOptions.map((option) =&gt; (
          &lt;MenuItem key={option.key} onClick={() =&gt; handleShare(option)}&gt;
            &lt;ListItemIcon&gt;
              &lt;option.icon fontSize="small" /&gt;
            &lt;/ListItemIcon&gt;
            &lt;ListItemText&gt;{option.label}&lt;/ListItemText&gt;
          &lt;/MenuItem&gt;
        ))}
      &lt;/Menu&gt;

      {/* Metadata Dialog */}
      &lt;Dialog
        open={showMetadata}
        onClose={() =&gt; setShowMetadata(false)}
        maxWidth="sm"
        fullWidth
      &gt;
        &lt;DialogTitle&gt;
          {language === 'ar' ? 'معلومات المستند' : 'Document Information'}
        &lt;/DialogTitle&gt;
        &lt;DialogContent&gt;
          &lt;Card variant="outlined"&gt;
            &lt;CardContent&gt;
              &lt;Box sx={{ display: 'grid', gap: 2 }}&gt;
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'العنوان:' : 'Title:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.title}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'النوع:' : 'Type:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.type}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'الحجم:' : 'Size:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.size}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'عدد الصفحات:' : 'Pages:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.pages}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.createdAt}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'اللغة:' : 'Language:'}
                  &lt;/Typography&gt;
                  &lt;Typography variant="body2" fontWeight="bold"&gt;
                    {metadata.language}
                  &lt;/Typography&gt;
                &lt;/Box&gt;
                
                &lt;Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}&gt;
                  &lt;Typography variant="body2" color="text.secondary"&gt;
                    {language === 'ar' ? 'الحالة:' : 'Status:'}
                  &lt;/Typography&gt;
                  &lt;Chip
                    label={metadata.status}
                    size="small"
                    color={
                      metadata.status === 'final' ? 'success' :
                      metadata.status === 'approved' ? 'info' :
                      metadata.status === 'review' ? 'warning' : 'default'
                    }
                    icon={
                      metadata.status === 'final' ? &lt;CheckCircleIcon /&gt; :
                      metadata.status === 'approved' ? &lt;CheckCircleIcon /&gt; : undefined
                    }
                  /&gt;
                &lt;/Box&gt;
              &lt;/Box&gt;
            &lt;/CardContent&gt;
            &lt;CardActions&gt;
              &lt;Button
                size="small"
                startIcon={&lt;DownloadIcon /&gt;}
                onClick={handleDownload}
                disabled={!allowDownload}
              &gt;
                {language === 'ar' ? 'تحميل' : 'Download'}
              &lt;/Button&gt;
              &lt;Button
                size="small"
                startIcon={&lt;PrintIcon /&gt;}
                onClick={handlePrint}
              &gt;
                {language === 'ar' ? 'طباعة' : 'Print'}
              &lt;/Button&gt;
            &lt;/CardActions&gt;
          &lt;/Card&gt;
        &lt;/DialogContent&gt;
        &lt;DialogActions&gt;
          &lt;Button onClick={() =&gt; setShowMetadata(false)}&gt;
            {language === 'ar' ? 'إغلاق' : 'Close'}
          &lt;/Button&gt;
        &lt;/DialogActions&gt;
      &lt;/Dialog&gt;
    &lt;/Box&gt;
  );
};

export default DocumentPreview;