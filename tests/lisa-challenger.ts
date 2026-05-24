import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { checkPortActive, startServer, stopServer, setupPage, clearState } from './helpers';

const BASE_URL = 'http://localhost:3001';

// File Paths for testing
const extremeFilePath = path.join(process.cwd(), 'tests', 'mock_extreme_60mb.txt');
const binaryDocxPath = path.join(process.cwd(), 'tests', 'mock_binary.docx');
const specialNameFilePath = path.join(process.cwd(), 'tests', 'mock_!@#$%^&()_+.txt');

function createTestFiles() {
  console.log('Creating test files...');
  // 60MB file
  fs.writeFileSync(extremeFilePath, 'X'.repeat(60 * 1024 * 1024));
  // Simulated binary .docx content
  fs.writeFileSync(binaryDocxPath, Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x08, 0x00, 0x08, 0x00])); // PK.. zip signature
  // Special name file
  fs.writeFileSync(specialNameFilePath, 'special name file content');
}

function deleteTestFiles() {
  console.log('Deleting test files...');
  [extremeFilePath, binaryDocxPath, specialNameFilePath].forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
}

async function runChallengerTests() {
  console.log('==================================================');
  console.log('        Lisa AI Chat Assistant Stress Tests       ');
  console.log('==================================================\n');

  createTestFiles();

  const isPortActive = await checkPortActive(3001);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log('Port 3001 is not active. Starting Next.js server...');
    serverProcess = await startServer();
  } else {
    console.log('Server already running on port 3001. Reusing.');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // ----------------------------------------------------
    // Scenario 1: Extreme File Size Upload & UI Performance
    // ----------------------------------------------------
    console.log('\n--- Scenario 1: Extreme File Size Upload & UI Performance ---');
    await page.goto(`${BASE_URL}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    
    console.log('Uploading 60MB extreme file to Lisa Chat client...');
    const startTime = Date.now();
    await fileInput.uploadFile(extremeFilePath);

    // Let's see if the client is responsive or frozen. We can run a simple query in evaluate.
    const isClientResponsive = await page.evaluate(() => {
      return document.querySelector('textarea')?.placeholder === 'Ask Lisa anything...';
    });
    const elapsedMs = Date.now() - startTime;
    console.log(`[OBSERVATION] Uploaded 60MB file. Client responsive: ${isClientResponsive}. Elapsed time: ${elapsedMs}ms`);
    
    // Check if the file is in the queue
    const isFileInQueue = await page.evaluate(() => {
      return document.body.textContent?.includes('mock_extreme_60mb.txt') || false;
    });
    console.log(`[OBSERVATION] Is extreme file listed in chat attachment queue? ${isFileInQueue}`);

    if (isFileInQueue) {
      console.log('⚠️ RISK: Frontend accepts files larger than typical Next.js/Gemini limits (60MB) with no client-side size check or warning.');
    } else {
      console.log('✅ PASS: Frontend successfully rejected or validated the size.');
    }

    // ----------------------------------------------------
    // Scenario 2: Invalid Mime Types & Binary File Handling
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: Invalid Mime Types & Binary File Handling ---');
    await page.goto(`${BASE_URL}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    const fileInput2 = await page.waitForSelector('input[type="file"].hidden');
    console.log('Uploading mock_binary.docx (binary ZIP format)...');
    await fileInput2.uploadFile(binaryDocxPath);

    // Check if the file is listed
    const isDocxInQueue = await page.evaluate(() => {
      return document.body.textContent?.includes('mock_binary.docx') || false;
    });
    console.log(`[OBSERVATION] Is docx accepted in queue? ${isDocxInQueue}`);

    // Intercept request to inspect the payload sent to /api/ai/chat
    await page.setRequestInterception(true);
    let capturedRequestPayload: any = null;

    const requestHandler = async (req: any) => {
      if (req.url().includes('/api/ai/chat') && req.method() === 'POST') {
        capturedRequestPayload = JSON.parse(req.postData() || '{}');
        // Return mock response to prevent real Gemini call
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: 'data: {"type":"content","content":"MOCKED"}\ndata: [DONE]\n'
        });
        return;
      }
      try {
        await req.continue();
      } catch {}
    };

    page.on('request', requestHandler);

    // Type a message and send it
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Analyze this binary doc');
    const sendBtn = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn.click();

    // Wait for request payload to be captured
    let attempts = 0;
    while (!capturedRequestPayload && attempts < 20) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    page.off('request', requestHandler);
    await page.setRequestInterception(false);

    if (capturedRequestPayload) {
      console.log('[OBSERVATION] Captured payload attachments count:', capturedRequestPayload.attachments?.length);
      const docxAttachment = capturedRequestPayload.attachments?.[0];
      if (docxAttachment) {
        console.log(`[OBSERVATION] Attachment Name: ${docxAttachment.name}`);
        console.log(`[OBSERVATION] Attachment Type: ${docxAttachment.type}`); // Let's check mime type
        console.log(`[OBSERVATION] Attachment Base64 begins with: ${docxAttachment.base64?.substring(0, 30)}`);
      }
    } else {
      console.log('❌ FAIL: Request payload was not captured.');
    }

    // ----------------------------------------------------
    // Scenario 3: Stream Line Buffer with Fragmented/Broken JSON SSE
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: Stream Line Buffer with Fragmented/Broken JSON SSE ---');
    await page.goto(`${BASE_URL}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    await page.setRequestInterception(true);

    const sseHandler = async (req: any) => {
      if (req.url().includes('/api/ai/chat') && req.method() === 'POST') {
        // We will send custom fragmented and broken chunk stream
        // We want to test:
        // 1. Partial chunk: data: {"type":"content","content":"Hello"
        // 2. Next chunk:   World"}\n
        // 3. Broken JSON:  data: {invalid-json}\n
        // 4. Regular:      data: {"type":"content","content":" Completed."}\n
        // 5. Done:         data: [DONE]\n
        const chunks = [
          'data: {"type":"content","content":"Hello ',
          'World!"}\n',
          'data: {broken:json}\n',
          'data: {"type":"content","content":" Finished."}\n',
          'data: [DONE]\n\n'
        ];

        // Send response as a pre-constructed body that contains all these lines
        // Wait, how does client process it? The client decoder processes it as text stream.
        // We can write all chunks joined by empty or newlines to simulate how client receives them.
        const responseBody = chunks.join('');
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: responseBody
        });
        return;
      }
      try {
        await req.continue();
      } catch {}
    };

    page.on('request', sseHandler);

    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Test fragmentation');
    const sendBtn3 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn3.click();

    // Verify if client successfully assembled and rendered the text "Hello World! Finished."
    // and skipped the broken JSON chunk.
    const expectedResponse = 'Hello World! Finished.';
    const hasCorrectText = await page.waitForFunction((expected) => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes(expected));
    }, expectedResponse, { timeout: 5000 }).then(() => true).catch(() => false);

    console.log(`[OBSERVATION] Client reassembled fragmented SSE chunks and rendered: ${hasCorrectText}`);
    if (hasCorrectText) {
      console.log('✅ PASS: Client correctly handles stream fragmentation and skips broken JSON without crashing.');
    } else {
      console.log('❌ FAIL: Client failed to render reassembled content.');
    }

    page.off('request', sseHandler);
    await page.setRequestInterception(false);

    // ----------------------------------------------------
    // Scenario 4: Missing Key & Auth Fallbacks
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Server Fallback on Auth and Key Missing ---');
    // Let's test the endpoint directly using fetch to check response content type and content
    // We can evaluate in browser to do fetch and examine status/headers/body
    const serverAuthFallback = await page.evaluate(async () => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' })
      });
      const contentType = response.headers.get('Content-Type');
      const text = await response.text();
      return { ok: response.ok, contentType, text: text.substring(0, 150) };
    });

    console.log('[OBSERVATION] API response when keys/auth are missing:');
    console.log(`- Status: ${serverAuthFallback.ok ? '200 OK' : 'Error'}`);
    console.log(`- Content-Type: ${serverAuthFallback.contentType}`);
    console.log(`- Text preview: ${serverAuthFallback.text}`);

    // Let's check client fallback when request fails
    await page.setRequestInterception(true);
    const networkErrorHandler = async (req: any) => {
      if (req.url().includes('/api/ai/chat')) {
        await req.abort('failed'); // Simulate network failure
        return;
      }
      try {
        await req.continue();
      } catch {}
    };

    page.on('request', networkErrorHandler);

    await page.goto(`${BASE_URL}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'I need help');
    const sendBtn4 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn4.click();

    // Verify client-side setInterval stream starts and renders the fallback response: "I'm Lisa, your AI assistant!"
    const hasClientFallback = await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes("I'm Lisa, your AI assistant!"));
    }, { timeout: 6000 }).then(() => true).catch(() => false);

    console.log(`[OBSERVATION] Client triggered setInterval fallback stream upon network failure: ${hasClientFallback}`);
    if (hasClientFallback) {
      console.log('✅ PASS: Client fallback works as expected.');
    } else {
      console.log('❌ FAIL: Client fallback failed.');
    }

    page.off('request', networkErrorHandler);
    await page.setRequestInterception(false);

    // ----------------------------------------------------
    // Scenario 5: Responsive Layout & Mobile Resizing
    // ----------------------------------------------------
    console.log('\n--- Scenario 5: Responsive Layout & Mobile Resizing ---');
    console.log('Setting viewport to mobile width (375px)...');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 1000)); // wait for layout paint

    const layoutDimensions = await page.evaluate(() => {
      const sidebar = document.querySelector('div.w-80') as HTMLElement;
      const chatArea = document.querySelector('div.flex-1.flex.flex-col') as HTMLElement;
      return {
        sidebarWidth: sidebar?.getBoundingClientRect().width || 0,
        chatAreaWidth: chatArea?.getBoundingClientRect().width || 0,
        viewportWidth: window.innerWidth
      };
    });

    console.log(`[OBSERVATION] Viewport Width: ${layoutDimensions.viewportWidth}px`);
    console.log(`- Sidebar Width: ${layoutDimensions.sidebarWidth}px`);
    console.log(`- Chat Area Width: ${layoutDimensions.chatAreaWidth}px`);

    const sumWidth = layoutDimensions.sidebarWidth + layoutDimensions.chatAreaWidth;
    if (sumWidth > layoutDimensions.viewportWidth + 10) {
      console.log('❌ FAIL: Layout overflows the viewport on mobile screens! The sidebar is not hidden or collapsed.');
    } else {
      console.log('✅ PASS: Layout fits mobile viewport without overflowing.');
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

runChallengerTests().catch(err => {
  console.error('Fatal stress runner error:', err);
  process.exit(1);
});
