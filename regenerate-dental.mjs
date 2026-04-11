import fs from 'fs';
import path from 'path';

// Read clinic data
const clinicsData = JSON.parse(fs.readFileSync('./stitch_frictionless_clinic_booking/facility_sites/subdomains.json', 'utf-8'));

// Get dental template
const dentalTemplatePath = './brainsait-outreach/brainsait-outreach/websites/dental/template.html';
const template = fs.readFileSync(dentalTemplatePath, 'utf-8');

// Dental clinics
const dentalClinics = [
  'ram-clinics',
  'sigal-dental-clinic',
  'imtiaz-dental-center',
  'avicena-dental-center',
  'star-smiles'
];

// Generate pages
const outputDir = './brainsait-outreach/brainsait-outreach/websites/dental';

dentalClinics.forEach(slug => {
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

  const filename = path.join(outputDir, `${slug}.html`);
  fs.writeFileSync(filename, html, 'utf-8');
  console.log(`✅ Generated: ${filename}`);
});

console.log('\n✅ All dental pages regenerated!');
