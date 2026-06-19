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

  // New features mock configs
  emailOutreachSuccess?: boolean;
  emailOutreachHang?: boolean;
  emailOutreachCampaign?: Array<{ subject: string; body: string }>;

  emailSendSuccess?: boolean;
  emailSendError?: string;

  agentSuccess?: boolean;
  agentSessionId?: string;
  agentSessionStatus?: 'idle' | 'planning' | 'executing' | 'paused' | 'completed' | 'failed' | 'awaiting_confirmation' | 'cancelled';
  agentLiveScreenshot?: string;
  agentLiveLogs?: Array<{ timestamp: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }>;
  agentLiveTasks?: Array<{ id: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'; order: number }>;
  agentCurrentAction?: string;
  agentValidationReason?: string;

  callTranscribeSuccess?: boolean;
  callTranscribeText?: string;

  callSummarySuccess?: boolean;
  callSummaryActionItems?: Array<{ text: string; severity: 'low' | 'medium' | 'high' }>;
  callSummaryText?: string;

  calendarSyncSuccess?: boolean;
  calendarSyncConflict?: boolean;
  calendarSyncError?: string;
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
  const port = parseInt(process.env.PORT || '3001', 10);
  console.log(`[E2E DEBUG] Current Working Directory: ${process.cwd()}`);
  const fs = require('fs');
  const path = require('path');
  const distDir = process.env.NEXT_DIST_DIR || '.next';
  const buildIdPath = path.join(process.cwd(), distDir, 'BUILD_ID');
  console.log(`[E2E DEBUG] ${distDir}/BUILD_ID path: ${buildIdPath}`);
  console.log(`[E2E DEBUG] ${distDir}/BUILD_ID exists: ${fs.existsSync(buildIdPath)}`);
  
  console.log(`Starting Next.js production server on port ${port}...`);
  const serverProcess = spawn('/home/wfowlkes/my_node_gen6', ['server.js'], {
    shell: true,
    stdio: 'pipe',
    cwd: process.cwd(),
    env: { ...process.env, PORT: port.toString(), NODE_ENV: 'production' }
  });

  serverProcess.stdout?.on('data', (data) => {
    // Optional: write server logs to console in debug mode
    process.stdout.write(data);
  });
  serverProcess.stderr?.on('data', (data) => {
    process.stderr.write(data);
  });

  // Poll port until active
  let attempts = 0;
  while (attempts < 30) {
    const active = await checkPortActive(port);
    if (active) {
      console.log(`Server is ready on port ${port}.`);
      return serverProcess;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  throw new Error(`Failed to start Next.js dev server on port ${port} after 30 seconds`);
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
  await page.setDefaultNavigationTimeout(60000);
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.message}`);
  });
  page.on('requestfailed', request => {
    console.log(`[BROWSER NETWORK] FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });
  page.on('response', response => {
    if (!response.ok()) {
      console.log(`[BROWSER NETWORK] ERROR ${response.status()}: ${response.url()}`);
    }
  });

  // Set larger viewport to prevent UI layouts from wrapping/hiding elements
  await page.setViewport({ width: 1280, height: 800 });
  
  // Bypass service workers to ensure request interception is active
  await page.setBypassServiceWorker(true);
  
  // Overwrite service worker registration to prevent interception issues
  await page.evaluateOnNewDocument(() => {
    if (window.navigator && 'serviceWorker' in window.navigator) {
      // @ts-ignore
      window.navigator.serviceWorker.register = async () => {
        console.log('[E2E TEST] Blocked service worker registration');
        return {
          unregister: async () => true,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
          onupdatefound: null,
          active: null,
          installing: null,
          waiting: null,
          pushManager: {}
        } as any;
      };
    }
  });

  // Enable request interception
  await page.setRequestInterception(true);
  page.on('request', async (request) => {
    const url = request.url();
    
    if (url.includes('supabase.co')) {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      
      // GET /auth/v1/user
      if (path.includes('/auth/v1/user')) {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'mock-user-id',
            email: 'test@saasx.com',
            user_metadata: { name: 'Mock User' }
          })
        });
        return;
      }
      
      // POST /auth/v1/token
      if (path.includes('/auth/v1/token')) {
        let email = 'test@saasx.com';
        const postData = request.postData();
        if (postData) {
          try {
            const parsed = JSON.parse(postData);
            if (parsed.email) email = parsed.email;
          } catch {}
        }
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'mock-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
              email: email,
              email_confirmed_at: new Date().toISOString(),
              user_metadata: { name: email.split('@')[0] }
            }
          })
        });
        return;
      }

      // POST /auth/v1/signup
      if (path.includes('/auth/v1/signup')) {
        let email = 'test@saasx.com';
        const postData = request.postData();
        if (postData) {
          try {
            const parsed = JSON.parse(postData);
            if (parsed.email) email = parsed.email;
          } catch {}
        }
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'mock-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
              email: email,
              email_confirmed_at: new Date().toISOString(),
              user_metadata: { name: email.split('@')[0] }
            }
          })
        });
        return;
      }

      // POST /auth/v1/logout or signout
      if (path.includes('/auth/v1/logout') || path.includes('/auth/v1/signout')) {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({})
        });
        return;
      }

      // Default fallback for any other supabase request
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: null,
          user: null
        })
      });
      return;
    }
    
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

    if (url.includes('/api/conversations')) {
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversations: [
            {
              id: 'conv-1',
              type: 'direct',
              name: 'Alex Rivera',
              lastMessage: 'Hey, how is it going?',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0,
              participants: ['demo-user-id', 'alex-id'],
              isOnline: true,
              isPinned: false,
              isMuted: false
            }
          ]
        })
      });
      return;
    }

    if (url.includes('/api/messages')) {
      if (request.method() === 'POST') {
        let body: any = {};
        try {
          body = JSON.parse(request.postData() || '{}');
        } catch {}
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: {
              id: body.id || `msg-${Date.now()}`,
              conversationId: body.conversationId || 'conv-1',
              senderId: 'user',
              senderName: 'You',
              content: body.content || '',
              timestamp: new Date().toISOString(),
              type: body.type || 'text',
              isRead: true
            }
          })
        });
        return;
      }
      if (request.method() === 'PUT') {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          messages: [
            {
              id: 'msg-1',
              conversationId: 'conv-1',
              senderId: 'alex-id',
              senderName: 'Alex Rivera',
              content: 'Hey, how is it going?',
              timestamp: new Date().toISOString(),
              type: 'text',
              isRead: true
            }
          ]
        })
      });
      return;
    }

    // AI Email Outreach Campaign Intercept
    if (url.includes('/api/ai/email-outreach')) {
      if (activeMockConfig.emailOutreachHang) {
        await request.abort('timedout');
        return;
      }
      if (activeMockConfig.emailOutreachSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Failed to generate email outreach campaign' })
        });
        return;
      }
      let emailsList: any[] = [];
      const mockCampaign = activeMockConfig.emailOutreachCampaign;
      if (mockCampaign) {
        if (Array.isArray(mockCampaign)) {
          emailsList = mockCampaign;
        } else if (typeof mockCampaign === 'object' && 'emails' in mockCampaign) {
          emailsList = (mockCampaign as any).emails;
        } else if (typeof mockCampaign === 'object' && 'campaign' in mockCampaign) {
          emailsList = (mockCampaign as any).campaign;
        } else {
          emailsList = [mockCampaign];
        }
      } else {
        emailsList = [
          { subject: 'Outreach 1: Quick Question', body: 'Hi, I noticed your company could benefit from our service.' },
          { subject: 'Outreach 2: Follow Up', body: 'Hi, just following up on my previous email.' },
          { subject: 'Outreach 3: Final Attempt', body: 'Hi, this is my last attempt to reach you.' }
        ];
      }

      // Map emails to ensure they match expected object format
      const mappedEmails = emailsList.map((e: any, index: number) => ({
        id: e.id || (index + 1).toString(),
        subject: e.subject || `Outreach ${index + 1}`,
        body: e.body || '',
        delay: typeof e.delay === 'number' ? e.delay : (index === 0 ? 0 : index * 2 + 1),
        generated: true
      }));

      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, emails: mappedEmails })
      });
      return;
    }

    // Email Send Intercept
    if (url.includes('/api/email/send')) {
      if (activeMockConfig.emailSendSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: activeMockConfig.emailSendError || 'SMTP connection timeout' })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'mock-email-uuid' })
      });
      return;
    }

    // Browser Agent Session Intercepts
    if (url.includes('/api/agent/sessions')) {
      if (request.method() === 'POST') {
        let body: any = {};
        try {
          body = JSON.parse(request.postData() || '{}');
        } catch {}
        const startUrl = body.startUrl;

        // Loopback / protocol safety block simulation
        if (startUrl) {
          try {
            const parsed = new URL(startUrl);
            const isLoopback = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
            const isBlockedProtocol = ['file:', 'ftp:', 'data:', 'javascript:', 'chrome:'].includes(parsed.protocol);
            if (isLoopback) {
              await request.respond({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Loopback address block: Access to localhost or 127.0.0.1 is prohibited for security reasons' })
              });
              return;
            }
            if (isBlockedProtocol) {
              await request.respond({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ error: `Protocol block: Access to ${parsed.protocol} is prohibited for security reasons` })
              });
              return;
            }
          } catch {
            await request.respond({
              status: 400,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'Invalid URL format' })
            });
            return;
          }
        }

        if (activeMockConfig.agentSuccess === false) {
          await request.respond({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: activeMockConfig.agentValidationReason || 'Failed to create session' })
          });
          return;
        }

        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session: {
              id: activeMockConfig.agentSessionId || 'mock-session-id',
              objective: body.objective,
              status: activeMockConfig.agentSessionStatus || 'idle',
              startUrl: startUrl,
              createdAt: new Date().toISOString()
            },
            message: 'Session created'
          })
        });
        return;
      }

      if (url.match(/\/api\/agent\/sessions\/[^\/]+\/live/)) {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session: {
              id: activeMockConfig.agentSessionId || 'mock-session-id',
              status: activeMockConfig.agentSessionStatus || 'executing'
            },
            liveState: {
              screenshot: activeMockConfig.agentLiveScreenshot || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              url: 'https://www.google.com',
              status: activeMockConfig.agentSessionStatus || 'executing',
              currentAction: activeMockConfig.agentCurrentAction || undefined,
              progress: {
                completedTasks: 1,
                totalTasks: 3,
                currentTask: 'Searching Google'
              },
              logs: activeMockConfig.agentLiveLogs || [
                { timestamp: new Date().toISOString(), level: 'info', message: 'Initializing browser...' },
                { timestamp: new Date().toISOString(), level: 'success', message: 'Navigated to Google' }
              ]
            }
          })
        });
        return;
      }

      if (url.match(/\/api\/agent\/sessions\/[^\/]+$/)) {
        if (request.method() === 'POST') {
          let body: any = {};
          try {
            body = JSON.parse(request.postData() || '{}');
          } catch {}
          const action = body.action;
          
          if (action === 'pause') {
            activeMockConfig.agentSessionStatus = 'paused';
          } else if (action === 'resume') {
            activeMockConfig.agentSessionStatus = 'executing';
          } else if (action === 'cancel') {
            activeMockConfig.agentSessionStatus = 'cancelled';
          } else if (action === 'confirm') {
            activeMockConfig.agentSessionStatus = 'executing';
            activeMockConfig.agentCurrentAction = undefined;
          } else if (action === 'deny') {
            activeMockConfig.agentSessionStatus = 'cancelled';
            activeMockConfig.agentCurrentAction = undefined;
          }

          await request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: `Session action ${action} executed` })
          });
          return;
        } else if (request.method() === 'GET') {
          await request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              session: {
                id: activeMockConfig.agentSessionId || 'mock-session-id',
                objective: 'Test Objective',
                status: activeMockConfig.agentSessionStatus || 'idle',
                createdAt: new Date().toISOString(),
                tasks: activeMockConfig.agentLiveTasks || []
              },
              messages: [
                { id: '1', role: 'system', content: 'Session initialized', timestamp: new Date().toISOString() }
              ],
              liveState: {
                screenshot: activeMockConfig.agentLiveScreenshot || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                url: 'https://www.google.com',
                status: activeMockConfig.agentSessionStatus || 'idle',
                currentAction: activeMockConfig.agentCurrentAction || undefined,
                logs: activeMockConfig.agentLiveLogs || []
              }
            })
          });
          return;
        }
      }

      if (url.endsWith('/api/agent/sessions') && request.method() === 'GET') {
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ sessions: [] })
        });
        return;
      }
    }

    // Call Transcription Intercept
    if (url.includes('/api/calls/transcribe')) {
      if (activeMockConfig.callTranscribeSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Transcription failed' })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transcript: activeMockConfig.callTranscribeText || 'This is a mock call transcription.'
        })
      });
      return;
    }

    // Call Summary Intercept
    if (url.includes('/api/calls/summary')) {
      if (activeMockConfig.callSummarySuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Summary generation failed' })
        });
        return;
      }
      const actionItems = activeMockConfig.callSummaryActionItems || [
        { text: 'Send proposal by Friday', severity: 'high' },
        { text: 'Schedule next sync', severity: 'medium' }
      ];
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          summary: activeMockConfig.callSummaryText || 'Lisa Summary: The team aligned on deadlines.',
          actionItems
        })
      });
      return;
    }

    // Calendar Sync Intercept
    if (url.includes('/api/calendar/sync')) {
      if (activeMockConfig.calendarSyncSuccess === false) {
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: activeMockConfig.calendarSyncError || 'Google Calendar auth expired' })
        });
        return;
      }
      if (activeMockConfig.calendarSyncConflict) {
        await request.respond({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Sync Conflict',
            conflicts: [
              { id: 'conflict-1', title: 'Double booking detected with Team Standup' }
            ]
          })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Calendar sync complete' })
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
  
  // Set cookies so that Next.js server-side can read them
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  await page.setCookie(
    { name: 'sb-mock-user-id', value: 'mock-user-id', domain, path: '/' },
    { name: 'sb-mock-user-email', value: 'test@saasx.com', domain, path: '/' },
    { name: 'sb-mock-user-name', value: 'Mock User', domain, path: '/' }
  );

  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    if (window.navigator && 'serviceWorker' in window.navigator) {
      try {
        const registrations = await window.navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('[E2E TEST] Unregistered existing service worker');
        }
      } catch (err) {
        console.error('[E2E TEST] Failed to unregister service worker:', err);
      }
    }
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      } catch (err) {
        console.error('[E2E TEST] Failed to delete caches:', err);
      }
    }
  });
}

export async function setBrowserTime(page: Page, isoString: string) {
  const script = `
    const OriginalDate = window.Date;
    const mockTime = new Date('${isoString}').getTime();
    function MockDate(...args) {
      if (args.length === 0) {
        return new OriginalDate(mockTime);
      }
      return new OriginalDate(...args);
    }
    MockDate.prototype = OriginalDate.prototype;
    MockDate.now = () => mockTime;
    MockDate.UTC = OriginalDate.UTC;
    MockDate.parse = OriginalDate.parse;
    window.Date = MockDate;
  `;
  await page.evaluateOnNewDocument(script);
  await page.evaluate(script).catch(() => {});
}
