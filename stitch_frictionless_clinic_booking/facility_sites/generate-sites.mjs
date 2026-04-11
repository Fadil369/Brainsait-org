import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const facilities = [
  {
    name: "Ram Clinics",
    arabicName: "رام كلينكس",
    segment: "dental",
    specialty: "Dental & Medical",
    website: "https://ramclinics.com",
    phone: "920004567",
    location: "Al-Sahafa / Al-Rawdah",
    tagline: "High-volume care network with precision booking orchestration.",
    signaturePrograms: ["Family Dental Flows", "Specialty Referral Routing", "Branch-Aware Slot Intelligence"]
  },
  {
    name: "Sigal Dental Clinic",
    arabicName: "عيادة سيجال",
    segment: "dental",
    specialty: "Premium Dentistry",
    website: "https://sigal.sa",
    phone: "0114831111",
    location: "Al-Takhassusi St",
    tagline: "Premium dentistry experience with concierge-grade appointment design.",
    signaturePrograms: ["VIP Smile Journeys", "Consult-to-Chair Compression", "White-Glove Follow-up Loops"]
  },
  {
    name: "Imtiaz Dental Center",
    arabicName: "مركز امتياز للأسنان",
    segment: "dental",
    specialty: "Specialized Dentistry",
    website: "https://imtiaz.com.sa",
    phone: "0114626633",
    location: "Al-Olaya District",
    tagline: "Specialized dental pathways engineered to eliminate booking leakage.",
    signaturePrograms: ["Complex Case Prioritization", "Specialist Calendar Fusion", "Pre-visit Readiness Automation"]
  },
  {
    name: "Avicena Dental Center",
    arabicName: "مركز أفيسينا للأسنان",
    segment: "dental",
    specialty: "Orthodontics / Implants",
    website: "https://avicena.com.sa",
    phone: "0112005577",
    location: "King Fahd Road",
    tagline: "Orthodontic and implant journeys with conversion-safe scheduling.",
    signaturePrograms: ["Implant Case Funnels", "Ortho Program Sequencing", "Treatment Milestone Reminders"]
  },
  {
    name: "Star Smiles",
    arabicName: "ستار سمايلز",
    segment: "dental",
    specialty: "Pediatric / Cosmetic",
    website: "https://starsmiles.com.sa",
    phone: "0114164433",
    location: "Al-Sulaimaniyah",
    tagline: "Pediatric and cosmetic flows designed for speed, trust, and continuity.",
    signaturePrograms: ["Parent-Friendly Booking UX", "Aesthetic Consult Fast Lanes", "No-Show Rescue Sequences"]
  },
  {
    name: "Derma Clinic",
    arabicName: "عيادة ديرما",
    segment: "derma",
    specialty: "Dermatology / Laser",
    website: "https://dermaclinic.com.sa",
    phone: "0114651919",
    location: "Olaya St, Al-Murooj",
    tagline: "Clinical skin journeys that qualify leads before the first consult.",
    signaturePrograms: ["Skin Concern Triage", "Laser Candidacy Scoring", "Authority Content Pipelines"]
  },
  {
    name: "Elite Medical Center",
    arabicName: "إيليت ميديكال سنتر",
    segment: "derma",
    specialty: "Aesthetic Surgery",
    website: "https://elitemc.com",
    phone: "0114616777",
    location: "Prince Muhammad St",
    tagline: "Aesthetic surgery conversion systems with premium authority storytelling.",
    signaturePrograms: ["Surgery Readiness Qualification", "Consult Confidence Framework", "Decision-Stage Nurture Paths"]
  },
  {
    name: "Kaya Skin Clinic",
    arabicName: "كايا سكين كلينك",
    segment: "derma",
    specialty: "Clinical Skincare",
    website: "https://kayaskinclinic.com",
    phone: "0114810233",
    location: "Al-Takhassusi St",
    tagline: "Evidence-led skincare engagement with automated intake intelligence.",
    signaturePrograms: ["Concern-to-Protocol Mapping", "Clinical Education Funnels", "Productive Follow-up Cadence"]
  },
  {
    name: "Medica Clinics",
    arabicName: "ميديكا كلينكس",
    segment: "derma",
    specialty: "Plastic Surgery",
    website: "https://medicaclinic.com.sa",
    phone: "0112120000",
    location: "Al-Mu'tamar Dist",
    tagline: "Surgical lead qualification that protects doctor time and boosts closure.",
    signaturePrograms: ["Procedure Intent Matrix", "Risk-Aware Pre-screening", "Consult Utilization Optimization"]
  },
  {
    name: "Renewal Reshape",
    arabicName: "رينيوال ريشيب",
    segment: "derma",
    specialty: "Cosmetic Surgery",
    website: "https://renewalreshape.com.sa",
    phone: "0112001144",
    location: "Northern Ring Rd",
    tagline: "Cosmetic surgery lifecycle journeys built for trust and conversion velocity.",
    signaturePrograms: ["Aesthetic Funnel Segmentation", "Pre-op Conversion Tracks", "Post-op Retention Automation"]
  },
  {
    name: "Consulting Clinics",
    arabicName: "كونسلتنج كلينكس",
    segment: "polyclinic",
    specialty: "Multi-Specialty",
    website: "https://consultingclinics.com",
    phone: "0114646330",
    location: "Makkah Al-Mukarramah Rd",
    tagline: "Multi-specialty executive journeys with full-lifecycle orchestration.",
    signaturePrograms: ["Cross-Specialty Navigation", "Executive Care Concierge", "Retention Intelligence Loops"]
  },
  {
    name: "Dallah Health",
    arabicName: "دله الصحية",
    segment: "polyclinic",
    specialty: "Multi-Specialty",
    website: "https://dallah-health.com",
    phone: "920012222",
    location: "Al-Nakheel / Al-Namudajiyah",
    tagline: "Enterprise-grade care delivery with bilingual patient growth automation.",
    signaturePrograms: ["Enterprise Intake Streams", "Arabic/English Journey Control", "Lifecycle Revenue Protection"]
  },
  {
    name: "First Clinic",
    arabicName: "فيرست كلينك",
    segment: "polyclinic",
    specialty: "Executive Health",
    website: "https://firstclinic.com.sa",
    phone: "0112222111",
    location: "King Abdullah Rd",
    tagline: "Executive health experiences designed with precision and continuity.",
    signaturePrograms: ["VIP Intake Architecture", "Priority Care Timelines", "Executive Preventive Programs"]
  },
  {
    name: "Specialized Medical Center",
    arabicName: "المركز الطبي التخصصي",
    segment: "polyclinic",
    specialty: "Comprehensive Care",
    website: "https://smc.com.sa",
    phone: "0114343800",
    location: "King Fahd Rd",
    tagline: "Comprehensive care platform powered by full-funnel patient automation.",
    signaturePrograms: ["Holistic Care Routing", "Continuity-of-Care Flows", "Bilingual Growth Expansion"]
  }
];

// Clinical Atelier Light Theme with Segment Accents
const segmentConfig = {
  dental: {
    primary: "#003b42",
    accent: "#00c4b4",
    accentLight: "rgba(0, 196, 180, 0.08)",
    focusTitle: "Booking Friction Suppression System",
    focusText: "Built to remove manual scheduling leaks, missed callbacks, and branch-level overflow."
  },
  derma: {
    primary: "#003b42",
    accent: "#c47c5f",
    accentLight: "rgba(196, 124, 95, 0.08)",
    focusTitle: "Authority-Driven Lead Qualification",
    focusText: "Automated lead scoring and clinical authority content that filters intent before consult time."
  },
  polyclinic: {
    primary: "#003b42",
    accent: "#d4970f",
    accentLight: "rgba(212, 151, 15, 0.08)",
    focusTitle: "Full-Lifecycle Executive Care Automation",
    focusText: "Bilingual patient operations from acquisition to long-term retention across specialties."
  }
};

const esc = (str) =>
  String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const makePage = (facility) => {
  const config = segmentConfig[facility.segment];
  const signature = facility.signaturePrograms
    .map(p => `<li><span>◆</span><p>${esc(p)}</p></li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(facility.name)} | BRAINSAIT Premium Digital Experience</title>
  <meta name="description" content="${esc(facility.tagline)} Book online with WhatsApp integration. Bilingual Arabic-English healthcare booking system." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg-base: #f3faff;
      --surface: #ffffff;
      --container-low: #e6f6ff;
      --container-high: #cfe6f2;
      --primary: #003b42;
      --accent: ${config.accent};
      --accent-light: ${config.accentLight};
      --on-surface: #071e27;
      --muted: #49617b;
      --glass-blur: 14px;
      --radius-lg: 20px;
      --radius-xl: 28px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      font-family: 'Inter', 'Noto Kufi Arabic', sans-serif;
      background: 
        radial-gradient(42rem 30rem at 0% -10%, var(--accent-light), transparent 68%),
        radial-gradient(32rem 20rem at 100% 100%, rgba(212, 151, 15, 0.04), transparent 72%),
        var(--bg-base);
      color: var(--on-surface);
      line-height: 1.6;
    }

    .container {
      width: min(1200px, 94vw);
      margin: 0 auto;
    }

    /* Navigation */
    nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(243, 250, 255, 0.85);
      backdrop-filter: blur(var(--glass-blur));
      border-bottom: 1px solid rgba(0, 196, 180, 0.12);
      padding: 1rem 0;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .clinic-name {
      font-family: 'Manrope', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }

    .clinic-name-ar {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--muted);
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .btn-cta {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.813rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 196, 180, 0.2);
    }

    .lang-toggle {
      background: transparent;
      border: 2px solid var(--primary);
      color: var(--primary);
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
    }

    /* Hero Section */
    .hero {
      padding: 3rem 0;
      text-align: right;
    }

    .hero h1 {
      font-family: 'Manrope', sans-serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      line-height: 1.1;
      color: var(--primary);
      font-weight: 800;
      margin-bottom: 0.5rem;
    }

    .hero-subtitle {
      font-size: 0.95rem;
      color: var(--muted);
      margin-bottom: 0.5rem;
    }

    .hero-tagline {
      font-size: 1rem;
      color: var(--on-surface);
      line-height: 1.7;
      max-width: 70ch;
      margin-left: auto;
      margin-bottom: 2rem;
    }

    .hero-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .kpi {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 196, 180, 0.12);
      border-radius: 16px;
      padding: 1rem;
      text-align: right;
    }

    .kpi-value {
      font-family: 'Manrope', sans-serif;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--accent);
      display: block;
      margin-bottom: 0.25rem;
    }

    .kpi-label {
      font-size: 0.813rem;
      color: var(--muted);
    }

    /* Main Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 2rem;
      margin-top: 3rem;
    }

    /* Feature Cards */
    .feature-cards {
      display: grid;
      gap: 1rem;
    }

    .feature-card {
      background: linear-gradient(135deg, var(--accent-light), rgba(255,255,255,0.5));
      border: 1px solid var(--accent);
      border-right-width: 4px;
      border-radius: 16px;
      padding: 1.5rem;
      text-align: right;
    }

    .feature-card h3 {
      font-family: 'Manrope', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      font-size: 0.938rem;
      color: var(--muted);
      line-height: 1.6;
    }

    /* Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .sidebar-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 196, 180, 0.12);
      border-radius: 20px;
      padding: 1.5rem;
    }

    .sidebar-title {
      font-family: 'Manrope', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1rem;
      text-align: right;
    }

    .signature-list {
      list-style: none;
      display: grid;
      gap: 0.75rem;
    }

    .signature-list li {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      text-align: right;
    }

    .signature-list span {
      color: var(--accent);
      font-weight: 700;
      flex-shrink: 0;
    }

    .signature-list p {
      font-size: 0.938rem;
      color: var(--muted);
      margin: 0;
    }

    .contact-info {
      display: grid;
      gap: 0.75rem;
      font-size: 0.938rem;
      color: var(--muted);
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .contact-label {
      font-weight: 600;
      color: var(--primary);
    }

    .contact-value {
      color: var(--on-surface);
    }

    .contact-value a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.3s;
    }

    .contact-value a:hover {
      opacity: 0.8;
    }

    .btn-group {
      display: grid;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white;
      border: none;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.938rem;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 196, 180, 0.2);
    }

    .btn-secondary {
      background: var(--container-low);
      color: var(--primary);
      border: 1px solid rgba(0, 196, 180, 0.2);
      padding: 0.7rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.938rem;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-secondary:hover {
      background: var(--container-high);
    }

    /* WhatsApp FAB */
    .whatsapp-fab {
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      box-shadow: 0 8px 20px rgba(0, 196, 180, 0.3);
      cursor: pointer;
      transition: all 0.3s;
      animation: pulse 2s infinite;
    }

    .whatsapp-fab:hover {
      transform: scale(1.1);
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 8px 20px rgba(0, 196, 180, 0.3); }
      50% { box-shadow: 0 8px 30px rgba(0, 196, 180, 0.5); }
    }

    /* Footer */
    footer {
      border-top: 1px solid rgba(0, 196, 180, 0.12);
      padding: 2rem 0;
      margin-top: 4rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.813rem;
    }

    /* Mobile */
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        flex-direction: row;
      }
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 1.75rem;
      }

      .hero-kpis {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .kpi {
        padding: 0.75rem;
      }

      .kpi-value {
        font-size: 1.25rem;
      }

      .sidebar {
        flex-direction: column;
      }

      .feature-card {
        padding: 1rem;
      }

      .nav-actions {
        gap: 0.5rem;
      }

      .btn-cta {
        padding: 0.4rem 0.75rem;
        font-size: 0.75rem;
      }

      .whatsapp-fab {
        bottom: 1.5rem;
        left: 1.5rem;
        width: 48px;
        height: 48px;
        font-size: 1.5rem;
      }
    }

    /* LTR Support */
    [dir="ltr"] {
      text-align: left;
    }

    [dir="ltr"] .nav-content {
      flex-direction: row-reverse;
    }

    [dir="ltr"] .clinic-name-ar {
      display: none;
    }

    [dir="ltr"] .hero {
      text-align: left;
    }

    [dir="ltr"] .hero-tagline {
      margin-left: 0;
      margin-right: auto;
    }

    [dir="ltr"] .feature-card {
      text-align: left;
      border-right-width: 1px;
      border-left-width: 4px;
    }

    [dir="ltr"] .sidebar-title {
      text-align: left;
    }

    [dir="ltr"] .signature-list li {
      flex-direction: row-reverse;
      text-align: left;
    }

    [dir="ltr"] .contact-item {
      justify-content: flex-start;
    }

    [dir="ltr"] .whatsapp-fab {
      left: auto;
      right: 2rem;
    }
  </style>
</head>
<body dir="rtl">
  <nav>
    <div class="container nav-content">
      <div class="nav-actions">
        <button class="btn-cta" onclick="openWhatsApp()">احجز الآن</button>
        <button class="lang-toggle" onclick="toggleLang()">EN</button>
      </div>
      <div>
        <div class="clinic-name">${esc(facility.name)}</div>
        <div class="clinic-name-ar">${esc(facility.arabicName)}</div>
      </div>
    </div>
  </nav>

  <main class="container">
    <section class="hero">
      <h1>${esc(facility.name)}</h1>
      <p class="hero-subtitle">${esc(facility.arabicName)}</p>
      <p class="hero-tagline">${esc(facility.tagline)}</p>
      
      <div class="hero-kpis">
        <div class="kpi">
          <span class="kpi-value">24/7</span>
          <span class="kpi-label">حجز مؤتمت</span>
        </div>
        <div class="kpi">
          <span class="kpi-value">AR+EN</span>
          <span class="kpi-label">ثنائي اللغة</span>
        </div>
        <div class="kpi">
          <span class="kpi-value">📱</span>
          <span class="kpi-label">واتس بوس</span>
        </div>
      </div>
    </section>

    <div class="content-grid">
      <section>
        <h2 class="sidebar-title">${esc(config.focusTitle)}</h2>
        <p class="hero-tagline" style="margin-bottom: 2rem;">${esc(config.focusText)}</p>
        <div class="feature-cards">
          <div class="feature-card">
            <h3>Dynamic Slot Routing</h3>
            <p>Automatically pushes demand to the right branch, doctor, and service lane.</p>
          </div>
          <div class="feature-card">
            <h3>No-Show Rescue Engine</h3>
            <p>Predictive reminders with smart refill suggestions for at-risk appointments.</p>
          </div>
          <div class="feature-card">
            <h3>Smart Integration</h3>
            <p>Seamless WhatsApp, SMS, and email confirmation workflows.</p>
          </div>
        </div>
      </section>

      <aside class="sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">البرامج الموقعة</h3>
          <ul class="signature-list">
            ${signature}
          </ul>
        </div>

        <div class="sidebar-card">
          <h3 class="sidebar-title">التواصل</h3>
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-value"><strong>${esc(facility.location)}</strong></span>
              <span>📍</span>
            </div>
            <div class="contact-item">
              <span class="contact-value"><a href="tel:${esc(facility.phone)}">${esc(facility.phone)}</a></span>
              <span>📞</span>
            </div>
            <div class="contact-item">
              <span class="contact-value"><a href="${esc(facility.website)}" target="_blank">${esc(facility.website)}</a></span>
              <span>🌐</span>
            </div>
          </div>
          <div class="btn-group">
            <button class="btn-primary" onclick="openWhatsApp()">واتس 💬</button>
            <a href="tel:${esc(facility.phone)}" class="btn-secondary">اتصال 📞</a>
          </div>
        </div>
      </aside>
    </div>
  </main>

  <div class="whatsapp-fab" onclick="openWhatsApp()">💬</div>

  <footer>
    <p>مدعوم من BRAINSAIT · ${new Date().getFullYear()} · <a href="https://brainsait.org" target="_blank" style="color: var(--primary); text-decoration: none;">brainsait.org</a></p>
  </footer>

  <script>
    const phoneNumber = "${esc(facility.phone)}";
    const clinicName = "${esc(facility.name)}";

    function openWhatsApp() {
      const msg = encodeURIComponent(\`أود حجز موعد في \${clinicName}\`);
      window.open(\`https://wa.me/966\${phoneNumber.replace(/^0/, '')}\${msg.trim() ? \`?text=\${msg}\` : ''}\`, '_blank');
    }

    function toggleLang() {
      const html = document.documentElement;
      html.dir = html.dir === 'rtl' ? 'ltr' : 'rtl';
      html.lang = html.lang === 'ar' ? 'en' : 'ar';
    }
  </script>
</body>
</html>`;
};

async function generateAllPages() {
  for (const facility of facilities) {
    const slug = facility.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    const dirPath = path.join(__dirname, slug);
    await mkdir(dirPath, { recursive: true });
    
    const html = makePage(facility);
    const filePath = path.join(dirPath, 'index.html');
    
    await writeFile(filePath, html, 'utf-8');
    console.log(`✓ Generated ${slug}/index.html`);
  }
  
  console.log(`\n✅ All 14 per-clinic pages generated successfully!`);
}

generateAllPages().catch(err => {
  console.error('Error generating pages:', err);
  process.exit(1);
});
