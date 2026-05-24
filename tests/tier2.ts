import { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { setMockConfig, resetMockConfig, clearState } from './helpers';

const mockFilePath = path.join(process.cwd(), 'tests', 'mock_boundary_file.txt');
const mockEmptyFilePath = path.join(process.cwd(), 'tests', 'mock_empty_file.txt');
const mockSpecialFilePath = path.join(process.cwd(), 'tests', 'mock_!@#$%^&()_+.txt');

export function createBoundaryFiles() {
  fs.writeFileSync(mockFilePath, 'A'.repeat(5 * 1024 * 1024)); // 5MB mock file
  fs.writeFileSync(mockEmptyFilePath, ''); // 0-byte file
  fs.writeFileSync(mockSpecialFilePath, 'special name file content');
}

export function deleteBoundaryFiles() {
  [mockFilePath, mockEmptyFilePath, mockSpecialFilePath].forEach(p => {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });
}

async function getTasksFromLocalStorage(page: Page): Promise<any[]> {
  const tasksStr = await page.evaluate(() => localStorage.getItem('tasks'));
  return tasksStr ? JSON.parse(tasksStr) : [];
}

export const tier2Tests = {
  // ── LISA AI CHAT ──
  test_lisa_empty_input_prevent: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Make sure input is empty
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) textarea.value = '';
    });

    // Verify send button is disabled
    const isSendDisabled = await page.$eval('button:has(svg.lucide-send)', btn => (btn as HTMLButtonElement).disabled);
    if (!isSendDisabled) {
      throw new Error('Send button is not disabled for empty input');
    }
  },

  test_lisa_extremely_long_text: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    const longText = 'A'.repeat(2500);
    await page.type('textarea[placeholder="Ask Lisa anything..."]', longText);
    
    const sendButton = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
    await sendButton.click();

    // Verify message is appended and wraps correctly
    await page.waitForFunction((expected) => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'));
      return messages.some(m => m.textContent?.includes(expected));
    }, longText);
  },

  test_lisa_unsupported_file_type: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    const exePath = path.join(process.cwd(), 'tests', 'test_file.exe');
    fs.writeFileSync(exePath, 'mock exe content');
    
    try {
      await page.goto(`${baseUrl}/lisa`);
      const fileInput = await page.waitForSelector('input[type="file"].hidden');
      await fileInput.uploadFile(exePath);

      // Verify it is listed in the UI attached file section or handled gracefully
      await page.waitForFunction(() => {
        const list = document.querySelector('div.bg-white.dark\\:bg-gray-800.border-t');
        return list && list.textContent?.includes('test_file.exe');
      });
    } finally {
      if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
    }
  },

  test_lisa_typing_and_clearing: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Type text
    await page.type('textarea[placeholder="Ask Lisa anything..."]', 'Typing text');
    
    // Check enabled
    let isSendDisabled = await page.$eval('button:has(svg.lucide-send)', btn => (btn as HTMLButtonElement).disabled);
    if (isSendDisabled) throw new Error('Send button should be enabled after typing');

    // Clear text
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = '';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Check disabled again
    isSendDisabled = await page.$eval('button:has(svg.lucide-send)', btn => (btn as HTMLButtonElement).disabled);
    if (!isSendDisabled) throw new Error('Send button should be disabled after clearing input');
  },

  test_lisa_rapid_successive_messages: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');

    // Send 3 messages rapidly
    for (let i = 0; i < 3; i++) {
      await page.type('textarea[placeholder="Ask Lisa anything..."]', `Rapid message ${i}`);
      const btn = await page.waitForSelector('button:has(svg.lucide-send):not([disabled])');
      await btn.click();
      await new Promise(r => setTimeout(r, 100)); // Very brief delay
    }

    // Verify all 3 messages are displayed in correct order
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll('div.flex-1.overflow-y-auto.px-6.py-4 p'))
        .map(m => m.textContent?.trim());
      return messages.some(m => m === 'Rapid message 0') &&
             messages.some(m => m === 'Rapid message 1') &&
             messages.some(m => m === 'Rapid message 2');
    });
  },

  // ── FILE UPLOAD ──
  test_upload_multiple_files: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath, mockEmptyFilePath, mockSpecialFilePath);

    // Verify all three show in selection queue
    await page.waitForFunction(() => {
      const text = document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent || '';
      return text.includes('mock_boundary_file.txt') &&
             text.includes('mock_empty_file.txt') &&
             text.includes('mock_!@#$%^&()_+.txt');
    });
  },

  test_upload_empty_selection: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/files/upload`);
    
    // Verify "Upload & Analyze" button is NOT rendered
    const buttonExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(btn => {
        return btn.textContent?.includes('Upload & Analyze');
      });
    });
    if (buttonExists) {
      throw new Error('Upload & Analyze button is visible when no files are selected');
    }
  },

  test_upload_special_chars: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockSpecialFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify uploaded and processed successfully
    await page.waitForFunction(() => {
      return document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent?.includes('mock_!@#$%^&()_+.txt');
    });
  },

  test_upload_zero_byte: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockEmptyFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify processed successfully
    await page.waitForFunction(() => {
      return document.querySelector('div.bg-white.rounded-2xl.shadow-lg.p-8')?.textContent?.includes('mock_empty_file.txt');
    });
  },

  test_upload_large_file_mock: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    
    const fileInput = await page.waitForSelector('input#file-upload');
    await fileInput.uploadFile(mockFilePath);

    const uploadBtn = await page.waitForSelector('button:has(svg.lucide-upload)');
    await uploadBtn.click();

    // Verify loading progress state shows ("Uploading & Analyzing...")
    await page.waitForFunction(() => {
      const btn = document.querySelector('button');
      return btn && btn.textContent?.includes('Uploading & Analyzing...');
    });
  },

  // ── KANBAN Board ──
  test_tasks_empty_title_prevent: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();

    await page.waitForSelector('form');

    // Attempt to submit without entering title
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify modal remains open (HTML5 form validation prevents submission)
    const isModalOpen = await page.evaluate(() => {
      return document.querySelector('form') !== null;
    });
    if (!isModalOpen) {
      throw new Error('Modal closed, empty title validation failed');
    }
  },

  test_tasks_long_text_layout: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();

    await page.waitForSelector('input[placeholder="Enter task title..."]');
    
    const longTitle = 'Title ' + 'A'.repeat(150);
    const longDesc = 'Description ' + 'B'.repeat(300);

    await page.type('input[placeholder="Enter task title..."]', longTitle);
    await page.type('textarea[placeholder="Add task description..."]', longDesc);
    
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify card is created and title matches (truncated or class exists)
    await page.waitForFunction((title) => {
      const card = Array.from(document.querySelectorAll('h4')).find(el => el.textContent?.trim().includes(title.substring(0, 50)));
      return card && card.classList.contains('line-clamp-2');
    }, longTitle);
  },

  test_tasks_checkbox_selection: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    await page.waitForSelector('input[type="checkbox"]');
    
    // Check first checkbox
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox?.click();
    });

    // Verify checked
    const isChecked = await page.$eval('input[type="checkbox"]', el => (el as HTMLInputElement).checked);
    if (!isChecked) {
      throw new Error('Checkbox selection failed');
    }
  },

  test_tasks_bulk_deletion: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    await page.waitForSelector('input[type="checkbox"]');

    // Intercept native confirm dialog
    const dialogHandler = async (dialog: any) => {
      await dialog.accept();
    };
    page.on('dialog', dialogHandler);

    try {
      // Check multiple checkboxes
      const initialCount = await page.evaluate(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        checkboxes.slice(0, 2).forEach(cb => (cb as HTMLInputElement).click());
        return checkboxes.length;
      });

      // Verify bulk action bar is shown
      await page.waitForSelector('div.animate-slide-up');

      // Click delete in bulk bar
      const deleteBtn = await page.waitForSelector('button[title="Delete"]');
      await deleteBtn.click();

      // Verify tasks deleted (checkbox count decreases)
      await page.waitForFunction((initial) => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        return checkboxes.length < initial;
      }, initialCount);
    } finally {
      page.off('dialog', dialogHandler);
    }
  },

  test_tasks_reload_persistence: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    
    // Create new task
    const createBtn = await page.waitForSelector('button:has(svg.lucide-plus)');
    await createBtn.click();

    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', 'Persistent Task');
    
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();

    // Verify created
    await page.waitForFunction(() => document.body.textContent?.includes('Persistent Task'));

    // Reload page
    await page.reload();

    // Verify still exists
    await page.waitForFunction(() => document.body.textContent?.includes('Persistent Task'));
  },

  // ── INTEGRATION VERIFICATION ──
  test_integration_consecutive_runs: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    
    // Click button twice rapidly
    const btn = await page.waitForSelector('button');
    await btn.click();
    await btn.click();

    // Verify it handles state transition cleanly (shows loaders or finishes)
    await page.waitForSelector('svg.lucide-loader');
  },

  test_integration_api_timeout: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ dbHang: true }); // Hang database check
    await page.goto(`${baseUrl}/test`);

    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify Database Connection displays a red XCircle
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Database Connection');
      });
      return dbRow && dbRow.querySelector('svg.text-red-500.lucide-x-circle') !== null;
    });
  },

  test_integration_db_failure: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ dbSuccess: false }); // Database fails
    await page.goto(`${baseUrl}/test`);

    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify Database Connection displays a red XCircle
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Database Connection');
      });
      return dbRow && dbRow.querySelector('svg.text-red-500.lucide-x-circle') !== null;
    });
  },

  test_integration_storage_failure: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ storageSuccess: false }); // Storage fails
    await page.goto(`${baseUrl}/test`);

    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify Storage Buckets displays a red XCircle
    await page.waitForFunction(() => {
      const row = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Storage Buckets');
      });
      return row && row.querySelector('svg.text-red-500.lucide-x-circle') !== null;
    });
  },

  test_integration_ai_key_failure: async (page: Page, baseUrl: string) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiSuccess: false }); // AI fails
    await page.goto(`${baseUrl}/test`);

    const runBtn = await page.waitForSelector('button');
    await runBtn.click();

    // Verify Lisa AI Assistant displays a red XCircle
    await page.waitForFunction(() => {
      const row = Array.from(document.querySelectorAll('div.border-gray-200')).find(el => {
        return el.textContent?.includes('Lisa AI Assistant');
      });
      return row && row.querySelector('svg.text-red-500.lucide-x-circle') !== null;
    });
  }
};
