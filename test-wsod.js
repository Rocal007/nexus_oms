const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');

(async () => {
  try {
    const chromePaths = chromeLauncher.Launcher.getInstallations();
    if (chromePaths.length === 0) {
      console.log('No Chrome installation found.');
      process.exit(1);
    }
    
    console.log('Using Chrome:', chromePaths[0]);
    const browser = await puppeteer.launch({
      executablePath: chromePaths[0],
      headless: true
    });
    
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type().toUpperCase(), msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:5100/#/');
    await page.goto('http://localhost:5100/#/', { waitUntil: 'networkidle0', timeout: 10000 });
    
    console.log('Done rendering.');
    await browser.close();
  } catch(e) {
    console.error('Script Error:', e);
  }
})();
