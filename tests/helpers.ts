import net from 'net';
import { spawn, ChildProcess } from 'child_process';
import puppeteer, { Page, Browser } from 'puppeteer';

export interface MockConfig {
  dbSuccess?: boolean;
  dbHang?: boolean;
  storageSuccess?: boolean;
  storageHang?: boolean;
  aiSuccess?: boolean;
  aiHang?: boolean;
  aiResponseText?: string;
  aiChatResponseText?: string;
  uploadWithAiSuccess?: boolean;
  uploadWithAiTags?: string[];
  uploadWithAiSummary?: string;
}

let activeMockConfig: MockConfig = {};

export function setMockConfig(config: MockConfig) {
  activeMockConfig = { ...config };
}

export function resetMockConfig() {
  activeMockConfig = {};
}

export function checkPortActive(port: number, host: string = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1000);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

export async function startServer(): Promise<ChildProcess> {
  console.log('Starting Next.js dev server...');
  const serverProcess = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'pipe',
  });

  serverProcess.stdout?.on('data', (data) => {
    // Optional: write server logs to console in debug mode
    // process.stdout.write(data);
  });
  serverProcess.stderr?.on('data', (data) => {
    // process.stderr.write(data);
  });

  // Poll port 3001 until active
  let attempts = 0;
  while (attempts < 30) {
    const active = await checkPortActive(3001);
    if (active) {
      console.log('Server is ready on port 3001.');
      return serverProcess;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  throw new Error('Failed to start Next.js dev server after 30 seconds');
}

export function stopServer(serverProcess: ChildProcess): Promise<void> {
  return new Promise((resolve) => {
    console.log('Stopping Next.js dev server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', serverProcess.pid!.toString(), '/f', '/t'], { shell: true })
        .on('exit', () => resolve());
    } else {
      serverProcess.kill('SIGTERM');
      resolve();
    }
  });
}

export async function setupPage(browser: Browser, baseUrl: string): Promise<Page> {
  const page = await browser.newPage();
  
  // Set larger viewport to prevent UI layouts from wrapping/hiding elements
  await page.setViewport({ width: 1280, height: 800 });
  
  // Enable request interception
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = request.url();
    
    if (url.includes('/api/test/db')) {
      if (activeMockConfig.dbHang) {
        await request.abort('timedout');
        return;
      }
      if (activeMockConfig.dbSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Database connection failed' })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Database connection successful', userCount: 42 })
      });
      return;
    }
    
    if (url.includes('/api/test/storage')) {
      if (activeMockConfig.storageHang) {
        await request.abort('timedout');
        return;
      }
      if (activeMockConfig.storageSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Storage test failed' })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'All storage buckets configured', buckets: ['files', 'avatars', 'recordings'] })
      });
      return;
    }
    
    if (url.includes('/api/test/ai')) {
      if (activeMockConfig.aiHang) {
        await request.abort('timedout');
        return;
      }
      if (activeMockConfig.aiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'AI test failed' })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Gemini AI integration working', response: activeMockConfig.aiResponseText || 'Hello, I am Lisa' })
      });
      return;
    }

    if (url.includes('/api/ai/chat')) {
      if (activeMockConfig.aiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'AI key failed' })
        });
        return;
      }
      const responseText = activeMockConfig.aiChatResponseText || 'This is streaming response from Lisa AI.';
      const responseBody = `data: {"type":"content","content":"${responseText}"}\ndata: [DONE]\n`;
      await request.respond({
        status: 200,
        contentType: 'text/event-stream',
        body: responseBody
      });
      return;
    }

    if (url.includes('/api/files/upload-with-ai')) {
      if (activeMockConfig.uploadWithAiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to upload and analyze file' })
        });
        return;
      }
      const summary = activeMockConfig.uploadWithAiSummary || 'File analyzed successfully';
      const tags = activeMockConfig.uploadWithAiTags || ['document', 'test'];
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          file: {
            id: `demo-${Date.now()}`,
            name: 'uploaded_file.txt',
            mimeType: 'text/plain',
            size: 100,
            aiSummary: summary,
            aiTags: tags
          },
          analysis: {
            summary: summary,
            tags: tags
          },
          message: 'File analyzed successfully with Lisa AI'
        })
      });
      return;
    }

    try {
      await request.continue();
    } catch {
      // Ignore errors when page is closing/navigating
    }
  });

  return page;
}

export async function clearState(page: Page, baseUrl: string) {
  resetMockConfig();
  await page.goto(baseUrl);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
