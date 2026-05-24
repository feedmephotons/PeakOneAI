import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { checkPortActive, startServer, stopServer, setupPage, clearState } from './helpers';

const BASE_URL = 'http://localhost:3001';
const largeFilePath = path.join(process.cwd(), 'tests', 'mock_lisa_large_file.txt');
const exeFilePath = path.join(process.cwd(), 'tests', 'mock_lisa_binary.exe');
const specialFilePath = path.join(process.cwd(), 'tests', 'mock_lisa_!@#$%^&().txt');

function createTestFiles() {
  fs.writeFileSync(largeFilePath, 'X'.repeat(60 * 1024 * 1024)); // 60MB file
  fs.writeFileSync(exeFilePath, Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe, 0x0a, 0x0d])); // Binary content
  fs.writeFileSync(specialFilePath, 'special name file content');
}

function deleteTestFiles() {
  [largeFilePath, exeFilePath, specialFilePath].forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
}

async function runLisaStressTests() {
  console.log('==================================================');
  console.log('         SaasX Lisa AI Chat Stress Tests          ');
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
    // Test 1: Extreme File Size Handling (60MB)
    // ----------------------------------------------------
    console.log('\n--- Test 1: Extreme File Size Handling ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);
    
    // Set up interception for 413 Payload Too Large
    await page.setRequestInterception(true);
    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        console.log('[MOCK] Intercepted /api/ai/chat, returning 413 Payload Too Large...');
        await req.respond({
          status: 413,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Payload Too Large' })
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    console.log('Uploading a 60MB file to Lisa chat...');
    await fileInput.uploadFile(largeFilePath);

    // Verify it shows in selection queue
    let queueText = await page.evaluate(() => {
      const el = document.querySelector('div.animate-in');
      return el ? el.textContent : '';
    });
    console.log(`[OBSERVATION] Is file in UI queue? ${queueText?.includes('mock_lisa_large_file.txt')}`);

    console.log('Clicking send...');
    const sendBtn = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn.click();

    // Wait for typing bubble to disappear
    await page.waitForFunction(() => {
      const bubble = document.querySelector('span.animate-bounce');
      return !bubble;
    }, { timeout: 10000 }).catch(() => {});

    // Check if client falls back silently to simulated responses instead of showing an error
    let messagesText = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.map(m => m.textContent).join('\n');
    });

    const hasErrorNotif = messagesText.includes('Payload Too Large') || messagesText.includes('too large') || messagesText.includes('limit');
    const hasSimulatedResponse = messagesText.includes('I understand you\'re asking about') || messagesText.includes('Lisa, your AI assistant');
    
    console.log(`[OBSERVATION] Did client show error notification? ${hasErrorNotif}`);
    console.log(`[OBSERVATION] Did client fall back silently to simulated offline response? ${hasSimulatedResponse}`);

    // ----------------------------------------------------
    // Test 2: Invalid MIME Type / Binary Content Handling
    // ----------------------------------------------------
    console.log('\n--- Test 2: Invalid MIME Type Handling ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);
    
    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        // Echo back the attachments payload structure in a text stream
        const postData = JSON.parse(req.postData() || '{}');
        const fileContent = postData.attachments?.[0]?.base64 || '';
        const decoded = Buffer.from(fileContent.split(',')[1] || fileContent, 'base64').toString('utf-8');
        console.log(`[MOCK] Received file content (decoded):`, JSON.stringify(decoded));
        
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: {"type":"content","content":"I processed your file. It contained: ${decoded.replace(/"/g, '\\"')}"}\ndata: [DONE]\n`
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    const fileInput2 = await page.waitForSelector('input[type="file"].hidden');
    console.log('Uploading binary file with non-text characters...');
    await fileInput2.uploadFile(exeFilePath);
    
    const sendBtn2 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn2.click();

    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.some(m => m.textContent?.includes('I processed your file'));
    }, { timeout: 5000 });

    let responseMsg = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs[msgs.length - 1]?.textContent || '';
    });
    console.log(`[OBSERVATION] Response content for binary file:`, JSON.stringify(responseMsg));
    
    // ----------------------------------------------------
    // Test 3: Fragmented SSE Stream Parsing
    // ----------------------------------------------------
    console.log('\n--- Test 3: Fragmented SSE Stream Parsing ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);

    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        // Send responses with manual delays and fragmented lines
        const responseStream = [
          'data: {"type": "con',
          'tent", "content": "Hello"',
          '}\n\ndata: {"type": "content", ',
          '"content": " world"}\n',
          '\ndata: {"type": "content", "content": "! Fragment test worked."}\n\ndata: [DONE]\n\n'
        ];
        
        // Wait, Puppeteer page.respond does not easily support streaming with manual delays over time,
        // but we can chunk them in the body response, which is parsed by TextDecoder.
        // Let's send a single payload with fragmented newline structure to test the line buffer.
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: responseStream.join('')
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    const textarea = await page.waitForSelector('textarea');
    await textarea.type('Test fragmented stream');
    const sendBtn3 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn3.click();

    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.some(m => m.textContent?.includes('Fragment test worked'));
    }, { timeout: 5000 });

    let chatText = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs[msgs.length - 1]?.textContent || '';
    });
    console.log(`[OBSERVATION] Chat response parsed:`, JSON.stringify(chatText));
    if (chatText.includes('Hello world! Fragment test worked.')) {
      console.log('✅ PASS: Fragmented stream successfully parsed and reconstituted.');
    } else {
      console.log('❌ FAIL: Stream parsing failed. Output: ', JSON.stringify(chatText));
    }

    // ----------------------------------------------------
    // Test 4: Broken JSON Stream (Error Resilience)
    // ----------------------------------------------------
    console.log('\n--- Test 4: Broken JSON Stream ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);

    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: {"type": "content", "content": "Good chunk 1"}\n\ndata: {invalid json line}\n\ndata: {"type": "content", "content": " Good chunk 2"}\n\ndata: [DONE]\n\n`
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    await page.type('textarea', 'Test broken json');
    const sendBtn4 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn4.click();

    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.some(m => m.textContent?.includes('Good chunk 2'));
    }, { timeout: 5000 });

    let chatText4 = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs[msgs.length - 1]?.textContent || '';
    });
    console.log(`[OBSERVATION] Chat response for broken JSON:`, JSON.stringify(chatText4));
    if (chatText4.includes('Good chunk 1 Good chunk 2') && !chatText4.includes('invalid json')) {
      console.log('✅ PASS: Skips invalid JSON lines and continues parsing good ones.');
    } else {
      console.log('❌ FAIL: Failed to parse good chunks around broken JSON. Output: ', JSON.stringify(chatText4));
    }

    // ----------------------------------------------------
    // Test 5: Missing Newline on Last Chunk (End-of-stream edge case)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Missing Newline on Last Chunk ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);

    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        // Body ends abruptly without any trailing newline
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: {"type": "content", "content": "Start content"}\n\ndata: {"type": "content", "content": " - Last content without newline"}`
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    await page.type('textarea', 'Test missing newline');
    const sendBtn5 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn5.click();

    // Wait and check if the last part is rendered or not
    await new Promise(r => setTimeout(r, 2000));

    let chatText5 = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs[msgs.length - 1]?.textContent || '';
    });
    console.log(`[OBSERVATION] Chat response for missing newline:`, JSON.stringify(chatText5));
    if (chatText5.includes('Last content without newline')) {
      console.log('✅ PASS: Missing newline on last chunk parsed correctly.');
    } else {
      console.log('❌ FAIL: The last chunk without a newline was lost in the buffer!');
    }

    // ----------------------------------------------------
    // Test 6: Auth Failure Fallback
    // ----------------------------------------------------
    console.log('\n--- Test 6: Auth Failure Fallback ---');
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);

    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: {"type": "content", "content": "Authentication required. Please sign in to use Lisa AI Assistant."}\n\ndata: [DONE]\n\n`
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    await page.type('textarea', 'Who are you?');
    const sendBtn6 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn6.click();

    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.some(m => m.textContent?.includes('Authentication required'));
    }, { timeout: 5000 });

    let chatText6 = await page.evaluate(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs[msgs.length - 1]?.textContent || '';
    });
    console.log(`[OBSERVATION] Chat response for auth failure:`, JSON.stringify(chatText6));

    // ----------------------------------------------------
    // Test 7: Layout Robustness (Mobile Responsive & Text Wrap)
    // ----------------------------------------------------
    console.log('\n--- Test 7: Layout Robustness & Responsiveness ---');
    
    // A. Responsive Resizing Check
    console.log('Resizing to mobile viewport (360x640)...');
    await page.setViewport({ width: 360, height: 640 });
    await new Promise(r => setTimeout(r, 1000));

    // Verify if sidebar overlaps or squishes chat area
    const sidebarWidth = await page.evaluate(() => {
      const sidebar = document.querySelector('div.w-80');
      return sidebar ? sidebar.getBoundingClientRect().width : 0;
    });
    const chatWidth = await page.evaluate(() => {
      const chat = document.querySelector('div.flex-1.flex.flex-col');
      return chat ? chat.getBoundingClientRect().width : 0;
    });

    console.log(`[OBSERVATION] Sidebar width on mobile (360px viewport): ${sidebarWidth}px`);
    console.log(`[OBSERVATION] Chat width on mobile (360px viewport): ${chatWidth}px`);

    if (chatWidth < 100) {
      console.log('❌ FAIL: Responsive resizing is broken! The sidebar takes up almost all mobile space, leaving chat squished.');
    } else {
      console.log('✅ PASS: Layout is responsive.');
    }

    // B. Text Wrap / Long Word Check
    await page.setViewport({ width: 1280, height: 800 });
    await clearState(page, BASE_URL);
    await page.goto(`${BASE_URL}/lisa`);

    page.removeAllListeners('request');
    page.on('request', async (req) => {
      if (req.url().includes('/api/ai/chat')) {
        await req.respond({
          status: 200,
          contentType: 'text/event-stream',
          body: `data: {"type": "content", "content": "${'W'.repeat(500)}"}\n\ndata: [DONE]\n\n`
        });
      } else {
        try { await req.continue(); } catch {}
      }
    });

    await page.type('textarea', 'Long word wrap check');
    const sendBtn7 = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn7.click();

    await page.waitForFunction(() => {
      const msgs = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return msgs.some(m => m.textContent?.startsWith('WWWWWW'));
    }, { timeout: 5000 });

    // Check if the chat bubble height/width is broken (wider than parent container or overflowing)
    const bubbleOverflow = await page.evaluate(() => {
      const bubble = document.querySelector('div.bg-white\\/80.dark\\:bg-zinc-800\\/80');
      if (!bubble) return false;
      const bubbleWidth = bubble.getBoundingClientRect().width;
      const parentWidth = bubble.parentElement?.getBoundingClientRect().width || 1000;
      return bubbleWidth > parentWidth;
    });
    console.log(`[OBSERVATION] Does long word overflow the message bubble bounds? ${bubbleOverflow}`);
    if (bubbleOverflow) {
      console.log('❌ FAIL: Message bubbles lack word-breaking CSS classes, causing overflow when displaying long unbroken text.');
    } else {
      console.log('✅ PASS: Text wraps correctly.');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    page.removeAllListeners('request');
    await page.setRequestInterception(false).catch(() => {});
    await browser.close();
    if (serverProcess) {
      await stopServer(serverProcess);
    }
    deleteTestFiles();
    console.log('\nLisa stress testing run finished.');
  }
}

runLisaStressTests().catch(err => {
  console.error('Fatal stress runner error:', err);
  process.exit(1);
});
