import { Page } from 'puppeteer';
import { assert } from 'console';
import fs from 'fs';
import path from 'path';
import { setMockConfig, resetMockConfig, clearState } from './helpers';

export const mockFilePath = path.join(process.cwd(), 'tests', 'mock_file.txt');

export function createMockFile(content: string = 'Hello, this is a mock file for testing.') {
  fs.writeFileSync(mockFilePath, content);
}

export function deleteMockFile() {
  if (fs.existsSync(mockFilePath)) {
    fs.unlinkSync(mockFilePath);
  }
}

async function getTasksFromLocalStorage(page: Page): Promise<any[]> {
  const tasksStr = await page.evaluate(() => localStorage.getItem('tasks'));
  return tasksStr ? JSON.parse(tasksStr) : [];
}

export const tier1Tests = {
  // ── LISA AI CHAT ──
  test_lisa_send_message: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Type message
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Hello Lisa, I want to create a plan');
    
    // Click Send
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify user message is appended
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes('Hello Lisa, I want to create a plan'));
    });
  },

  test_lisa_streaming_response: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiChatResponseText: 'Streaming responses are working!' });
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Testing stream');
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify streamed AI response is rendered
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes('Streaming responses are working!'));
    });
  },

  test_lisa_mock_fallback_mode: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    // Force AI chat endpoint to fail
    setMockConfig({ aiSuccess: false });
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Use a keyword that triggers a mock response (e.g. "help")
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'I need help');
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify fallback response is rendered (should contain capabilities or similar text)
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes("I'm Lisa, your AI assistant!"));
    });
  },

  test_lisa_file_attachment: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/lisa`);
    
    // Select and upload file
    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    await fileInput.uploadFile(mockFilePath);

    // Verify file name shows in selected list
    await page.waitForFunction(() => {
      const list = document.querySelector('div.bg-white.dark\\:bg-gray-800.border-t');
      return list && list.textContent?.includes('mock_file.txt');
    });

    // Send it
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Sending my doc');
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify message was sent and has attachment notation
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes('[Attached files: mock_file.txt]'));
    });
  },

  test_lisa_auto_scroll: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Send multiple messages
    for (let i = 0; i < 5; i++) {
      await page.type('textarea[placeholder="Ask Lisa anything..."]', `Scroll message ${i}`);
      const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
      await sendButton.click();
      await new Promise(r => setTimeout(r, 300));
    }

    // Verify container scrollHeight is greater than clientHeight and scrollPos is at bottom
    const isScrolled = await page.evaluate(() => {
      const container = document.querySelector('div.flex-1.overflow-y-auto.px-6.py-4');
      if (!container) return false;
      const threshold = 50; // pixels from bottom
      return (container.scrollHeight - container.clientHeight - container.scrollTop) <= threshold;
    });

    if (!isScrolled) {
      throw new Error('Chat container did not auto-scroll to the bottom');
    }
  },

  // ── FILE UPLOAD ──
  test_upload_file_selection: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    // Verify listed under Selected Files
    await page.waitForFunction(() => {
      const selFiles = document.querySelector('div.rounded-2xl.p-8');
      return selFiles && selFiles.textContent?.includes('mock_file.txt');
    });
  },

  test_upload_drag_drop: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/files/upload`);
    await page.waitForSelector('div.border-2.border-dashed');

    // Simulate drag & drop
    await page.evaluate(() => {
      const dropzone = document.querySelector('div.border-2.border-dashed');
      const file = new File(['drag_drop_text_content'], 'dragged_file.txt', { type: 'text/plain' });
      const dt = new DataTransfer();
      dt.items.add(file);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      dropzone?.dispatchEvent(event);
    });

    // Verify file added to list
    await page.waitForFunction(() => {
      const list = document.querySelector('div.rounded-2xl.p-8');
      return list && list.textContent?.includes('dragged_file.txt');
    });
  },

  test_upload_analysis: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({ uploadWithAiSummary: 'This is a mocked file analysis summary.' });
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify summary block is rendered
    await page.waitForFunction(() => {
      const summaries = Array.from(document.querySelectorAll('div.rounded-2xl.p-8'));
      return summaries.some(el => el.textContent?.includes('This is a mocked file analysis summary.'));
    });
  },

  test_upload_ai_tags: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({
      uploadWithAiSummary: 'Analysis complete',
      uploadWithAiTags: ['tag1', 'tag2', 'tag3']
    });
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify tags display
    await page.waitForFunction(() => {
      const tagElements = Array.from(document.querySelectorAll('span.border-violet-200'));
      const tags = tagElements.map(e => e.textContent?.trim());
      return tags.includes('tag1') && tags.includes('tag2') && tags.includes('tag3');
    });
  },

  test_upload_queue_removal: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    // Verify file added
    await page.waitForFunction(() => {
      return document.querySelector('div.rounded-2xl.p-8')?.textContent?.includes('mock_file.txt');
    });

    // Click remove button
    await page.waitForSelector('button.text-gray-400.hover\\:text-red-500');
    await page.evaluate(() => {
      const removeBtn = document.querySelector('button.text-gray-400.hover\\:text-red-500') as HTMLButtonElement;
      removeBtn?.click();
    });

    // Verify removed
    await page.waitForFunction(() => {
      const queue = document.querySelector('div.rounded-2xl.p-8');
      return !queue || !queue.textContent?.includes('mock_file.txt');
    });
  },

  // ── KANBAN TASKS ──
  test_tasks_create_task: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('button.bg-indigo-600');

    // Open Modal
    await page.waitForSelector('button.bg-indigo-600');
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Create Task')) as HTMLButtonElement;
      createBtn?.click();
    });

    // Fill Form
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', 'New E2E Test Task');
    await page.type('textarea[placeholder="Add task description..."]', 'This is a description for testing');
    
    await page.select('select:not([value="MEDIUM"]):not([value="all"])', 'TODO'); // Status select is first select
    const selectPriority = await page.$$('select');
    // Set priority to HIGH
    await selectPriority[1].select('HIGH');

    // Submit
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify task card appears in To Do column
    await page.waitForFunction(() => {
      const todoCol = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'To Do';
      });
      return todoCol && todoCol.textContent?.includes('New E2E Test Task');
    });
  },

  test_tasks_drag_drop_transition: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('h4');
    await page.waitForFunction(() => {
      const t = localStorage.getItem('tasks');
      return t && JSON.parse(t).length > 0;
    });
    
    // Get default task "Fix authentication bug" (starts in TODO column)
    const tasks = await getTasksFromLocalStorage(page);
    const authBugTask = tasks.find(t => t.title.includes('Fix authentication bug'));
    if (!authBugTask) throw new Error('Demo task not found');

    // Drag to "In Progress"
    await page.evaluate((taskId) => {
      const h4 = Array.from(document.querySelectorAll('h4')).find(h => h.textContent?.includes('Fix authentication bug'));
      if (!h4) throw new Error('Card title not found');
      const card = h4.closest('.group');
      if (!card) throw new Error('Card container not found');

      const dt = new DataTransfer();
      dt.setData('taskId', taskId);

      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: dt,
        writable: true,
        configurable: true
      });
      card.dispatchEvent(dragStartEvent);

      const inProgressCol = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'In Progress';
      });
      if (!inProgressCol) throw new Error('In Progress column not found');

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: dt,
        writable: true,
        configurable: true
      });
      inProgressCol.dispatchEvent(dropEvent);
    }, authBugTask.id);

    // Verify task moved to In Progress
    await page.waitForFunction((title) => {
      const inProgressCol = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'In Progress';
      });
      return inProgressCol && inProgressCol.textContent?.includes(title);
    }, authBugTask.title);
  },

  test_tasks_search_filtering: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('input[placeholder="Search tasks..."]');

    // Type "Design new landing page"
    await page.type('input[placeholder="Search tasks..."]', 'Design new landing page');

    // Verify only matching task is visible (and non-matching "Fix authentication bug" is hidden)
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim());
      return cards.includes('Design new landing page') && !cards.includes('Fix authentication bug');
    });
  },

  test_tasks_priority_filtering: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('select');

    // Filter priority by URGENT
    const prioritySelect = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('select')).find(sel => {
        return Array.from(sel.options).some(opt => opt.value === 'URGENT');
      });
    });
    // @ts-ignore
    await prioritySelect.select('URGENT');

    // Verify only Urgent task is shown ("Fix authentication bug")
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim());
      return cards.includes('Fix authentication bug') && !cards.includes('Design new landing page');
    });
  },

  test_tasks_delete_task: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    // Find task "Fix authentication bug" card and hover/click menu
    await page.waitForSelector('h4');
    await page.waitForFunction(() => {
      const t = localStorage.getItem('tasks');
      return t && JSON.parse(t).length > 0;
    });
    
    // We can evaluate directly to click the delete option
    const tasks = await getTasksFromLocalStorage(page);
    const taskToDelete = tasks.find(t => t.title.includes('Fix authentication bug'));
    if (!taskToDelete) throw new Error('Task to delete not found');

    // Open menu on card
    await page.evaluate((title) => {
      const h4 = Array.from(document.querySelectorAll('h4')).find(h => h.textContent?.includes(title));
      if (!h4) throw new Error(`h4 title containing ${title} not found`);
      const card = h4.closest('.group');
      if (!card) throw new Error('Card container not found');
      const menuBtn = card.querySelector('button');
      if (!menuBtn) throw new Error('Menu button not found');
      menuBtn.click();
    }, 'Fix authentication bug');

    // Click delete option
    const deleteBtn = await page.waitForSelector('button.text-red-600');
    await deleteBtn.click();

    // Verify card is removed
    await page.waitForFunction((title) => {
      const cards = Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim());
      return !cards.includes(title);
    }, 'Fix authentication bug');
  },

  // ── INTEGRATION VERIFICATION ──
  test_integration_initial_state: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    await page.waitForSelector('main button');

    // Verify button text
    const btnText = await page.$eval('main button', el => el.textContent?.trim());
    if (btnText !== 'Run All Tests') {
      throw new Error(`Unexpected button text: ${btnText}`);
    }

    // Verify no results
    const hasResults = await page.evaluate(() => {
      return document.querySelector('svg.lucide-check-circle') !== null ||
             document.querySelector('svg.lucide-x-circle') !== null;
    });
    if (hasResults) {
      throw new Error('Test results visible on initial load');
    }
  },

  test_integration_trigger_tests: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('main button');
    await runBtn.click();

    // Verify loader animations are shown
    await page.waitForSelector('svg.lucide-loader');
  },

  test_integration_database_check: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('main button');
    await runBtn.click();

    // Verify DB Connection success check displays
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Database Connection');
      });
      return dbRow && dbRow.querySelector('svg.text-green-500.lucide-check-circle') !== null;
    });
  },

  test_integration_storage_check: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('main button');
    await runBtn.click();

    // Verify Storage Bucket success check displays
    await page.waitForFunction(() => {
      const storageRow = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Storage Buckets');
      });
      return storageRow && storageRow.querySelector('svg.text-green-500.lucide-check-circle') !== null;
    });
  },

  test_integration_ai_check: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiResponseText: 'AI integration test successful response' });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('main button');
    await runBtn.click();

    // Verify AI check success and response printed
    await page.waitForFunction(() => {
      const aiRow = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Lisa AI Assistant');
      });
      const checkIcon = aiRow && aiRow.querySelector('svg.text-green-500.lucide-check-circle') !== null;
      const hasResponse = document.body.textContent?.includes('AI integration test successful response');
      return checkIcon && hasResponse;
    });
  },

  test_messages_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/messages`);
    await page.waitForSelector('input[placeholder="Type a message..."]');

    // Type a message
    await page.type('input[placeholder="Type a message..."]', 'Hello Alex, nice to meet you!');

    // Check character count indicator shows correct value
    await page.waitForFunction(() => document.body.textContent?.includes('29/1000'));

    // Click Send Button
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.querySelector('svg.lucide-send') !== null) as HTMLButtonElement;
      sendBtn?.click();
    });

    // Verify sent message appears in the list
    await page.waitForFunction(() => document.body.textContent?.includes('Hello Alex, nice to meet you!'));
  },

  test_email_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachCampaign: {
        emails: [
          { subject: 'Outreach 1: Quick Question', body: 'Hey, do you have 5 minutes to connect?' },
          { subject: 'Outreach 2: Follow Up', body: 'Just following up on my previous email.' },
          { subject: 'Outreach 3: Final Try', body: 'Last attempt to connect.' }
        ]
      }
    });

    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');

    // Fill inputs
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', 'Founders needing SaaS tooling');
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', 'Book product demo');

    // Click generate sequence button
    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Generate Email Sequence')) as HTMLButtonElement;
      genBtn?.click();
    });

    // Verify sequence shows up
    await page.waitForFunction(() => document.body.textContent?.includes('Outreach 1: Quick Question'));

    // Click Send Test Email to trigger the modal
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Test Email')) as HTMLButtonElement;
      sendTestBtn?.click();
    });

    // In the Modal, enter email and send
    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', 'customer@example.com');

    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Send Email')) as HTMLButtonElement;
      sendBtn?.click();
    });

    // Verify success banner is shown
    await page.waitForFunction(() => document.body.textContent?.includes('Email sent successfully!'));
  },

  test_automation_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/automation`);

    // Click Create Automation button
    const createBtn = await page.waitForSelector('button.bg-indigo-600');
    await createBtn.click();

    // Fill name
    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', 'New Happy Flow');

    // Select trigger (On a Schedule)
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.includes('On a Schedule'));
      (triggers[0] as HTMLButtonElement)?.click();
    });

    // Select action (AI Action)
    await page.evaluate(() => {
      const actions = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.includes('AI Action'));
      (actions[0] as HTMLButtonElement)?.click();
    });

    // Click Save
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Save Automation')) as HTMLButtonElement;
      saveBtn?.click();
    });

    // Verify persistence on list page
    await page.waitForSelector('#automations-list-container');
    await page.waitForFunction(() => document.body.textContent?.includes('New Happy Flow'));
  },

  test_browser_agent_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({
      agentSuccess: true,
      agentSessionId: 'session-happy-id',
      agentSessionStatus: 'awaiting_confirmation',
      agentLiveScreenshot: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });

    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="Describe what you want me to do..."]');

    // Fill objective
    await page.type('input[placeholder="Describe what you want me to do..."]', 'Search for SaaS tools');

    // Click send
    await page.click('button:has(svg.lucide-send)');

    // Verify Live View screenshot is visible
    await page.waitForSelector('img[alt="Browser view"]');

    // Verify confirmation popup buttons are visible
    await page.waitForFunction(() => document.body.textContent?.includes('Confirm') && document.body.textContent?.includes('Deny'));

    // Click Confirm
    const confirmBtn = await page.waitForSelector('button:has(svg.lucide-check-circle)');
    await confirmBtn.click();
  },

  test_phone_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');

    // Click digits 5, 5, 5, 1, 2, 3, 4
    await page.evaluate(() => {
      const digitButtons = Array.from(document.querySelectorAll('button'));
      const digits = ['5', '5', '5', '1', '2', '3', '4'];
      for (const d of digits) {
        const btn = digitButtons.find(b => b.textContent?.trim() === d);
        btn?.click();
      }
    });

    // Check dial pad input contains number
    const val = await page.$eval('input[placeholder="Enter phone number..."]', el => (el as HTMLInputElement).value);
    if (val !== '5551234') {
      throw new Error(`Expected dial number to be 5551234, but got: ${val}`);
    }

    // Click Call
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Call')) as HTMLButtonElement;
      callBtn?.click();
    });

    // Verify active call state
    await page.waitForFunction(() => document.body.textContent?.includes('End Call'));

    // Click End Call
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('End Call')) as HTMLButtonElement;
      endBtn?.click();
    });

    // Verify call ended state
    await page.waitForFunction(() => document.body.textContent?.includes('Call') && !document.body.textContent?.includes('End Call'));
  },

  test_calendar_happy_path: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector('button');

    // Click New Event button
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('New Event'));
      btn?.click();
    });

    // Fill the event details in modal
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', 'E2E Meeting');

    const todayStr = new Date().toISOString().split('T')[0];
    await page.evaluate((val) => {
      const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
      if (dateInput) {
        dateInput.value = val;
        dateInput.dispatchEvent(new Event('input', { bubbles: true }));
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, todayStr);

    await page.evaluate(() => {
      const timeInputs = Array.from(document.querySelectorAll('input[type="time"]')) as HTMLInputElement[];
      if (timeInputs[0]) {
        timeInputs[0].value = '10:00';
        timeInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = '11:00';
        timeInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Click Create Event
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createBtn = btns.find(b => b.textContent?.trim() === 'Create Event');
      createBtn?.click();
    });

    // Switch to Week View
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const weekBtn = btns.find(b => b.textContent?.trim() === 'Week');
      weekBtn?.click();
    });

    // Assert event displays in week view
    await page.waitForFunction(() => document.body.textContent?.includes('E2E Meeting'));
  }
};
