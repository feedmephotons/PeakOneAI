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
      const selFiles = document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8');
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
      const list = document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8');
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
      const summary = document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8');
      return summary && summary.textContent?.includes('This is a mocked file analysis summary.');
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
      return document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent?.includes('mock_file.txt');
    });

    // Click remove button
    const removeBtn = await page.waitForSelector('button.text-gray-400.hover\\:text-red-500');
    await removeBtn.click();

    // Verify removed
    await page.waitForFunction(() => {
      return !document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent?.includes('mock_file.txt');
    });
  },

  // ── KANBAN TASKS ──
  test_tasks_create_task: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('button:has(svg.lucide-plus)');

    // Open Modal
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();

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
    
    // Get default task "Fix authentication bug" (starts in TODO column)
    const tasks = await getTasksFromLocalStorage(page);
    const authBugTask = tasks.find(t => t.title.includes('Fix authentication bug'));
    if (!authBugTask) throw new Error('Demo task not found');

    // Drag to "In Progress"
    await page.evaluate((taskId) => {
      const inProgressCol = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'In Progress';
      });
      if (!inProgressCol) throw new Error('In Progress column not found');

      const dt = new DataTransfer();
      dt.setData('taskId', taskId);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      inProgressCol.dispatchEvent(event);
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
    
    // We can evaluate directly to click the delete option
    const tasks = await getTasksFromLocalStorage(page);
    const taskToDelete = tasks.find(t => t.title.includes('Fix authentication bug'));
    if (!taskToDelete) throw new Error('Task to delete not found');

    // Open menu on card
    await page.evaluate((taskId) => {
      const card = Array.from(document.querySelectorAll('div')).find(div => {
        return div.textContent?.includes('Fix authentication bug') && div.querySelector('button');
      });
      const menuBtn = card?.querySelector('button');
      menuBtn?.click();
    }, taskToDelete.id);

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
    await page.waitForSelector('button');

    // Verify button text
    const btnText = await page.$eval('button', el => el.textContent?.trim());
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
    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify loader animations are shown
    await page.waitForSelector('svg.lucide-loader');
  },

  test_integration_database_check: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('button');
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
    const runBtn = await page.waitForSelector('button');
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
    const runBtn = await page.waitForSelector('button');
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
  }
};
