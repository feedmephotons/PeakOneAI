import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { checkPortActive, startServer, stopServer, setupPage, setMockConfig, resetMockConfig, clearState } from './helpers';

const BASE_URL = 'http://localhost:3001';
const largeFilePath = path.join(process.cwd(), 'tests', 'mock_large_file.txt');
const regularFilePath = path.join(process.cwd(), 'tests', 'mock_regular_file.txt');

function createTestFiles() {
  // Create a 60MB large file to exceed the "50MB" limit advertised
  fs.writeFileSync(largeFilePath, 'X'.repeat(60 * 1024 * 1024)); 
  fs.writeFileSync(regularFilePath, 'Regular test file content');
}

function deleteTestFiles() {
  [largeFilePath, regularFilePath].forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
}

async function runStressTests() {
  console.log('==================================================');
  console.log('         SaasX Upload Stress Test Suite           ');
  console.log('==================================================\n');

  createTestFiles();

  const isPortActive = await checkPortActive(3001);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log('Port 3001 is not active. Starting dev server...');
    serverProcess = await startServer();
  } else {
    console.log('Dev server already running on port 3001. Reusing instance.');
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await setupPage(browser, BASE_URL);

  try {
    // ----------------------------------------------------
    // Scenario 1: Empty Queue Check
    // ----------------------------------------------------
    console.log('\n--- Scenario 1: Empty Queue Check ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/files/upload`);
    await page.waitForSelector('label[for="file-upload"]');
    
    const isUploadBtnVisible = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => 
        btn.textContent?.includes('Upload & Analyze')
      );
    });
    console.log(`[OBSERVATION] Is 'Upload & Analyze' button visible when queue is empty? ${isUploadBtnVisible}`);
    if (isUploadBtnVisible) {
      console.log('❌ FAIL: Upload button visible on empty queue.');
    } else {
      console.log('✅ PASS: Upload button correctly hidden on empty queue.');
    }

    // ----------------------------------------------------
    // Scenario 2: Large File Size Check (Client-side bypass/validation)
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Large File Size Handling ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    console.log('Uploading a 60MB file...');
    await fileInput.uploadFile(largeFilePath);

    // Verify it is listed in the queue (since there is no client-side size check)
    const isFileInQueue = await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('mock_large_file.txt') && text.includes('60.0 MB');
    }, { timeout: 5000 }).then(() => true).catch(() => false);

    console.log(`[OBSERVATION] Is large file accepted in queue without client-side error? ${isFileInQueue}`);
    if (isFileInQueue) {
      console.log('⚠️ RISK: Frontend accepts files larger than the stated 50MB limit with no client-side validation.');
    } else {
      console.log('✅ PASS: Frontend rejected the large file.');
    }

    // ----------------------------------------------------
    // Scenario 3: Backend Error Handling (silence vs notification)
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Backend Error Handling ---');
    await clearState(page, BASE_URL);
    setMockConfig({ uploadWithAiSuccess: false }); // Force 500 error
    
    await page.goto(`${BASE_URL}/files/upload`);
    const fileInput3 = await page.waitForSelector('input#file-upload');
    await fileInput3.uploadFile(regularFilePath);

    const uploadBtn3 = await page.waitForSelector('button:has(svg.lucide-upload)');
    console.log('Triggering upload with mocked 500 Internal Server Error...');
    await uploadBtn3.click();

    // Wait for upload loop to end (which sets uploading = false)
    await page.waitForFunction(() => {
      const btn = document.querySelector('button');
      return !btn || !btn.textContent?.includes('Uploading & Analyzing...');
    });

    // Check if error message is shown in UI
    const uiText = await page.evaluate(() => document.body.textContent || '');
    const hasErrorText = uiText.toLowerCase().includes('failed') || uiText.toLowerCase().includes('error');
    console.log(`[OBSERVATION] Does UI display an error notification/message? ${hasErrorText}`);
    
    // Check if files list was cleared anyway
    const hasFilesLeft = uiText.includes('mock_regular_file.txt') && uiText.includes('Selected Files');
    console.log(`[OBSERVATION] Are failed files cleared from the queue anyway? ${!hasFilesLeft}`);

    if (!hasErrorText && !hasFilesLeft) {
      console.log('❌ FAIL: The file failed to upload, but the queue was cleared and the user was NOT notified (silent failure).');
    } else {
      console.log('✅ PASS: UI correctly notified user or kept files in the queue.');
    }

    // ----------------------------------------------------
    // Scenario 4: Race Condition - Adding files during active upload
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: State Overwrite / Race Condition ---');
    await clearState(page, BASE_URL);
    
    // Setup slow upload mock by delaying response using custom intercept rules or custom helper config
    // Actually, we can intercept requests inside this test directly!
    await page.setRequestInterception(true);
    
    let uploadStartedPromiseResolve: () => void;
    const uploadStartedPromise = new Promise<void>(resolve => { uploadStartedPromiseResolve = resolve; });

    let resolveUploadResponse: () => void;
    const holdUploadPromise = new Promise<void>(resolve => { resolveUploadResponse = resolve; });

    page.on('request', async (request) => {
      const url = request.url();
      if (url.includes('/api/files/upload-with-ai')) {
        console.log('[MOCK] Intercepted upload request, holding response to simulate network latency...');
        uploadStartedPromiseResolve();
        await holdUploadPromise; // Wait until we explicitly resolve it
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            file: { id: 'demo-slow', name: 'mock_regular_file.txt', size: 100, mimeType: 'text/plain' },
            analysis: { summary: 'Slow analysis complete', tags: ['slow'] }
          })
        });
        return;
      }
      try {
        await request.continue();
      } catch {}
    });

    await page.goto(`${BASE_URL}/files/upload`);
    const fileInput4 = await page.waitForSelector('input#file-upload');
    await fileInput4.uploadFile(regularFilePath);

    const uploadBtn4 = await page.waitForSelector('button:has(svg.lucide-upload)');
    console.log('Clicking upload to start slow upload...');
    await uploadBtn4.click();

    // Wait until request starts
    await uploadStartedPromise;
    console.log('Upload in progress. Now adding a new file to the queue...');

    // Simulate adding another file by dropping it or uploading via fileInput
    // Wait, let's create a second file
    const secondFile = path.join(process.cwd(), 'tests', 'mock_second_file.txt');
    fs.writeFileSync(secondFile, 'Second file content');
    
    // We must evaluate to add the second file to the files array since we can't upload via input while disabled/hidden easily
    // Actually, let's trigger a drop event
    await page.evaluate(() => {
      const dropzone = document.querySelector('div.border-2.border-dashed');
      const file = new File(['second file content'], 'mock_second_file.txt', { type: 'text/plain' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      dropzone?.dispatchEvent(event);
    });

    // Check if the second file shows up in Selected Files list
    const isSecondFileVisible = await page.waitForFunction(() => {
      const text = document.body.textContent || '';
      return text.includes('mock_second_file.txt');
    }, { timeout: 3000 }).then(() => true).catch(() => false);
    console.log(`[OBSERVATION] Is second file added to UI queue while upload is active? ${isSecondFileVisible}`);

    console.log('Resolving the pending upload response...');
    resolveUploadResponse!();

    // Wait for uploading spinner to disappear
    await page.waitForFunction(() => {
      const btn = document.querySelector('button');
      return !btn || !btn.textContent?.includes('Uploading & Analyzing...');
    });

    // Verify if second file is still in the queue or if it was wiped out
    const isSecondFileStillVisible = await page.evaluate(() => {
      return document.body.textContent?.includes('mock_second_file.txt') || false;
    });
    console.log(`[OBSERVATION] Is second file still visible in queue after upload completes? ${isSecondFileStillVisible}`);
    
    if (isSecondFileVisible && !isSecondFileStillVisible) {
      console.log('❌ FAIL: The newly added file was wiped out when setFiles([]) was called at the end of uploadFiles! (State overwrite bug)');
    } else {
      console.log('✅ PASS: State update managed correctly.');
    }

    fs.unlinkSync(secondFile);

    // ----------------------------------------------------
    // Scenario 5: Race Condition - Removing files during active upload
    // ----------------------------------------------------
    console.log('\n--- Scenario 5: Removing file from queue during active upload ---');
    await clearState(page, BASE_URL);
    
    // Set up request interception for holding response again
    let uploadStartedPromiseResolve5: () => void;
    const uploadStartedPromise5 = new Promise<void>(resolve => { uploadStartedPromiseResolve5 = resolve; });

    let resolveUploadResponse5: () => void;
    const holdUploadPromise5 = new Promise<void>(resolve => { resolveUploadResponse5 = resolve; });

    // Remove previous request listener to avoid conflict
    page.removeAllListeners('request');
    await page.setRequestInterception(true);

    page.on('request', async (request) => {
      const url = request.url();
      if (url.includes('/api/files/upload-with-ai')) {
        console.log('[MOCK] Intercepted upload request, holding response...');
        uploadStartedPromiseResolve5();
        await holdUploadPromise5;
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            file: { id: 'demo-remove', name: 'mock_regular_file.txt', size: 100, mimeType: 'text/plain' },
            analysis: { summary: 'Removed check complete', tags: ['remove'] }
          })
        });
        return;
      }
      try {
        await request.continue();
      } catch {}
    });

    await page.goto(`${BASE_URL}/files/upload`);
    const fileInput5 = await page.waitForSelector('input#file-upload');
    await fileInput5.uploadFile(regularFilePath);

    const uploadBtn5 = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn5.click();

    await uploadStartedPromise5;
    console.log('Upload in progress. Clicking remove button in the queue...');

    // Click remove button
    const removeBtn = await page.waitForSelector('button.text-gray-400.hover\\:text-red-500');
    await removeBtn.click();

    // Verify if it is removed from UI selected files
    const isFileRemovedFromUI = await page.evaluate(() => {
      return !document.body.textContent?.includes('mock_regular_file.txt') || false;
    });
    console.log(`[OBSERVATION] Was file visually removed from queue? ${isFileRemovedFromUI}`);

    // Resolve response
    resolveUploadResponse5!();

    // Wait for upload loop to end
    await page.waitForFunction(() => {
      const btn = document.querySelector('button');
      return !btn || !btn.textContent?.includes('Uploading & Analyzing...');
    });

    // Check if the file still shows up in Uploaded Files & AI Analysis list
    const isFileUploaded = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('h3'));
      const uploadedSection = sections.find(h => h.textContent?.includes('Uploaded Files & AI Analysis'));
      return uploadedSection ? document.body.textContent?.includes('mock_regular_file.txt') : false;
    });
    console.log(`[OBSERVATION] Was file still processed and uploaded despite being removed? ${isFileUploaded}`);

    if (isFileRemovedFromUI && isFileUploaded) {
      console.log('❌ FAIL: The file was removed from the selection list UI, but still processed and uploaded! (State inconsistency)');
    } else {
      console.log('✅ PASS: Removing file cancelled its upload.');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
    if (serverProcess) {
      await stopServer(serverProcess);
    }
    deleteTestFiles();
    console.log('\nStress testing run finished.');
  }
}

runStressTests().catch(err => {
  console.error('Fatal stress runner error:', err);
  process.exit(1);
});
