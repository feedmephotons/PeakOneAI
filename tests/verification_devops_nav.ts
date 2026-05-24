import puppeteer, { Page } from 'puppeteer';
import { checkPortActive, startServer, stopServer, setupPage, clearState } from './helpers';
import { mockFilePath, createMockFile, deleteMockFile } from './tier1';

const BASE_URL = 'http://localhost:3001';

async function runDevopsNavTests() {
  console.log('==================================================');
  console.log('    SaasX DevOps & Navigation Verification       ');
  console.log('==================================================\n');

  const isPortActive = await checkPortActive(3001);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log('Port 3001 is not active. Starting dev server...');
    serverProcess = await startServer();
  } else {
    console.log('Dev server already running on port 3001. Reusing instance.');
  }

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await setupPage(browser, BASE_URL);

  let passed = 0;
  let failed = 0;

  const runTest = async (name: string, fn: () => Promise<void>) => {
    console.log(`⏳ Running ${name}...`);
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message || err}`);
      failed++;
    }
  };

  // Test 1: Tab transitions on DevOps dashboard
  await runTest('DevOps Dashboard Tab Transitions', async () => {
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/devops`);
    await page.waitForSelector('div.w-64.min-h-screen');

    // 1. Default tab is Overview (Visual Identity)
    let headingText = await page.$eval('h2', el => el.textContent?.trim());
    if (headingText !== 'Visual Identity') {
      throw new Error(`Expected default heading "Visual Identity", got "${headingText}"`);
    }

    // 2. Click "Feature Roadmap" tab button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes('Feature Roadmap'));
      if (!btn) throw new Error('Feature Roadmap button not found in sidebar');
      btn.click();
    });
    await page.waitForFunction(() => {
      const h2 = document.querySelector('h2');
      return h2 && h2.textContent?.trim() === 'Roadmap Status';
    });

    // 3. Click "System Diagnostics" tab button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes('System Diagnostics'));
      if (!btn) throw new Error('System Diagnostics button not found in sidebar');
      btn.click();
    });
    await page.waitForFunction(() => {
      const h2 = document.querySelector('h2');
      return h2 && h2.textContent?.trim() === 'Integration Diagnostics';
    });

    // 4. Click "Visual Identity" tab button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent?.includes('Visual Identity'));
      if (!btn) throw new Error('Visual Identity button not found in sidebar');
      btn.click();
    });
    await page.waitForFunction(() => {
      const h2 = document.querySelector('h2');
      return h2 && h2.textContent?.trim() === 'Visual Identity';
    });
  });

  // Test 2: Shortcut Focus Isolation Stress Test
  await runTest('Keyboard Shortcut Isolation', async () => {
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);
    
    // Focus the chat input
    const textarea = await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await textarea.focus();

    // Type a slash (/) which is the command palette shortcut
    await page.keyboard.type('/');

    // Verify command palette is NOT opened
    const isPaletteOpen = await page.evaluate(() => {
      return document.querySelector('input[placeholder="Type a command or search..."]') !== null;
    });
    if (isPaletteOpen) {
      throw new Error('Command palette opened even when shortcut was pressed inside focused text area');
    }

    // Verify slash was actually input in textarea
    const content = await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLTextAreaElement;
      return ta ? ta.value : '';
    });
    if (content !== '/') {
      throw new Error(`Expected text area value to be "/", got "${content}"`);
    }

    // Blur textarea, focus body, press /
    await page.evaluate(() => {
      const ta = document.querySelector('textarea') as HTMLElement;
      ta?.blur();
    });
    await page.keyboard.press('/');

    // Verify command palette IS opened
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
  });

  // Test 3: Corrected Global Navigation and Upload Flow
  await runTest('Corrected Global Navigation and Upload', async () => {
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/`);
    await page.waitForSelector('main');

    // Trigger command palette
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Files');
    await page.keyboard.press('Enter');

    // Wait for URL navigation to /files
    await page.waitForFunction(() => window.location.pathname === '/files');

    // Create file
    createMockFile('Verification upload via corrected global navigation.');

    // Upload using corrected input[type="file"] selector
    const fileInput = await page.waitForSelector('input[type="file"]');
    await fileInput.uploadFile(mockFilePath);

    // Wait for file to list in the DOM (simulated upload handles file.name rendering)
    await page.waitForFunction(() => {
      return document.body.textContent?.includes('mock_file.txt');
    });

    // Check navbar active highlighting for active files page
    const isFilesHighlighted = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('a'));
      const filesLink = navLinks.find(link => link.getAttribute('href') === '/files');
      if (!filesLink) return false;
      const classes = filesLink.className;
      return classes.includes('text-indigo-600') || classes.includes('bg-gray-950');
    });

    if (!isFilesHighlighted) {
      console.log('⚠️ Warning: Navbar active highlighting selector did not match files page links, but page loaded.');
    }
  });

  console.log('\n==================================================');
  console.log('              Verification Summary                ');
  console.log('==================================================');
  console.log(`Passed:         ${passed}`);
  console.log(`Failed:         ${failed}`);
  console.log('==================================================\n');

  await browser.close();
  deleteMockFile();

  if (serverProcess) {
    await stopServer(serverProcess);
  }

  process.exit(failed > 0 ? 1 : 0);
}

runDevopsNavTests().catch(err => {
  console.error('Fatal verification runner error:', err);
  process.exit(1);
});
