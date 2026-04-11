import fs from 'fs';
import path from 'path';

// Read clinic data
const clinicsData = JSON.parse(fs.readFileSync('./stitch_frictionless_clinic_booking/facility_sites/subdomains.json', 'utf-8'));

// Define segment mappings
const segments = {
  'derma-cosmetic': {
    templatePath: './brainsait-outreach/brainsait-outreach/websites/dermatology/template.html',
    outputDir: './brainsait-outreach/brainsait-outreach/websites/dermatology',
    clinics: ['derma-clinic', 'elite-medical-center', 'kaya-skin-clinic', 'medica-clinics', 'renewal-reshape']
  },
  'premium-polyclinic': {
    templatePath: './brainsait-outreach/brainsait-outreach/websites/polyclinic/template.html',
    outputDir: './brainsait-outreach/brainsait-outreach/websites/polyclinic',
    clinics: ['consulting-clinics', 'dallah-health', 'first-clinic', 'specialized-medical-center']
  }
};

function generatePages(segmentKey) {
  const config = segments[segmentKey];
  
  if (!fs.existsSync(config.templatePath)) {
    console.error(`Template not found: ${config.templatePath}`);
    return;
  }

  let template = fs.readFileSync(config.templatePath, 'utf-8');

  config.clinics.forEach(slug => {
    const clinic = clinicsData.find(c => c.slug === slug);
    if (!clinic) {
      console.warn(`Clinic not found: ${slug}`);
      return;
    }

    let html = template
      .replace(/{{CLINIC_NAME}}/g, clinic.name)
      .replace(/{{CLINIC_SPECIALTY}}/g, clinic.specialty)
      .replace(/{{CLINIC_LOCATION}}/g, clinic.location)
      .replace(/{{CLINIC_PHONE}}/g, clinic.phone)
      .replace(/{{CLINIC_WEBSITE}}/g, clinic.website);

    // Determine output filename
    const filename = path.join(config.outputDir, `${slug}.html`);
    fs.writeFileSync(filename, html, 'utf-8');
    console.log(`✅ Generated: ${filename}`);
  });
}

// Generate both segments
console.log('🔨 Generating dermatology pages...');
generatePages('derma-cosmetic');

console.log('\n🔨 Generating polyclinic pages...');
generatePages('premium-polyclinic');

console.log('\n✅ All pages generated successfully!');
