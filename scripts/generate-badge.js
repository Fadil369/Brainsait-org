const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

// ─── Brand Colors ───
const GOLD    = '#c9a84c';
const GOLD_LT = '#e0c878';
const NAVY    = '#1a365d';
const NAVY_DK = '#0f2440';
const BG      = '#02040a';
const WHITE   = '#ffffff';
const GREEN   = '#10b981';
const SLATE   = '#94a3b8';

function createBadge(W, H, filename, variant) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const cx = W / 2;
  const cy = H / 2;

  // ── Background ──
  if (variant === 'seal') {
    // Circular seal on dark bg
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Outer ring glow
    const glowR = Math.min(W, H) * 0.44;
    const glow = ctx.createRadialGradient(cx, cy, glowR * 0.6, cx, cy, glowR);
    glow.addColorStop(0, 'rgba(201,168,76,0.08)');
    glow.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner ring
    const innerR = glowR * 0.82;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201,168,76,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dashed ring
    const dashR = glowR * 0.72;
    ctx.beginPath();
    ctx.arc(cx, cy, dashR, 0, Math.PI * 2);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(201,168,76,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Logo B in center ──
    const logoSize = glowR * 0.42;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.roundRect(cx - logoSize/2, cy - logoSize/2 - glowR*0.08, logoSize, logoSize, logoSize * 0.2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = GOLD;
    ctx.font = `bold ${logoSize * 0.65}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', cx, cy - glowR * 0.08);

    // ── "BRAINSAIT" text below logo ──
    ctx.fillStyle = WHITE;
    ctx.font = `bold ${Math.max(12, glowR * 0.16)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BRAINSAIT', cx, cy + glowR * 0.38);

    // ── "TRUSTED" text ──
    ctx.fillStyle = GOLD;
    ctx.font = `bold ${Math.max(10, glowR * 0.13)}px sans-serif`;
    ctx.fillText('✦  TRUSTED  ✦', cx, cy + glowR * 0.55);

    // ── Top arc text: "VERIFIED BY" ──
    const topArcR = glowR * 0.88;
    const topText = '✦  VERIFIED BY BRAINSAIT TRUST LAYER  ✦';
    ctx.font = `bold ${Math.max(8, glowR * 0.09)}px sans-serif`;
    ctx.fillStyle = GOLD_LT;
    drawArcText(ctx, topText, cx, cy, topArcR, -Math.PI * 0.82, -Math.PI * 0.18, 'up');

    // ── Bottom arc text ──
    const bottomText = 'NPHIES  ·  FHIR R4  ·  ZATCA  ·  VISION 2030';
    ctx.font = `600 ${Math.max(7, glowR * 0.075)}px sans-serif`;
    ctx.fillStyle = SLATE;
    drawArcText(ctx, bottomText, cx, cy, topArcR, Math.PI * 0.18, Math.PI * 0.82, 'down');

    // ── Green verification checkmark ──
    const checkX = cx + logoSize * 0.42;
    const checkY = cy - glowR * 0.08 - logoSize * 0.35;
    const checkR = logoSize * 0.22;
    ctx.beginPath();
    ctx.arc(checkX, checkY, checkR, 0, Math.PI * 2);
    ctx.fillStyle = GREEN;
    ctx.fill();
    ctx.strokeStyle = BG;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Checkmark
    ctx.beginPath();
    ctx.moveTo(checkX - checkR * 0.4, checkY);
    ctx.lineTo(checkX - checkR * 0.1, checkY + checkR * 0.35);
    ctx.lineTo(checkX + checkR * 0.5, checkY - checkR * 0.3);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // ── Corner stars ──
    const starR = glowR * 0.92;
    ctx.fillStyle = 'rgba(201,168,76,0.3)';
    ctx.font = `${Math.max(8, glowR * 0.06)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('★', cx - starR * 0.7, cy - starR * 0.55);
    ctx.fillText('★', cx + starR * 0.7, cy - starR * 0.55);
    ctx.fillText('★', cx - starR * 0.7, cy + starR * 0.6);
    ctx.fillText('★', cx + starR * 0.7, cy + starR * 0.6);

  } else if (variant === 'inline') {
    // Horizontal inline badge
    const pad = 4;
    const r = 8;

    // Rounded rect background
    ctx.fillStyle = NAVY_DK;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad*2, H - pad*2, r);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner glow top
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(201,168,76,0.12)');
    grad.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad*2, H - pad*2, r);
    ctx.fill();

    // Logo B
    const bs = H * 0.5;
    const bx = pad + r + bs/2 + 4;
    const by = H/2;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.roundRect(bx - bs/2, by - bs/2, bs, bs, bs*0.2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = `bold ${bs * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', bx, by);

    // Check
    const ccx = bx + bs * 0.35;
    const ccy = by - bs * 0.3;
    const ccr = bs * 0.2;
    ctx.beginPath();
    ctx.arc(ccx, ccy, ccr, 0, Math.PI*2);
    ctx.fillStyle = GREEN;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ccx - ccr*0.35, ccy);
    ctx.lineTo(ccx - ccr*0.05, ccy + ccr*0.3);
    ctx.lineTo(ccx + ccr*0.4, ccy - ccr*0.25);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Text
    const tx = bx + bs/2 + 16;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = WHITE;
    ctx.font = `bold ${H * 0.22}px sans-serif`;
    ctx.fillText('BrainSAIT Trust', tx, H * 0.35);

    ctx.fillStyle = GOLD;
    ctx.font = `bold ${H * 0.17}px sans-serif`;
    ctx.fillText('✦  VERIFIED  ✦', tx, H * 0.62);

    // Mini shield icon on right
    const sx = W - pad - r - 12;
    ctx.fillStyle = GOLD;
    ctx.font = `${H * 0.25}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🛡️', sx, H/2);

  } else if (variant === 'compact') {
    // Small square badge for embedding
    const pad = 3;
    const r = W * 0.12;

    // Background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, NAVY_DK);
    grad.addColorStop(1, NAVY);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(pad, pad, W - pad*2, H - pad*2, r);
    ctx.fill();

    // Border
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Logo
    const ls = W * 0.35;
    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.roundRect(W/2 - ls/2, H * 0.18, ls, ls, ls*0.2);
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.font = `bold ${ls * 0.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', W/2, H * 0.18 + ls/2);

    // Checkmark
    const ckx = W/2 + ls * 0.35;
    const cky = H * 0.18;
    const ckr = ls * 0.2;
    ctx.beginPath();
    ctx.arc(ckx, cky, ckr, 0, Math.PI*2);
    ctx.fillStyle = GREEN;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ckx - ckr*0.35, cky);
    ctx.lineTo(ckx - ckr*0.05, cky + ckr*0.3);
    ctx.lineTo(ckx + ckr*0.4, cky - ckr*0.25);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Text
    ctx.fillStyle = WHITE;
    ctx.font = `bold ${W * 0.085}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BRAINSAIT', W/2, H * 0.78);

    ctx.fillStyle = GOLD;
    ctx.font = `bold ${W * 0.07}px sans-serif`;
    ctx.fillText('TRUSTED', W/2, H * 0.92);
  }

  const outPath = path.join(__dirname, '..', filename);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buf);
  console.log(`  ✅ ${filename} (${W}×${H}, ${(buf.length/1024).toFixed(0)} KB)`);
}

function drawArcText(ctx, text, cx, cy, radius, startAngle, endAngle, direction) {
  const chars = text.split('');
  const totalAngle = endAngle - startAngle;
  const anglePerChar = totalAngle / (chars.length - 1 || 1);

  chars.forEach((char, i) => {
    const angle = startAngle + anglePerChar * i;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    ctx.save();
    ctx.translate(x, y);
    let rotation = angle + Math.PI / 2;
    if (direction === 'down') rotation += Math.PI;
    ctx.rotate(rotation);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

// ── Generate all variants ──
console.log('🛡️  Generating BrainSAIT Trust Badges...\n');
createBadge(512, 512, 'trust-badge-seal.png', 'seal');
createBadge(512, 512, 'trust-badge-seal@2x.png', 'seal'); // same but @2x naming
createBadge(360, 72, 'trust-badge-inline.png', 'inline');
createBadge(120, 120, 'trust-badge-compact.png', 'compact');
createBadge(48, 48, 'trust-badge-favicon.png', 'compact');
console.log('\n🎉 All badges generated!');
