import puppeteer from 'puppeteer';
import { setupPage } from './helpers';

async function main() {
  console.log('Launching browser...');
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote']
    });
    console.log('Browser launched successfully!');
    const page = await setupPage(browser, 'http://localhost:3055');
    console.log('Page created and setup successfully!');
    await page.goto('http://localhost:3055');
    console.log('Navigated to localhost:3055');
    await browser.close();
    console.log('Browser closed.');
  } catch (err: any) {
    console.error('Error:', err);
  }
}

main();
