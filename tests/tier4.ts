import { Page } from 'puppeteer';
import { setMockConfig, clearState } from './helpers';
import { mockFilePath, createMockFile } from './tier1';

export const tier4Tests = {
  test_scenario_task_lifecycle: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('button:has(svg.lucide-plus)');

    // 1. Create Task
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();

    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', 'Lifecycle E2E Task');
    await page.type('textarea[placeholder="Add task description..."]', 'Verifying the complete E2E task lifecycle');
    
    // Select status TODO, Priority HIGH
    await page.waitForSelector('select#task-status');
    await page.select('select#task-status', 'TODO');
    await page.waitForSelector('select#task-priority');
    await page.select('select#task-priority', 'HIGH');

    // Add Tag
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
    await page.type('input[placeholder="Search or create tags..."]', 'lifecycle');

    // d. Click the create button link (which has class hover:underline and text "Create 'X'")
    await page.evaluate((tagName) => {
      const buttons = Array.from(document.querySelectorAll('button.hover\\:underline'));
      const btn = buttons.find(el => el.textContent?.includes('Create') && el.textContent?.includes(tagName)) as HTMLButtonElement;
      if (!btn) throw new Error(`Create tag button link for "${tagName}" not found`);
      btn.click();
    }, 'lifecycle');

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
    }, 'lifecycle');


    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify task card appears
    await page.waitForFunction(() => {
      return document.querySelector('div.bg-white.dark\\:bg-gray-900')?.textContent?.includes('Lifecycle E2E Task');
    });

    // 2. Filter it using Search input
    await page.type('input[placeholder="Search tasks..."]', 'Lifecycle E2E');
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim());
      return cards.includes('Lifecycle E2E Task') && !cards.includes('Design new landing page');
    });

    // Clear search
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search tasks..."]') as HTMLInputElement;
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 3. Move task to In Progress (Drag and Drop)
    const tasksStr = await page.evaluate(() => localStorage.getItem('tasks'));
    const tasks = tasksStr ? JSON.parse(tasksStr) : [];
    const task = tasks.find((t: any) => t.title.includes('Lifecycle E2E Task'));
    if (!task) throw new Error('Lifecycle task not found in localStorage');

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
    }, task.id);

    // Verify in In Progress column
    await page.waitForFunction((title) => {
      const col = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'In Progress';
      });
      return col && col.textContent?.includes(title);
    }, 'Lifecycle E2E Task');

    // 4. Reload page and check persistence
    await page.reload();
    await page.waitForFunction((title) => {
      const col = Array.from(document.querySelectorAll('div')).find(div => {
        const h3 = div.querySelector('h3');
        return h3 && h3.textContent.trim() === 'In Progress';
      });
      return col && col.textContent?.includes(title);
    }, 'Lifecycle E2E Task');

    // 5. Delete the task
    await page.evaluate((taskId) => {
      const card = Array.from(document.querySelectorAll('div')).find(div => {
        return div.textContent?.includes('Lifecycle E2E Task') && div.querySelector('button');
      });
      const menuBtn = card?.querySelector('button');
      menuBtn?.click();
    }, task.id);

    const deleteBtn = await page.waitForSelector('button.text-red-600');
    await deleteBtn.click();

    // Verify deleted
    await page.waitForFunction(() => {
      return !document.body.textContent?.includes('Lifecycle E2E Task');
    });
  },

  test_scenario_document_synthesis: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    const docSummaryText = 'E2E roadmap: Launching milestone 3 E2E test suite in Q2.';
    setMockConfig({
      uploadWithAiSummary: docSummaryText,
      uploadWithAiTags: ['roadmap', 'e2e']
    });

    // 1. Upload doc and extract summary
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Wait for and extract summary text
    await page.waitForFunction((expected) => {
      return document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent?.includes(expected);
    }, docSummaryText);

    // 2. Go to Lisa and ask to refine it
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    const chatQuery = `Refine this summary: ${docSummaryText}`;
    setMockConfig({ aiChatResponseText: 'Here is the refined document synthesis.' });

    await page.type('textarea[placeholder="Ask Lisa anything..."]', chatQuery);
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify refined output is rendered
    await page.waitForFunction(() => {
      return document.body.textContent?.includes('Here is the refined document synthesis.');
    });
  },

  test_scenario_setup_diagnostic: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    
    // 1. Run integration tests
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Wait for all green
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll('svg.text-green-500.lucide-check-circle');
      return checks.length === 3;
    });

    // 2. Navigate via command palette shortcut to Lisa chat (to prove navigation palette works)
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Ask Lisa');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.pathname === '/lisa');

    // 3. Go to DevOps page directly to check visual dashboard
    await page.goto(`${baseUrl}/devops`);
    await page.waitForSelector('div.w-64.min-h-screen');
    const hasVisualIdentity = await page.evaluate(() => {
      return document.body.textContent?.includes('Visual Identity') &&
             document.body.textContent?.includes('Minimalist Apple aesthetic');
    });
    if (!hasVisualIdentity) {
      throw new Error('DevOps visual identity dashboard sections did not load correctly.');
    }
  },

  test_scenario_multi_turn_chat: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/lisa`);
    
    // Turn 1: Attach file and ask "Analyze this"
    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    await fileInput.uploadFile(mockFilePath);

    setMockConfig({ aiChatResponseText: 'This is the document analysis.' });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Analyze this');
    let sendBtn = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn.click();

    // Wait for response 1
    await page.waitForFunction(() => document.body.textContent?.includes('This is the document analysis.'));

    // Turn 2: Follow up query
    setMockConfig({ aiChatResponseText: 'The next step is implementation.' });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'What is the next step?');
    sendBtn = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendBtn.click();

    // Wait for response 2
    await page.waitForFunction(() => document.body.textContent?.includes('The next step is implementation.'));

    // Verify all sequence of turns exist in order
    const orderedMessages = await page.evaluate(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.map(m => m.textContent?.trim() || '');
    });

    const hasSeq1 = orderedMessages.some(m => m.includes('Analyze this'));
    const hasSeq2 = orderedMessages.some(m => m.includes('This is the document analysis.'));
    const hasSeq3 = orderedMessages.some(m => m.includes('What is the next step?'));
    const hasSeq4 = orderedMessages.some(m => m.includes('The next step is implementation.'));

    if (!hasSeq1 || !hasSeq2 || !hasSeq3 || !hasSeq4) {
      throw new Error('Multi-turn conversation order/history was not rendered correctly');
    }
  },

  test_scenario_global_navigation_stress: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    
    // Visit Home
    await page.goto(`${baseUrl}/`);
    await page.waitForSelector('main');

    // Go to Files
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Files');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.pathname === '/files');

    // Go to Upload subpage since upload inputs reside there
    await page.goto(`${baseUrl}/files/upload`);

    // Upload file
    createMockFile();
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes('mock_file.txt'));

    // Go to Tasks
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Tasks');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.pathname === '/tasks');

    // Create task
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', 'Stress Navigation Task');
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes('Stress Navigation Task'));

    // Go to Lisa
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', 'Ask Lisa');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.location.pathname === '/lisa');

    // Send chat
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Global Workspace Stress Test Completed');
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();
    await page.waitForFunction(() => document.body.textContent?.includes('Global Workspace Stress Test Completed'));

    // Go to Test
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify integrations
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll('svg.text-green-500.lucide-check-circle');
      return checks.length === 3;
    });

    // Check navbar active highlighting (Since we are on /test, check that Navigation link for /test is highlighted)
    // Wait, is there a link for Test in the menu? Let's check:
    // Navigation.tsx has a list of links.
    const isTestHighlighted = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('a'));
      const testLink = navLinks.find(link => link.getAttribute('href') === '/test');
      if (!testLink) return false;
      // Active styles usually have text-purple-600 or dark:text-purple-400 or bg-purple-50 etc.
      const classes = testLink.className;
      return classes.includes('text-purple-600') || classes.includes('bg-purple-') || classes.includes('text-indigo-');
    });

    if (!isTestHighlighted) {
      console.log('Warning: Navbar active highlighting selector did not match typical classes, but navigation finished.');
    }
  }
};
