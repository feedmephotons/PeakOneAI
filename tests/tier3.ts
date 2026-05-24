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
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
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
    await page.waitForSelector('button:has(svg.lucide-plus)');

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
  }
};
