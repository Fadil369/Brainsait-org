// ── PDF Embed API Integration (Adobe View SDK) ──
// Uses the client_id from the EmbedPDFAPI project
// For embedding signed documents inline in the Wathq product

export const PDF_EMBED_CONFIG = {
  clientId: 'f3a2f455935a4822af9ee18b53917574',  // EmbedPDFAPI API Key
  orgId: 'DEE31ED96488CFAE0A495C8A@AdobeOrg',
  orgNumber: '1263995',
};

// ── Generate the embed snippet for inline PDF display ──
export function generatePdfEmbedHtml(pdfUrl: string, containerId: string, options?: {
  defaultViewMode?: 'FIT_WIDTH' | 'FIT_PAGE' | 'TWO_COLUMN' | 'TWO_COLUMN_FIT_PAGE' | 'SINGLE_PAGE';
  showDownloadPDF?: boolean;
  showPrintPDF?: boolean;
  showAnnotationTools?: boolean;
  showLeftHandPanel?: boolean;
  enableSearchAPIs?: boolean;
}): string {
  const opts = {
    defaultViewMode: 'FIT_WIDTH' as const,
    showDownloadPDF: true,
    showPrintPDF: true,
    showAnnotationTools: false,
    showLeftHandPanel: false,
    enableSearchAPIs: true,
    ...options,
  };

  return `
<!-- Adobe PDF Embed API -->
<div id="${containerId}" style="width:100%;height:600px;border-radius:12px;overflow:hidden;border:1px solid rgba(201,168,76,0.2);"></div>
<script src="https://documentcloud.adobe.com/view-sdk/main.js" async></script>
<script>
document.addEventListener("adobe_dc_view_sdk.ready", function() {
  var adobeDCView = new AdobeDC.View({
    clientId: "${PDF_EMBED_CONFIG.clientId}",
    divId: "${containerId}"
  });
  adobeDCView.previewFile({
    content: { location: { url: "${pdfUrl}" } },
    metaData: { fileName: "${pdfUrl.split('/').pop() || 'document.pdf'}" }
  }, {
    defaultViewMode: "${opts.defaultViewMode}",
    showDownloadPDF: ${opts.showDownloadPDF},
    showPrintPDF: ${opts.showPrintPDF},
    showAnnotationTools: ${opts.showAnnotationTools},
    showLeftHandPanel: ${opts.showLeftHandPanel},
    enableSearchAPIs: ${opts.enableSearchAPIs}
  });
});
</script>`;
}

// ── Generate embed JS for a signed document (after signing completes) ──
export function generateSignedDocViewer(agreementId: string, documentName: string): string {
  // This URL points to our worker's download endpoint
  const pdfUrl = `/api/sign/download/${agreementId}`;

  return generatePdfEmbedHtml(pdfUrl, `pdf-viewer-${agreementId}`, {
    defaultViewMode: 'FIT_WIDTH',
    showDownloadPDF: true,
    showPrintPDF: true,
    showAnnotationTools: false,
  });
}
