import puppeteer from 'puppeteer';
import { checkPortActive, startServer, stopServer, setupPage } from './helpers';
import { tier1Tests, deleteMockFile } from './tier1';
import { tier2Tests, deleteBoundaryFiles } from './tier2';
import { tier3Tests } from './tier3';
import { tier4Tests } from './tier4';

const BASE_URL = 'http://localhost:3001';

async function main() {
  const args = process.argv.slice(2);
  const targetTier = args.find(arg => arg.startsWith('--tier='))?.split('=')[1] || args[0];

  console.log('==================================================');
  console.log('          SaasX E2E Test Suite Runner             ');
  console.log('==================================================\n');

  // Check if port 3001 is active
  const isPortActive = await checkPortActive(3001);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log('Port 3001 is not active. Starting dev server...');
    serverProcess = await startServer();
  } else {
    console.log('Dev server already running on port 3001. Reusing instance.');
  }

  // Launch Puppeteer
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await setupPage(browser, BASE_URL);

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
      }
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
