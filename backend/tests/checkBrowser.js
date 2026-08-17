const { chromium } = require('playwright');

(async () => {
  try {
    console.log('Attempting to launch Chromium via Playwright...');
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      console.log('✅ Chromium launched successfully!');
    } catch (e) {
      console.log('Chromium default launch failed, trying system msedge...');
      browser = await chromium.launch({ channel: 'msedge', headless: true });
      console.log('✅ System MS Edge launched successfully!');
    }
    const page = await browser.newPage();
    console.log('Browser page created successfully.');
    await browser.close();
    console.log('Browser closed cleanly.');
  } catch (err) {
    console.error('❌ Browser launch failed:', err.message);
    process.exit(1);
  }
})();
