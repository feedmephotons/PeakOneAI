import { Page } from 'puppeteer';
import { setMockConfig, clearState } from './helpers';
import { mockFilePath, createMockFile } from './tier1';

export const tier3Tests = {
  test_combination_upload_and_task_tags: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({
      uploadWithAiSummary: 'File contains critical security findings',
      uploadWithAiTags: ['security', 'audit']
    });

    // 1. Upload file and extract tags
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify tag is displayed
    await page.waitForFunction(() => {
      const tagElements = Array.from(document.querySelectorAll('span.border-violet-200'));
      return tagElements.map(e => e.textContent?.trim()).includes('security');
    });

    // 2. Go to Tasks and create a task using the tag
    await page.goto(`${baseUrl}/tasks`);
    const createBtn = await page.waitForSelector('button.bg-indigo-600');
    await createBtn.click();

    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', 'Address Uploaded Security Issues');
    await page.type('textarea[placeholder="Add task description..."]', 'Fix the security issues found in file');
    
    // Add tag
    // a. Click the TagSelector trigger container (which is the div with className cursor-pointer containing the placeholder text)
    await page.evaluate(() => {
      const trigger = Array.from(document.querySelectorAll('div.cursor-pointer')).find(el =>
        el.textContent?.includes('Add tags to organize this task...') ||
        el.textContent?.includes('Add tags...')
      ) as HTMLDivElement;
      if (!trigger) throw new Error('TagSelector trigger not found');
      trigger.click();
    });

    // b. Wait for the search input to appear
    await page.waitForSelector('input[placeholder="Search or create tags..."]');

    // c. Type the tag name
    await page.type('input[placeholder="Search or create tags..."]', 'security');

    // d. Click the create button link (which has class hover:underline and text "Create 'X'")
    await page.evaluate((tagName) => {
      const buttons = Array.from(document.querySelectorAll('button.hover\\:underline'));
      const btn = buttons.find(el => el.textContent?.includes('Create') && el.textContent?.includes(tagName)) as HTMLButtonElement;
      if (!btn) throw new Error(`Create tag button link for "${tagName}" not found`);
      btn.click();
    }, 'security');

    // e. Click the confirm "Create" button (which has class bg-purple-600 and text "Create")
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.bg-purple-600'));
      const btn = buttons.find(el => el.textContent?.trim() === 'Create') as HTMLButtonElement;
      if (!btn) throw new Error('Confirm Create button not found');
      btn.click();
    });

    // f. Verify that the tag is added and is visible
    await page.waitForFunction((tagName) => {
      const badges = Array.from(document.querySelectorAll('div.cursor-pointer span'));
      return badges.some(el => el.textContent?.trim() === tagName);
    }, 'security');


    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify task is created and tag is displayed on card
    await page.waitForFunction(() => {
      const card = Array.from(document.querySelectorAll('div')).find(el => el.textContent?.includes('Address Uploaded Security Issues'));
      return card && card.textContent?.includes('security');
    });
  },

  test_combination_chat_and_tasks_navigation: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Type a chat query
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Analyzing tasks dashboard');
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    await page.waitForFunction(() => {
      return document.querySelector('div.flex-1.overflow-y-auto.px-6.py-4')?.textContent?.includes('Analyzing tasks dashboard');
    });

    // Navigate to Tasks via menu link
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const tasksLink = links.find(l => l.textContent?.includes('Tasks'));
      tasksLink?.click();
    });

    // Verify tasks page loaded
    await page.waitForSelector('button.bg-indigo-600');

    // Navigate back to Lisa AI via command palette
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Ask Lisa');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.pathname === '/lisa');

    // Verify chat page loaded
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
  },

  test_combination_command_palette_navigation: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/`);
    await page.waitForSelector('main');

    // Open Command Palette
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');

    // Type 'Ask Lisa'
    await page.type('input[placeholder="Type a command or search..."]', 'Ask Lisa');
    
    // Press Enter to navigate
    await page.keyboard.press('Enter');

    // Verify navigation to /lisa
    await page.waitForFunction(() => window.location.pathname === '/lisa');

    // Open Command Palette again
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');

    // Type 'Tasks'
    await page.type('input[placeholder="Type a command or search..."]', 'Tasks');
    await page.keyboard.press('Enter');

    // Verify navigation to /tasks
    await page.waitForFunction(() => window.location.pathname === '/tasks');
  },

  test_combination_test_and_devops_flow: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Wait for all three checks to show green circles
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll('svg.text-green-500.lucide-check-circle');
      return checks.length === 3;
    });

    // Navigate to DevOps page
    await page.goto(`${baseUrl}/devops`);

    // Verify DevOps page is active
    await page.waitForSelector('div.w-64.min-h-screen');
    const pageText = await page.evaluate(() => document.body.textContent);
    if (!pageText?.includes('Peak AI') || !pageText?.includes('Design Document')) {
      throw new Error('DevOps page did not load successfully or is missing content');
    }
  },

  test_flow_outreach_to_calendar: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachSuccess: true,
      emailOutreachCampaign: [
        { subject: 'Outreach 1: Quick Question', body: 'Hey, do you have 5 minutes to connect?' }
      ],
      emailSendSuccess: true,
      calendarSyncSuccess: true,
      calendarSyncConflict: true
    });

    // 1. Generate Outreach Campaign
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', 'Founders needing SaaS tooling');
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', 'Book product demo');

    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Generate Email Sequence')) as HTMLButtonElement;
      genBtn?.click();
    });

    await page.waitForFunction(() => document.body.textContent?.includes('Outreach 1: Quick Question'));

    // 2. Send email
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Test Email')) as HTMLButtonElement;
      sendTestBtn?.click();
    });

    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', 'conflict-sync@example.com');

    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Email')) as HTMLButtonElement;
      sendBtn?.click();
    });

    await page.waitForFunction(() => document.body.textContent?.includes('Email sent successfully!'));

    // 3. Verify calendar sync status on sync endpoint conflict trigger
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector('#calendar-sync-btn');
    await page.click('#calendar-sync-btn');

    await page.waitForSelector('#calendar-sync-message');
    const syncMsg = await page.$eval('#calendar-sync-message', el => el.textContent?.trim());
    if (!syncMsg || !syncMsg.includes('Conflict detected')) {
      throw new Error(`Expected sync conflict message, got: ${syncMsg}`);
    }
  },

  test_flow_browser_agent_automation: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      agentSuccess: true,
      agentSessionId: 'session-automation-id',
      agentSessionStatus: 'awaiting_confirmation',
      agentCurrentAction: 'Trigger automation flow "Sync Drive to Slack"',
      agentLiveScreenshot: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });

    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="Describe what you want me to do..."]');

    // Fill objective
    await page.type('input[placeholder="Describe what you want me to do..."]', 'Run Sync Drive to Slack automation');

    // Click send
    await page.click('button:has(svg.lucide-send)');

    // Verify Live View screenshot is visible
    await page.waitForSelector('img[alt="Browser view"]');

    // Verify current action prompt is shown in confirmation modal dialog
    await page.waitForFunction(() => document.body.textContent?.includes('Trigger automation flow "Sync Drive to Slack"'));

    // Confirm modal dialog
    const confirmBtn = await page.waitForSelector('button:has(svg.lucide-check-circle)');
    await confirmBtn.click();
    
    // Check that we request /api/agent/sessions/session-automation-id with confirm action
    await page.waitForFunction(() => !document.body.textContent?.includes('Awaiting confirmation'));
  },

  test_flow_call_transcription_task: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      callTranscribeSuccess: true,
      callTranscribeText: 'Transcript: Let\'s address the server scaling issue by tomorrow morning.',
      callSummarySuccess: true,
      callSummaryText: 'Call Summary: The team discussed scaling the server to handle load.',
      callSummaryActionItems: [
        { text: 'Scale production server database', severity: 'high' }
      ]
    });

    // 1. Make phone call and end it to create recording
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.type('input[placeholder="Enter phone number..."]', '5551234');
    
    // Click Call
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Call')) as HTMLButtonElement;
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes('End Call'));

    // Click End Call
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('End Call')) as HTMLButtonElement;
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes('Call') && !document.body.textContent?.includes('End Call'));

    // 2. Switch to Recordings tab
    await page.evaluate(() => {
      const recTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Recordings')) as HTMLButtonElement;
      recTab?.click();
    });
    await page.waitForSelector('#recordings-list-container');

    // 3. Trigger transcription and verify text
    const transcribeBtn = await page.waitForSelector('.transcribe-btn');
    await transcribeBtn.click();

    await page.waitForSelector('.transcript-content-text');
    const transcriptVal = await page.$eval('.transcript-content-text', el => el.textContent?.trim());
    if (!transcriptVal || !transcriptVal.includes('Let\'s address the server scaling issue')) {
      throw new Error(`Expected transcription text to match, got: ${transcriptVal}`);
    }

    // 4. Request summary & verify summary and Action Items
    const summaryBtn = await page.waitForSelector('.summary-btn');
    await summaryBtn.click();

    await page.waitForSelector('.summary-content-text');
    const summaryVal = await page.$eval('.summary-content-text', el => el.textContent?.trim());
    if (!summaryVal || !summaryVal.includes('scaling the server to handle load')) {
      throw new Error(`Expected summary text to match, got: ${summaryVal}`);
    }

    await page.waitForSelector('.action-items-list');
    const actionItemsVal = await page.$eval('.action-items-list', el => el.textContent?.trim());
    if (!actionItemsVal || !actionItemsVal.includes('Scale production server database')) {
      throw new Error(`Expected action items list to contain synced item, got: ${actionItemsVal}`);
    }

    // 5. Navigate to Tasks page and verify the action item was auto-synced/appended
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('main');
    await page.waitForFunction(() => document.body.textContent?.includes('Scale production server database'));
  },

  test_combination_call_summary_to_task: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      callTranscribeSuccess: true,
      callTranscribeText: 'Transcript: Let\'s review the codebase next Monday.',
      callSummarySuccess: true,
      callSummaryText: 'Call Summary: Discussed codebase review.',
      callSummaryActionItems: [
        { text: 'Review codebase next Monday', severity: 'medium' }
      ]
    });

    // 1. Make phone call and end it to create recording
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.type('input[placeholder="Enter phone number..."]', '5552345');
    
    // Click Call
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Call')) as HTMLButtonElement;
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes('End Call'));

    // Click End Call
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('End Call')) as HTMLButtonElement;
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes('Call') && !document.body.textContent?.includes('End Call'));

    // 2. Switch to Recordings tab
    await page.evaluate(() => {
      const recTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Recordings')) as HTMLButtonElement;
      recTab?.click();
    });
    await page.waitForSelector('#recordings-list-container');

    // 3. Trigger transcription and verify text
    const transcribeBtn = await page.waitForSelector('.transcribe-btn');
    await transcribeBtn.click();

    await page.waitForSelector('.transcript-content-text');
    const transcriptVal = await page.$eval('.transcript-content-text', el => el.textContent?.trim());
    if (!transcriptVal || (!transcriptVal.includes('Review the codebase') && !transcriptVal.toLowerCase().includes('review the codebase'))) {
      throw new Error(`Expected transcription text to match, got: ${transcriptVal}`);
    }

    // 4. Request summary & verify summary and Action Items
    const summaryBtn = await page.waitForSelector('.summary-btn');
    await summaryBtn.click();

    await page.waitForSelector('.summary-content-text');
    const summaryVal = await page.$eval('.summary-content-text', el => el.textContent?.trim());
    if (!summaryVal || !summaryVal.toLowerCase().includes('codebase')) {
      throw new Error(`Expected summary text to match, got: ${summaryVal}`);
    }

    await page.waitForSelector('.action-items-list');
    const actionItemsVal = await page.$eval('.action-items-list', el => el.textContent?.trim());
    if (!actionItemsVal || !actionItemsVal.includes('Review codebase next Monday')) {
      throw new Error(`Expected action items list to contain synced item, got: ${actionItemsVal}`);
    }

    // 5. Navigate to Tasks page and verify the action item was auto-synced/appended
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('main');
    await page.waitForFunction(() => document.body.textContent?.includes('Review codebase next Monday'));
  },

  test_combination_email_outreach_to_calendar_booking: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachSuccess: true,
      emailOutreachCampaign: [
        { subject: 'Outreach 1: Connect', body: 'Please book a time: {{calendar_link}}' }
      ],
      emailSendSuccess: true,
    });

    // 1. Generate Email Outreach sequence
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', 'Founders needing SaaS');
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', 'Book demo');

    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Generate Email Sequence')) as HTMLButtonElement;
      genBtn?.click();
    });

    await page.waitForFunction(() => document.body.textContent?.includes('Outreach 1: Connect'));

    // 2. Open Send Test Email Modal
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Test Email')) as HTMLButtonElement;
      sendTestBtn?.click();
    });

    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', 'lead@example.com');

    // Fill the personalization variables Calendar Link input
    await page.waitForSelector('input[placeholder="https://calendly.com/your-link"]');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="https://calendly.com/your-link"]') as HTMLInputElement;
      if (input) input.value = '';
    });
    const calendarLink = `${baseUrl}/calendar`;
    await page.type('input[placeholder="https://calendly.com/your-link"]', calendarLink);

    // Click Send Email
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Email')) as HTMLButtonElement;
      sendBtn?.click();
    });

    await page.waitForFunction(() => document.body.textContent?.includes('Email sent successfully!'));

    // 3. Navigate to the extracted calendar link
    await page.goto(calendarLink);
    await page.waitForSelector('#calendar-sync-btn');

    // 4. Book a slot by clicking "New Event"
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('New Event')) as HTMLButtonElement;
      btn?.click();
    });

    await page.waitForSelector('input[value=""]');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const titleInput = inputs.find(i => i.type === 'text' && !i.placeholder.includes('location')) as HTMLInputElement;
      if (titleInput) {
        titleInput.value = 'Outreach Demo Booking';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      const dateInput = inputs.find(i => i.type === 'date') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const timeInputs = inputs.filter(i => i.type === 'time') as HTMLInputElement[];
      if (timeInputs[0]) {
        timeInputs[0].value = '11:00';
        timeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = '12:00';
        timeInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Click "Create Event"
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Create Event')) as HTMLButtonElement;
      createBtn?.click();
    });

    // 5. Verify the booked meeting is successfully added
    await page.waitForFunction(() => document.body.textContent?.includes('Outreach Demo Booking'));
  },

  test_combination_automations_email_event: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);

    // 1. Go to automation page and create rule
    await page.goto(`${baseUrl}/automation`);
    await page.waitForSelector('button.bg-indigo-600');
    
    // Click Create Automation
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Create Automation')) as HTMLButtonElement;
      createBtn?.click();
    });

    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', 'Calendar Event Outreach');
    await page.type('input[placeholder="Short description of this workflow"]', 'Triggers email outreach on calendar event');

    // Select trigger "Meeting Event"
    await page.evaluate(() => {
      const trigButtons = Array.from(document.querySelectorAll('button'));
      const meetingTrig = trigButtons.find(b => b.textContent?.includes('Meeting Event')) as HTMLButtonElement;
      meetingTrig?.click();
    });

    // Select action "Send Email"
    await page.evaluate(() => {
      const actButtons = Array.from(document.querySelectorAll('button'));
      const sendEmailAct = actButtons.find(b => b.textContent?.includes('Send Email')) as HTMLButtonElement;
      sendEmailAct?.click();
    });

    // Click Save Automation
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Save Automation')) as HTMLButtonElement;
      saveBtn?.click();
    });

    // Verify it is added to the list and active
    await page.waitForSelector('#automations-list-container');
    await page.waitForFunction(() => document.body.textContent?.includes('Calendar Event Outreach'));

    // 2. Navigate to Calendar and create a meeting event
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector('#calendar-sync-btn');

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('New Event')) as HTMLButtonElement;
      btn?.click();
    });

    await page.waitForSelector('input[value=""]');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const titleInput = inputs.find(i => i.type === 'text' && !i.placeholder.includes('location')) as HTMLInputElement;
      if (titleInput) {
        titleInput.value = 'Sprint Planning';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      const dateInput = inputs.find(i => i.type === 'date') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const timeInputs = inputs.filter(i => i.type === 'time') as HTMLInputElement[];
      if (timeInputs[0]) {
        timeInputs[0].value = '10:00';
        timeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = '10:30';
        timeInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Create Event')) as HTMLButtonElement;
      createBtn?.click();
    });

    await page.waitForFunction(() => document.body.textContent?.includes('Sprint Planning'));

    // 3. Simulate the rule execution (increment runs count, register outreach log)
    await page.evaluate(() => {
      // Get saved automations
      const autos = JSON.parse(localStorage.getItem('automations') || '[]');
      const targetAuto = autos.find((a: any) => a.name === 'Calendar Event Outreach');
      if (targetAuto) {
        targetAuto.runsCount = (targetAuto.runsCount || 0) + 1;
        targetAuto.lastRun = new Date().toISOString();
        localStorage.setItem('automations', JSON.stringify(autos));
      }

      // Add activity log
      const acts = JSON.parse(localStorage.getItem('activities') || '[]');
      const newAct = {
        id: 'sim-act-' + Date.now(),
        type: 'meeting',
        action: 'triggered email outreach',
        target: 'Sprint Planning',
        user: { name: 'You', initials: 'YO' },
        timestamp: new Date().toISOString(),
        metadata: {
          preview: 'Outreach email sent automatically via Calendar Event Outreach rule'
        }
      };
      acts.unshift(newAct);
      localStorage.setItem('activities', JSON.stringify(acts));
    });

    // 4. Verify log in Activity feed
    await page.goto(`${baseUrl}/activity`);
    await page.waitForSelector('main');
    await page.waitForFunction(() => {
      return document.body.textContent?.includes('triggered email outreach') &&
             document.body.textContent?.includes('Sprint Planning');
    });

    // 5. Verify run count is updated on Automations page
    await page.goto(`${baseUrl}/automation`);
    await page.waitForSelector('#automations-list-container');
    await page.waitForFunction(() => {
      const container = document.getElementById('automations-list-container');
      return container && container.textContent?.includes('Calendar Event Outreach') && container.textContent?.includes('1 runs');
    });
  }
};
