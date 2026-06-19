import puppeteer, { Page } from 'puppeteer';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { checkPortActive, startServer, stopServer } from './helpers';

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3001', 10);
const BASE_URL = `http://localhost:${PORT}`;

async function seedDatabase() {
  console.log('--- Seeding Database for Messages Challenger Tests ---');

  // 1. Ensure User 'demo-user-id' (Sarah Chen) exists
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user-id' },
    update: {
      email: 'sarah.chen@peakone.ai',
      name: 'Sarah Chen',
      firstName: 'Sarah',
      lastName: 'Chen',
    },
    create: {
      id: 'demo-user-id',
      email: 'sarah.chen@peakone.ai',
      name: 'Sarah Chen',
      firstName: 'Sarah',
      lastName: 'Chen',
    },
  });
  console.log(`Demo User: ${demoUser.id} (${demoUser.email})`);

  // 2. Ensure User 'alex-id' (Alex Rivera) exists
  const alexUser = await prisma.user.upsert({
    where: { id: 'alex-id' },
    update: {
      email: 'alex.rivera@peakone.ai',
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
    },
    create: {
      id: 'alex-id',
      email: 'alex.rivera@peakone.ai',
      name: 'Alex Rivera',
      firstName: 'Alex',
      lastName: 'Rivera',
    },
  });
  console.log(`Alex User: ${alexUser.id} (${alexUser.email})`);

  // 3. Ensure Conversation 'conv-1' exists
  let conversation = await prisma.conversation.findUnique({
    where: { id: 'conv-1' },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: 'conv-1',
        name: 'Alex Rivera',
        isGroup: false,
      },
    });
    console.log(`Created Conversation 'conv-1'`);
  } else {
    console.log(`Conversation 'conv-1' already exists`);
  }

  // 4. Ensure participants for 'conv-1' are linked
  await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: 'conv-1', userId: 'demo-user-id' } },
    update: {},
    create: {
      conversationId: 'conv-1',
      userId: 'demo-user-id',
    },
  });

  await prisma.conversationParticipant.upsert({
    where: { conversationId_userId: { conversationId: 'conv-1', userId: 'alex-id' } },
    update: {},
    create: {
      conversationId: 'conv-1',
      userId: 'alex-id',
    },
  });
  console.log(`Verified conversation participants for 'conv-1'`);
}

async function runScenario1OfflineBuffering(browser: puppeteer.Browser) {
  console.log('\n--- Scenario 1: Offline Buffering & local storage queue verification ---');
  
  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
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
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate to messages
  await page.goto(`${BASE_URL}/messages`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('input[placeholder="Type a message..."]');

  // Select the conversation
  console.log('Selecting Conversation...');
  const conversationItem = await page.waitForSelector('div[class*="cursor-pointer"]');
  await conversationItem.click();

  // Go offline
  console.log('Simulating offline state...');
  await page.setOfflineMode(true);
  
  // Verify reconnect banner is visible
  console.log('Verifying offline banner appearance...');
  const bannerVisible = await page.waitForFunction(() => {
    return document.body.textContent?.includes('You are offline. Reconnecting...');
  }, { timeout: 3000 }).then(() => true).catch(() => false);

  if (!bannerVisible) {
    throw new Error('Offline/Reconnecting banner did not display when offline mode was enabled');
  }
  console.log('✅ Offline banner displayed successfully.');

  // Type and send a message while offline
  const offlineMsgContent = `Offline Buffered Msg - ${Date.now()}`;
  console.log(`Sending message: "${offlineMsgContent}"`);
  await page.type('input[placeholder="Type a message..."]', offlineMsgContent);
  await page.keyboard.press('Enter');

  // Verify the message shows as "Sending..." in the bubble
  console.log('Verifying "Sending..." status on bubble...');
  const pendingBubbleVisible = await page.waitForFunction((msgText) => {
    const bubbles = Array.from(document.querySelectorAll('div[class*="max-w-md"]'));
    const matchedBubble = bubbles.find(b => b.textContent?.includes(msgText));
    return matchedBubble && matchedBubble.textContent?.includes('Sending...');
  }, { timeout: 3000 }, offlineMsgContent).then(() => true).catch(() => false);

  if (!pendingBubbleVisible) {
    throw new Error('Message did not display with "Sending..." / pending state in the UI');
  }
  console.log('✅ Message marked as "Sending..." in UI.');

  // Verify it is buffered in localStorage
  console.log('Verifying localStorage buffering...');
  const bufferedMsg = await page.evaluate((msgText) => {
    const queueStr = localStorage.getItem('offline_messages_queue');
    if (!queueStr) return null;
    const queue = JSON.parse(queueStr);
    return queue.find((m: any) => m.content === msgText);
  }, offlineMsgContent);

  if (!bufferedMsg) {
    throw new Error('Message was not successfully queued in localStorage "offline_messages_queue"');
  }
  console.log('✅ Message found in offline queue:', JSON.stringify(bufferedMsg));

  await page.close();
}

async function runScenario2ExponentialBackoff(browser: puppeteer.Browser) {
  console.log('\n--- Scenario 2: Connection Restoration & Exponential Backoff Sync ---');

  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
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
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate to messages
  await page.goto(`${BASE_URL}/messages`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('input[placeholder="Type a message..."]');

  // Select the conversation
  console.log('Selecting Conversation...');
  const conversationItem = await page.waitForSelector('div[class*="cursor-pointer"]');
  await conversationItem.click();

  // Go offline
  console.log('Going offline...');
  await page.setOfflineMode(true);

  // Send a message to buffer it in localStorage
  const backoffMsgContent = `Backoff Msg - ${Date.now()}`;
  console.log(`Sending message: "${backoffMsgContent}"`);
  await page.type('input[placeholder="Type a message..."]', backoffMsgContent);
  await page.keyboard.press('Enter');

  // Verify buffered
  const isBuffered = await page.evaluate((msgText) => {
    const queueStr = localStorage.getItem('offline_messages_queue');
    return queueStr && queueStr.includes(msgText);
  }, backoffMsgContent);

  if (!isBuffered) {
    throw new Error('Failed to buffer message in localStorage');
  }
  console.log('✅ Message buffered successfully.');

  // Set up request interception to intercept /api/messages POST requests
  await page.setRequestInterception(true);
  let attempts: { time: number; status: number }[] = [];
  let attemptCount = 0;

  page.on('request', async (request) => {
    const url = request.url();
    if (url.includes('/api/messages') && request.method() === 'POST') {
      attemptCount++;
      const currentAttempt = attemptCount;
      attempts.push({ time: Date.now(), status: 0 });
      console.log(`[HTTP Intercept] Request to POST /api/messages. Attempt #${currentAttempt}`);

      if (currentAttempt < 4) {
        console.log(`[HTTP Intercept] Responding 500 to Attempt #${currentAttempt}`);
        attempts[currentAttempt - 1].status = 500;
        await request.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server temporarily unavailable' })
        });
      } else {
        console.log(`[HTTP Intercept] Responding 200 to Attempt #${currentAttempt}`);
        attempts[currentAttempt - 1].status = 200;
        await request.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: {
              id: JSON.parse(request.postData() || '{}').id || `msg-${Date.now()}`,
              conversationId: 'conv-1',
              senderId: 'user',
              senderName: 'You',
              content: backoffMsgContent,
              timestamp: new Date().toISOString(),
              type: 'text',
              isRead: true
            }
          })
        });
      }
      return;
    }

    try {
      await request.continue();
    } catch {}
  });

  // Restore connection
  console.log('Restoring online connection...');
  await page.setOfflineMode(false);

  // Wait for the client to perform sync and complete the 4 attempts
  console.log('Waiting for exponential backoff retries to fire...');
  const syncDone = await page.waitForFunction(() => {
    const queueStr = localStorage.getItem('offline_messages_queue');
    return queueStr === '[]' || queueStr === null;
  }, { timeout: 15000 }).then(() => true).catch(() => false);

  if (!syncDone) {
    console.log(`Current attemptCount reached: ${attemptCount}`);
  }

  await page.setRequestInterception(false);

  console.log(`Sync completed. Total attempts captured: ${attempts.length}`);
  if (attempts.length < 4) {
    throw new Error(`Expected at least 4 sync attempts, but only captured: ${attempts.length}`);
  }

  const d1 = attempts[1].time - attempts[0].time;
  const d2 = attempts[2].time - attempts[1].time;
  const d3 = attempts[3].time - attempts[2].time;

  console.log(`Delay 1 (Attempt 1 -> 2): ${d1}ms (Expected: ~1000ms)`);
  console.log(`Delay 2 (Attempt 2 -> 3): ${d2}ms (Expected: ~2000ms)`);
  console.log(`Delay 3 (Attempt 3 -> 4): ${d3}ms (Expected: ~4000ms)`);

  if (d1 < 500 || d1 > 3000) {
    throw new Error(`Delay 1 was outside bounds: ${d1}ms`);
  }
  if (d2 < 1500 || d2 > 6000) {
    throw new Error(`Delay 2 was outside bounds: ${d2}ms`);
  }
  if (d3 < 3000 || d3 > 9000) {
    throw new Error(`Delay 3 was outside bounds: ${d3}ms`);
  }

  console.log('✅ Exponential Backoff delays successfully verified!');
  await page.close();
}

async function runScenario3Idempotency() {
  console.log('\n--- Scenario 3: UUID Idempotency & Duplicate Prevention ---');

  const clientMsgId = `msg-test-uuid-${Date.now()}`;
  const conversationId = 'conv-1';
  const content = 'Idempotent Test Message';

  // 1. Clean database of any previous test message with this ID
  await prisma.message.deleteMany({
    where: { id: clientMsgId }
  });

  // 2. Send the first POST request
  console.log(`Sending first message request with ID: ${clientMsgId}`);
  const res1 = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: clientMsgId,
      conversationId,
      content,
      type: 'text'
    })
  });

  console.log(`First request status: ${res1.status} (Expected: 201)`);
  if (res1.status !== 201) {
    throw new Error(`Expected 201, got ${res1.status}`);
  }
  const data1 = await res1.json();
  console.log(`Returned message ID: ${data1.message.id}`);

  // Check DB state: should have exactly 1 record
  let count = await prisma.message.count({
    where: { id: clientMsgId }
  });
  console.log(`Message count in DB: ${count} (Expected: 1)`);
  if (count !== 1) {
    throw new Error(`Expected exactly 1 message in DB, got: ${count}`);
  }

  // 3. Send the duplicate POST request with same ID
  console.log(`Sending duplicate message request with ID: ${clientMsgId}`);
  const res2 = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: clientMsgId,
      conversationId,
      content,
      type: 'text'
    })
  });

  console.log(`Duplicate request status: ${res2.status} (Expected: 200)`);
  if (res2.status !== 200) {
    throw new Error(`Expected 200, got ${res2.status}`);
  }
  const data2 = await res2.json();
  console.log(`Returned message ID: ${data2.message.id}`);

  // Check DB state: should STILL have exactly 1 record (not duplicated)
  count = await prisma.message.count({
    where: { id: clientMsgId }
  });
  console.log(`Message count in DB after duplicate: ${count} (Expected: 1)`);
  if (count !== 1) {
    throw new Error(`Expected exactly 1 message in DB after duplicate request, got: ${count}`);
  }

  console.log('✅ Server UUID idempotency check successfully prevented duplicate messaging!');
}

async function runScenario4TenantIsolation() {
  console.log('\n--- Scenario 4: Cross-Tenant Message ID Hijacking Vulnerability Check ---');

  const secretMsgId = `msg-secret-${Date.now()}`;
  const conversationId = 'conv-1'; // Belongs to demo-user-id and alex-id
  const secretContent = 'CRITICAL_SECRET_MESSAGE_DATA';

  // 1. Seed a secret message in conv-1 (accessible to demo-user-id)
  await prisma.message.create({
    data: {
      id: secretMsgId,
      conversationId,
      senderId: 'demo-user-id',
      content: secretContent,
      type: 'text'
    }
  });
  console.log(`Seeded secret message in conv-1 with ID: ${secretMsgId}`);

  // 2. Register and log in a completely separate user (Attacker)
  const attackerEmail = `attacker-${Date.now()}@example.com`;
  const attackerPassword = 'Password123!';

  console.log(`Registering attacker: ${attackerEmail}`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: attackerEmail, password: attackerPassword, name: 'Attacker Bob' })
  });

  if (!regRes.ok) {
    const errText = await regRes.text();
    console.error(`Registration failed details: ${errText}`);
    throw new Error(`Failed to register attacker: ${regRes.status} ${errText}`);
  }

  console.log(`Logging in attacker...`);
  const logRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: attackerEmail, password: attackerPassword })
  });

  const attackerCookies = logRes.headers.get('set-cookie');
  if (!attackerCookies) {
    throw new Error('Attacker login did not return cookies');
  }

  // Retrieve attacker's user ID from database
  const attackerUser = await prisma.user.findUnique({
    where: { email: attackerEmail }
  });
  if (!attackerUser) throw new Error('Could not find attacker in database');

  // 3. Create a conversation for the attacker (so the participant check succeeds)
  const attackerConv = await prisma.conversation.create({
    data: {
      name: 'Attacker Private Chat',
      isGroup: false,
      participants: {
        create: [
          { userId: attackerUser.id }
        ]
      }
    }
  });
  console.log(`Created private conversation for Attacker with ID: ${attackerConv.id}`);

  // 4. Attacker attempts to hijack the secret message ID by sending POST to their own conversation
  console.log(`Attacker sending POST /api/messages with hijacked message ID...`);
  const hijackRes = await fetch(`${BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': attackerCookies
    },
    body: JSON.stringify({
      id: secretMsgId, // Hijacked ID
      conversationId: attackerConv.id, // Authorized conversation
      content: 'Bypass content',
      type: 'text'
    })
  });

  console.log(`Hijack Request Status: ${hijackRes.status}`);
  const hijackData = await hijackRes.json();

  if (hijackRes.status === 200) {
    console.log(`⚠️ VULNERABILITY CONFIRMED: Attacker was returned status 200 OK.`);
    console.log(`- Leaked Message Content: "${hijackData.message?.content}"`);
    console.log(`- Leaked Conversation ID: "${hijackData.message?.conversationId}"`);
    
    if (hijackData.message?.content === secretContent) {
      console.log('❌ CRITICAL SECURITY FLAW: Attacker read another conversation\'s secret message data via ID hijacking!');
    }
  } else if (hijackRes.status === 403 || hijackRes.status === 404) {
    console.log('✅ SECURE: Server rejected cross-conversation message ID lookup.');
  } else {
    console.log(`Received unexpected status: ${hijackRes.status}`);
  }

  // Clean up secret message
  await prisma.message.deleteMany({
    where: { id: secretMsgId }
  });
  // Clean up attacker conv
  await prisma.conversation.deleteMany({
    where: { id: attackerConv.id }
  });
}

async function main() {
  console.log('==================================================');
  console.log('    Messages Challenger Test Suite (Network)       ');
  console.log('==================================================\n');

  // Seed DB before starting tests
  await seedDatabase();

  const isPortActive = await checkPortActive(PORT);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log(`Port ${PORT} is not active. Starting server...`);
    serverProcess = await startServer();
  } else {
    console.log(`Dev server already running on port ${PORT}. Reusing instance.`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-dev-shm-usage', '--disable-gpu'],
    timeout: 120000
  });

  try {
    // Scenario 1: Offline Buffering
    await runScenario1OfflineBuffering(browser);

    // Scenario 2: Connection Restoration & Exponential Backoff
    await runScenario2ExponentialBackoff(browser);

    // Scenario 3: Server Idempotency
    await runScenario3Idempotency();

    // Scenario 4: Cross-Tenant Message ID Hijacking Vulnerability Check
    await runScenario4TenantIsolation();

    console.log('\n==================================================');
    console.log('    ALL MESSAGING CHALLENGER TESTS COMPLETE       ');
    console.log('==================================================');
  } catch (err: any) {
    console.error('\n❌ Test Failure occurred:');
    console.error(err.stack || err.message || err);
    process.exit(1);
  } finally {
    await browser.close();
    if (serverProcess) {
      await stopServer(serverProcess);
    }
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal crash in challenger main:', err);
  process.exit(1);
});
