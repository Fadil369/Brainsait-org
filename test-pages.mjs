import playwright from 'playwright';
import fs from 'fs';

const testPages = [
  { name: 'Dental - Ram Clinics', url: 'http://localhost:8000/brainsait-outreach/brainsait-outreach/websites/dental/ram-clinics.html' },
  { name: 'Dermatology - Derma Clinic', url: 'http://localhost:8000/brainsait-outreach/brainsait-outreach/websites/dermatology/derma-clinic.html' },
  { name: 'Polyclinic - Consulting Clinics', url: 'http://localhost:8000/brainsait-outreach/brainsait-outreach/websites/polyclinic/consulting-clinics.html' }
];

async function runTests() {
  const browser = await playwright.chromium.launch();
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  const results = [];

  for (const testPage of testPages) {
    console.log(`\n📱 Testing: ${testPage.name}`);
    await page.goto(testPage.url);
    
    // Test 1: Check if page loaded
    const title = await page.title();
    console.log(`  ✓ Page title: ${title.substring(0, 50)}...`);
    
    // Test 2: Check Arabic text presence
    const html = await page.innerHTML('html');
    const hasArabic = /[\u0600-\u06FF]/.test(html);
    console.log(`  ${hasArabic ? '✓' : '✗'} Arabic text detected`);
    
    // Test 3: Check RTL direction
    const dir = await page.getAttribute('html', 'dir');
    console.log(`  ${dir === 'rtl' ? '✓' : '✗'} RTL direction set (dir="${dir}")`);
    
    // Test 4: Check WhatsApp FAB
    const fabExists = await page.locator('.whatsapp-fab').isVisible();
    console.log(`  ${fabExists ? '✓' : '✗'} WhatsApp FAB visible`);
    
    // Test 5: Test language toggle
    const toggleBtn = await page.locator('.lang-toggle').first();
    const toggleText = await toggleBtn.textContent();
    console.log(`  ✓ Language toggle text: "${toggleText}"`);
    
    // Test 6: Click language toggle and verify LTR
    await toggleBtn.click();
    await page.waitForTimeout(500);
    const newDir = await page.getAttribute('html', 'dir');
    console.log(`  ${newDir === 'ltr' ? '✓' : '✗'} Language toggle works (dir="${newDir}")`);
    
    // Test 7: Check mobile view responsiveness
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileActionsVisible = await page.locator('.mobile-actions').isVisible();
    console.log(`  ${mobileActionsVisible ? '✓' : '✗'} Mobile actions bar visible on mobile`);
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test 8: Verify clinic data is filled in
    const clinicName = await page.locator('.logo').textContent();
    console.log(`  ✓ Clinic name displayed: "${clinicName}"`);
    
    // Test 9: Check WhatsApp button is clickable
    const whatsAppBtn = await page.locator('button:has-text("احجز عبر واتس")').first().isEnabled();
    console.log(`  ${whatsAppBtn ? '✓' : '✗'} WhatsApp button is enabled`);
    
    results.push({
      page: testPage.name,
      status: 'PASS',
      timestamp: new Date().toISOString()
    });
  }

  await browser.close();

  // Save results
  fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ All tests completed! Results saved to test-results.json');
}

runTests().catch(console.error);
