const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Background — dark gradient matching site theme
const bgGrad = ctx.createLinearGradient(0, 0, W, H);
bgGrad.addColorStop(0, '#02040a');
bgGrad.addColorStop(0.5, '#0a0f1a');
bgGrad.addColorStop(1, '#02040a');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, W, H);

// Subtle grid pattern
ctx.strokeStyle = 'rgba(201, 168, 76, 0.06)';
ctx.lineWidth = 1;
for (let x = 0; x < W; x += 60) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (let y = 0; y < H; y += 60) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}

// Accent glow top-left
const glowGrad = ctx.createRadialGradient(100, 100, 0, 100, 100, 400);
glowGrad.addColorStop(0, 'rgba(201, 168, 76, 0.15)');
glowGrad.addColorStop(1, 'rgba(201, 168, 76, 0)');
ctx.fillStyle = glowGrad;
ctx.fillRect(0, 0, 500, 300);

// Accent glow bottom-right
const glowGrad2 = ctx.createRadialGradient(1100, 530, 0, 1100, 530, 300);
glowGrad2.addColorStop(0, 'rgba(16, 185, 129, 0.1)');
glowGrad2.addColorStop(1, 'rgba(16, 185, 129, 0)');
ctx.fillStyle = glowGrad2;
ctx.fillRect(800, 300, 400, 330);

// Top gold accent line
ctx.fillStyle = '#c9a84c';
ctx.fillRect(0, 0, W, 4);

// BrainSAIT Logo block — rounded rectangle
const logoX = 60, logoY = 60;
ctx.fillStyle = '#1a365d';
ctx.beginPath();
ctx.roundRect(logoX, logoY, 56, 56, 12);
ctx.fill();
ctx.fillStyle = '#c9a84c';
ctx.font = 'bold 32px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('B', logoX + 28, logoY + 40);

// Company name
ctx.textAlign = 'left';
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 36px sans-serif';
ctx.fillText('BrainSAIT', logoX + 72, logoY + 32);
ctx.fillStyle = '#94a3b8';
ctx.font = '18px sans-serif';
ctx.fillText('AI-Native Healthcare Platform', logoX + 72, logoY + 56);

// Arabic name top-right
ctx.textAlign = 'right';
ctx.fillStyle = '#c9a84c';
ctx.font = '24px sans-serif';
ctx.fillText('برينسايت', W - 60, logoY + 40);

// Main headline
ctx.textAlign = 'center';
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 52px sans-serif';
ctx.fillText('The Trust Layer of the Internet', W / 2, 240);

// Arabic headline
ctx.fillStyle = '#c9a84c';
ctx.font = 'bold 32px sans-serif';
ctx.fillText('طبقة الثقة من الإنترنت', W / 2, 290);

// Subtitle
ctx.fillStyle = '#94a3b8';
ctx.font = '22px sans-serif';
ctx.fillText('Saudi Business Verification · KYB · Compliance · AI Risk Scoring', W / 2, 340);
ctx.fillText('NPHIES · FHIR R4 · ZATCA · Vision 2030', W / 2, 372);

// Feature pills
const pills = ['✓ KYB Bundles', '✓ PDF Certificates', '✓ Continuous Monitoring', '✓ AI Risk Scoring'];
const pillStartX = W / 2 - 380;
pills.forEach((text, i) => {
  const px = pillStartX + i * 190;
  const py = 420;
  ctx.fillStyle = 'rgba(201, 168, 76, 0.1)';
  ctx.beginPath();
  ctx.roundRect(px, py, 175, 36, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#c9a84c';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, px + 87, py + 24);
});

// TrustOS product line
ctx.textAlign = 'center';
ctx.fillStyle = '#10b981';
ctx.font = 'bold 20px sans-serif';
ctx.fillText('+ TrustOS — Neural Trust Operating System', W / 2, 500);

ctx.fillStyle = '#64748b';
ctx.font = '16px sans-serif';
ctx.fillText('AI Governance · XAI · Human-in-the-Loop · Compliance Engine', W / 2, 530);

// Bottom URL
ctx.fillStyle = '#334155';
ctx.font = '18px sans-serif';
ctx.fillText('brainsait.org', W / 2, H - 30);

// Bottom gold accent line
ctx.fillStyle = '#c9a84c';
ctx.fillRect(0, H - 4, W, 4);

// Save
const outPath = path.join(__dirname, '..', 'og-image.png');
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buf);
console.log('Created:', outPath, '(' + (buf.length / 1024).toFixed(0) + ' KB)');
