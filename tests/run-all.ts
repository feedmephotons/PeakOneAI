import puppeteer from 'puppeteer';
import { checkPortActive, startServer, stopServer, setupPage } from './helpers';
import { tier1Tests, deleteMockFile } from './tier1';
import { tier2Tests, deleteBoundaryFiles } from './tier2';
import { tier3Tests } from './tier3';
import { tier4Tests } from './tier4';

const PORT = parseInt(process.env.PORT || '3001', 10);
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  const args = process.argv.slice(2);
  const targetTier = args.find(arg => arg.startsWith('--tier='))?.split('=')[1] || args[0];

  console.log('==================================================');
  console.log('          SaasX E2E Test Suite Runner             ');
  console.log('==================================================\n');

  // Check if port is active
  const isPortActive = await checkPortActive(PORT);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log(`Port ${PORT} is not active. Starting dev server...`);
    serverProcess = await startServer();
  } else {
    console.log(`Dev server already running on port ${PORT}. Reusing instance.`);
  }

  // Launch Puppeteer helper function
  async function launchBrowser() {
    return await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote'],
      timeout: 120000
    });
  }

  console.log('Launching headless browser...');
  let browser = await launchBrowser();
  let page = await setupPage(browser, BASE_URL);

  console.log('Warming up Next.js server (this might take up to 90s)...');
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 90000 });
    console.log('Server warmed up successfully.');
  } catch (err: any) {
    console.warn(`Warmup warning: ${err.message}`);
  }

  const suite: Record<string, Record<string, (page: any, baseUrl: string) => Promise<void>>> = {
    tier1: tier1Tests,
    tier2: tier2Tests,
    tier3: tier3Tests,
    tier4: tier4Tests
  };

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures: { testName: string; tier: string; error: any }[] = [];

  const tiersToRun = targetTier ? [targetTier] : ['tier1', 'tier2', 'tier3', 'tier4'];

  let testsSinceLastRestart = 0;

  for (const tier of tiersToRun) {
    if (!suite[tier]) {
      console.error(`Unknown tier specified: ${tier}. Available: tier1, tier2, tier3, tier4`);
      continue;
    }

    console.log(`\n--------------------------------------------------`);
    console.log(` Running ${tier.toUpperCase()} Tests`);
    console.log(`--------------------------------------------------`);

    const tests = suite[tier];
    for (const [testName, testFn] of Object.entries(tests)) {
      totalTests++;

      // Periodically restart browser to prevent memory bloat
      if (testsSinceLastRestart >= 10) {
        console.log('Recycling browser to clear memory...');
        try {
          await page.close().catch(() => {});
          await browser.close().catch(() => {});
        } catch (err) {}
        try {
          browser = await launchBrowser();
          page = await setupPage(browser, BASE_URL);
        } catch (err: any) {
          console.error(`Failed to relaunch browser: ${err.message}`);
        }
        testsSinceLastRestart = 0;
      }

      console.log(`⏳ [RUNNING] [${tier.toUpperCase()}] ${testName}...`);
      const start = Date.now();
      try {
        await testFn(page, BASE_URL);
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`✅ [PASS]    [${tier.toUpperCase()}] ${testName} (${elapsed}s)`);
        passedTests++;
      } catch (err: any) {
        const elapsed = ((Date.now() - start) / 1000).toFixed(2);
        console.error(`❌ [FAIL]    [${tier.toUpperCase()}] ${testName} (${elapsed}s)`);
        console.error(`   Error: ${err.message || err}`);
        failedTests++;
        failures.push({ testName, tier, error: err });

        // Re-initialize page sandbox on failure to prevent contamination
        try {
          await page.close().catch(() => {});
          await browser.close().catch(() => {});
        } catch (cleanupErr: any) {}
        try {
          browser = await launchBrowser();
          page = await setupPage(browser, BASE_URL);
        } catch (cleanupErr: any) {
          console.error(`Failed to re-initialize browser/page sandbox: ${cleanupErr.message}`);
        }
        testsSinceLastRestart = 0;
      }
      testsSinceLastRestart++;
    }
  }

  console.log('\n==================================================');
  console.log('                 Test Run Summary                 ');
  console.log('==================================================');
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed:         ${passedTests}`);
  console.log(`Failed:         ${failedTests}`);
  console.log('==================================================\n');

  if (failures.length > 0) {
    console.log('Detailed Failures:');
    failures.forEach((f, idx) => {
      console.log(`${idx + 1}. [${f.tier.toUpperCase()}] ${f.testName}`);
      console.log(`   Error: ${f.error.stack || f.error.message || f.error}\n`);
    });
  }

  // Cleanup
  console.log('Cleaning up browser and temporary files...');
  await browser.close();
  deleteMockFile();
  deleteBoundaryFiles();

  if (serverProcess) {
    await stopServer(serverProcess);
  }

  console.log('Done.');
  process.exit(failedTests > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
