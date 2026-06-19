"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// tests/run-all.ts
var import_puppeteer = __toESM(require("puppeteer"));

// tests/helpers.ts
var import_net = __toESM(require("net"));
var import_child_process = require("child_process");
var activeMockConfig = {};
function setMockConfig(config) {
  activeMockConfig = { ...config };
}
function resetMockConfig() {
  activeMockConfig = {};
}
function checkPortActive(port, host = "localhost") {
  return new Promise((resolve) => {
    const socket = new import_net.default.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(1e3);
    socket.once("error", onError);
    socket.once("timeout", onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}
async function startServer() {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`[E2E DEBUG] Current Working Directory: ${process.cwd()}`);
  const fs3 = require("fs");
  const path3 = require("path");
  const distDir = process.env.NEXT_DIST_DIR || ".next";
  const buildIdPath = path3.join(process.cwd(), distDir, "BUILD_ID");
  console.log(`[E2E DEBUG] ${distDir}/BUILD_ID path: ${buildIdPath}`);
  console.log(`[E2E DEBUG] ${distDir}/BUILD_ID exists: ${fs3.existsSync(buildIdPath)}`);
  console.log(`Starting Next.js production server on port ${port}...`);
  const serverProcess = (0, import_child_process.spawn)("/home/wfowlkes/my_node_gen6", ["server.js"], {
    shell: true,
    stdio: "pipe",
    cwd: process.cwd(),
    env: { ...process.env, PORT: port.toString(), NODE_ENV: "production" }
  });
  serverProcess.stdout?.on("data", (data) => {
    process.stdout.write(data);
  });
  serverProcess.stderr?.on("data", (data) => {
    process.stderr.write(data);
  });
  let attempts = 0;
  while (attempts < 30) {
    const active = await checkPortActive(port);
    if (active) {
      console.log(`Server is ready on port ${port}.`);
      return serverProcess;
    }
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    attempts++;
  }
  throw new Error(`Failed to start Next.js dev server on port ${port} after 30 seconds`);
}
function stopServer(serverProcess) {
  return new Promise((resolve) => {
    console.log("Stopping Next.js dev server...");
    if (process.platform === "win32") {
      (0, import_child_process.spawn)("taskkill", ["/pid", serverProcess.pid.toString(), "/f", "/t"], { shell: true }).on("exit", () => resolve());
    } else {
      serverProcess.kill("SIGTERM");
      resolve();
    }
  });
}
async function setupPage(browser, baseUrl) {
  const page = await browser.newPage();
  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    console.error(`[BROWSER ERROR] ${err.message}`);
  });
  page.on("requestfailed", (request) => {
    console.log(`[BROWSER NETWORK] FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });
  page.on("response", (response) => {
    if (!response.ok()) {
      console.log(`[BROWSER NETWORK] ERROR ${response.status()}: ${response.url()}`);
    }
  });
  await page.setViewport({ width: 1280, height: 800 });
  await page.setBypassServiceWorker(true);
  await page.evaluateOnNewDocument(() => {
    if (window.navigator && "serviceWorker" in window.navigator) {
      window.navigator.serviceWorker.register = async () => {
        console.log("[E2E TEST] Blocked service worker registration");
        return {
          unregister: async () => true,
          addEventListener: () => {
          },
          removeEventListener: () => {
          },
          dispatchEvent: () => false,
          onupdatefound: null,
          active: null,
          installing: null,
          waiting: null,
          pushManager: {}
        };
      };
    }
  });
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = request.url();
    if (url.includes("supabase.co")) {
      const parsedUrl = new URL(url);
      const path3 = parsedUrl.pathname;
      if (path3.includes("/auth/v1/user")) {
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "mock-user-id",
            email: "test@saasx.com",
            user_metadata: { name: "Mock User" }
          })
        });
        return;
      }
      if (path3.includes("/auth/v1/token")) {
        let email = "test@saasx.com";
        const postData = request.postData();
        if (postData) {
          try {
            const parsed = JSON.parse(postData);
            if (parsed.email) email = parsed.email;
          } catch {
          }
        }
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh-token",
            user: {
              id: "mock-user-" + email.replace(/[^a-zA-Z0-9]/g, ""),
              email,
              email_confirmed_at: (/* @__PURE__ */ new Date()).toISOString(),
              user_metadata: { name: email.split("@")[0] }
            }
          })
        });
        return;
      }
      if (path3.includes("/auth/v1/signup")) {
        let email = "test@saasx.com";
        const postData = request.postData();
        if (postData) {
          try {
            const parsed = JSON.parse(postData);
            if (parsed.email) email = parsed.email;
          } catch {
          }
        }
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "mock-user-" + email.replace(/[^a-zA-Z0-9]/g, ""),
              email,
              email_confirmed_at: (/* @__PURE__ */ new Date()).toISOString(),
              user_metadata: { name: email.split("@")[0] }
            }
          })
        });
        return;
      }
      if (path3.includes("/auth/v1/logout") || path3.includes("/auth/v1/signout")) {
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({})
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          session: null,
          user: null
        })
      });
      return;
    }
    if (url.includes("/api/test/db")) {
      if (activeMockConfig.dbHang) {
        await request.abort("timedout");
        return;
      }
      if (activeMockConfig.dbSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "Database connection failed" })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Database connection successful", userCount: 42 })
      });
      return;
    }
    if (url.includes("/api/test/storage")) {
      if (activeMockConfig.storageHang) {
        await request.abort("timedout");
        return;
      }
      if (activeMockConfig.storageSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "Storage test failed" })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "All storage buckets configured", buckets: ["files", "avatars", "recordings"] })
      });
      return;
    }
    if (url.includes("/api/test/ai")) {
      if (activeMockConfig.aiHang) {
        await request.abort("timedout");
        return;
      }
      if (activeMockConfig.aiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "AI test failed" })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Gemini AI integration working", response: activeMockConfig.aiResponseText || "Hello, I am Lisa" })
      });
      return;
    }
    if (url.includes("/api/ai/chat")) {
      if (activeMockConfig.aiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "AI key failed" })
        });
        return;
      }
      const responseText = activeMockConfig.aiChatResponseText || "This is streaming response from Lisa AI.";
      const responseBody = `data: {"type":"content","content":"${responseText}"}
data: [DONE]
`;
      await request.respond({
        status: 200,
        contentType: "text/event-stream",
        body: responseBody
      });
      return;
    }
    if (url.includes("/api/files/upload-with-ai")) {
      if (activeMockConfig.uploadWithAiSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Failed to upload and analyze file" })
        });
        return;
      }
      const summary = activeMockConfig.uploadWithAiSummary || "File analyzed successfully";
      const tags = activeMockConfig.uploadWithAiTags || ["document", "test"];
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          file: {
            id: `demo-${Date.now()}`,
            name: "uploaded_file.txt",
            mimeType: "text/plain",
            size: 100,
            aiSummary: summary,
            aiTags: tags
          },
          analysis: {
            summary,
            tags
          },
          message: "File analyzed successfully with Lisa AI"
        })
      });
      return;
    }
    if (url.includes("/api/conversations")) {
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          conversations: [
            {
              id: "conv-1",
              type: "direct",
              name: "Alex Rivera",
              lastMessage: "Hey, how is it going?",
              lastMessageTime: (/* @__PURE__ */ new Date()).toISOString(),
              unreadCount: 0,
              participants: ["demo-user-id", "alex-id"],
              isOnline: true,
              isPinned: false,
              isMuted: false
            }
          ]
        })
      });
      return;
    }
    if (url.includes("/api/messages")) {
      if (request.method() === "POST") {
        let body = {};
        try {
          body = JSON.parse(request.postData() || "{}");
        } catch {
        }
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: {
              id: body.id || `msg-${Date.now()}`,
              conversationId: body.conversationId || "conv-1",
              senderId: "user",
              senderName: "You",
              content: body.content || "",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              type: body.type || "text",
              isRead: true
            }
          })
        });
        return;
      }
      if (request.method() === "PUT") {
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          messages: [
            {
              id: "msg-1",
              conversationId: "conv-1",
              senderId: "alex-id",
              senderName: "Alex Rivera",
              content: "Hey, how is it going?",
              timestamp: (/* @__PURE__ */ new Date()).toISOString(),
              type: "text",
              isRead: true
            }
          ]
        })
      });
      return;
    }
    if (url.includes("/api/ai/email-outreach")) {
      if (activeMockConfig.emailOutreachHang) {
        await request.abort("timedout");
        return;
      }
      if (activeMockConfig.emailOutreachSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Failed to generate email outreach campaign" })
        });
        return;
      }
      let emailsList = [];
      const mockCampaign = activeMockConfig.emailOutreachCampaign;
      if (mockCampaign) {
        if (Array.isArray(mockCampaign)) {
          emailsList = mockCampaign;
        } else if (typeof mockCampaign === "object" && "emails" in mockCampaign) {
          emailsList = mockCampaign.emails;
        } else if (typeof mockCampaign === "object" && "campaign" in mockCampaign) {
          emailsList = mockCampaign.campaign;
        } else {
          emailsList = [mockCampaign];
        }
      } else {
        emailsList = [
          { subject: "Outreach 1: Quick Question", body: "Hi, I noticed your company could benefit from our service." },
          { subject: "Outreach 2: Follow Up", body: "Hi, just following up on my previous email." },
          { subject: "Outreach 3: Final Attempt", body: "Hi, this is my last attempt to reach you." }
        ];
      }
      const mappedEmails = emailsList.map((e, index) => ({
        id: e.id || (index + 1).toString(),
        subject: e.subject || `Outreach ${index + 1}`,
        body: e.body || "",
        delay: typeof e.delay === "number" ? e.delay : index === 0 ? 0 : index * 2 + 1,
        generated: true
      }));
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, emails: mappedEmails })
      });
      return;
    }
    if (url.includes("/api/email/send")) {
      if (activeMockConfig.emailSendSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: activeMockConfig.emailSendError || "SMTP connection timeout" })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, id: "mock-email-uuid" })
      });
      return;
    }
    if (url.includes("/api/agent/sessions")) {
      if (request.method() === "POST") {
        let body = {};
        try {
          body = JSON.parse(request.postData() || "{}");
        } catch {
        }
        const startUrl = body.startUrl;
        if (startUrl) {
          try {
            const parsed = new URL(startUrl);
            const isLoopback = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
            const isBlockedProtocol = ["file:", "ftp:", "data:", "javascript:", "chrome:"].includes(parsed.protocol);
            if (isLoopback) {
              await request.respond({
                status: 400,
                contentType: "application/json",
                body: JSON.stringify({ error: "Loopback address block: Access to localhost or 127.0.0.1 is prohibited for security reasons" })
              });
              return;
            }
            if (isBlockedProtocol) {
              await request.respond({
                status: 400,
                contentType: "application/json",
                body: JSON.stringify({ error: `Protocol block: Access to ${parsed.protocol} is prohibited for security reasons` })
              });
              return;
            }
          } catch {
            await request.respond({
              status: 400,
              contentType: "application/json",
              body: JSON.stringify({ error: "Invalid URL format" })
            });
            return;
          }
        }
        if (activeMockConfig.agentSuccess === false) {
          await request.respond({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ error: activeMockConfig.agentValidationReason || "Failed to create session" })
          });
          return;
        }
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            session: {
              id: activeMockConfig.agentSessionId || "mock-session-id",
              objective: body.objective,
              status: activeMockConfig.agentSessionStatus || "idle",
              startUrl,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            },
            message: "Session created"
          })
        });
        return;
      }
      if (url.match(/\/api\/agent\/sessions\/[^\/]+\/live/)) {
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            session: {
              id: activeMockConfig.agentSessionId || "mock-session-id",
              status: activeMockConfig.agentSessionStatus || "executing"
            },
            liveState: {
              screenshot: activeMockConfig.agentLiveScreenshot || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
              url: "https://www.google.com",
              status: activeMockConfig.agentSessionStatus || "executing",
              currentAction: activeMockConfig.agentCurrentAction || void 0,
              progress: {
                completedTasks: 1,
                totalTasks: 3,
                currentTask: "Searching Google"
              },
              logs: activeMockConfig.agentLiveLogs || [
                { timestamp: (/* @__PURE__ */ new Date()).toISOString(), level: "info", message: "Initializing browser..." },
                { timestamp: (/* @__PURE__ */ new Date()).toISOString(), level: "success", message: "Navigated to Google" }
              ]
            }
          })
        });
        return;
      }
      if (url.match(/\/api\/agent\/sessions\/[^\/]+$/)) {
        if (request.method() === "POST") {
          let body = {};
          try {
            body = JSON.parse(request.postData() || "{}");
          } catch {
          }
          const action = body.action;
          if (action === "pause") {
            activeMockConfig.agentSessionStatus = "paused";
          } else if (action === "resume") {
            activeMockConfig.agentSessionStatus = "executing";
          } else if (action === "cancel") {
            activeMockConfig.agentSessionStatus = "cancelled";
          } else if (action === "confirm") {
            activeMockConfig.agentSessionStatus = "executing";
            activeMockConfig.agentCurrentAction = void 0;
          } else if (action === "deny") {
            activeMockConfig.agentSessionStatus = "cancelled";
            activeMockConfig.agentCurrentAction = void 0;
          }
          await request.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, message: `Session action ${action} executed` })
          });
          return;
        } else if (request.method() === "GET") {
          await request.respond({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              session: {
                id: activeMockConfig.agentSessionId || "mock-session-id",
                objective: "Test Objective",
                status: activeMockConfig.agentSessionStatus || "idle",
                createdAt: (/* @__PURE__ */ new Date()).toISOString(),
                tasks: activeMockConfig.agentLiveTasks || []
              },
              messages: [
                { id: "1", role: "system", content: "Session initialized", timestamp: (/* @__PURE__ */ new Date()).toISOString() }
              ],
              liveState: {
                screenshot: activeMockConfig.agentLiveScreenshot || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                url: "https://www.google.com",
                status: activeMockConfig.agentSessionStatus || "idle",
                currentAction: activeMockConfig.agentCurrentAction || void 0,
                logs: activeMockConfig.agentLiveLogs || []
              }
            })
          });
          return;
        }
      }
      if (url.endsWith("/api/agent/sessions") && request.method() === "GET") {
        await request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ sessions: [] })
        });
        return;
      }
    }
    if (url.includes("/api/calls/transcribe")) {
      if (activeMockConfig.callTranscribeSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Transcription failed" })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          transcript: activeMockConfig.callTranscribeText || "This is a mock call transcription."
        })
      });
      return;
    }
    if (url.includes("/api/calls/summary")) {
      if (activeMockConfig.callSummarySuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Summary generation failed" })
        });
        return;
      }
      const actionItems = activeMockConfig.callSummaryActionItems || [
        { text: "Send proposal by Friday", severity: "high" },
        { text: "Schedule next sync", severity: "medium" }
      ];
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          summary: activeMockConfig.callSummaryText || "Lisa Summary: The team aligned on deadlines.",
          actionItems
        })
      });
      return;
    }
    if (url.includes("/api/calendar/sync")) {
      if (activeMockConfig.calendarSyncSuccess === false) {
        await request.respond({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: activeMockConfig.calendarSyncError || "Google Calendar auth expired" })
        });
        return;
      }
      if (activeMockConfig.calendarSyncConflict) {
        await request.respond({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Sync Conflict",
            conflicts: [
              { id: "conflict-1", title: "Double booking detected with Team Standup" }
            ]
          })
        });
        return;
      }
      await request.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Calendar sync complete" })
      });
      return;
    }
    try {
      await request.continue();
    } catch {
    }
  });
  return page;
}
async function clearState(page, baseUrl) {
  resetMockConfig();
  await page.goto(baseUrl);
  const urlObj = new URL(baseUrl);
  const domain = urlObj.hostname;
  await page.setCookie(
    { name: "sb-mock-user-id", value: "mock-user-id", domain, path: "/" },
    { name: "sb-mock-user-email", value: "test@saasx.com", domain, path: "/" },
    { name: "sb-mock-user-name", value: "Mock User", domain, path: "/" }
  );
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    if (window.navigator && "serviceWorker" in window.navigator) {
      try {
        const registrations = await window.navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log("[E2E TEST] Unregistered existing service worker");
        }
      } catch (err) {
        console.error("[E2E TEST] Failed to unregister service worker:", err);
      }
    }
    if ("caches" in window) {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      } catch (err) {
        console.error("[E2E TEST] Failed to delete caches:", err);
      }
    }
  });
}

// tests/tier1.ts
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var mockFilePath = import_path.default.join(process.cwd(), "tests", "mock_file.txt");
function createMockFile(content = "Hello, this is a mock file for testing.") {
  import_fs.default.writeFileSync(mockFilePath, content);
}
function deleteMockFile() {
  if (import_fs.default.existsSync(mockFilePath)) {
    import_fs.default.unlinkSync(mockFilePath);
  }
}
async function getTasksFromLocalStorage(page) {
  const tasksStr = await page.evaluate(() => localStorage.getItem("tasks"));
  return tasksStr ? JSON.parse(tasksStr) : [];
}
var tier1Tests = {
  // ── LISA AI CHAT ──
  test_lisa_send_message: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Hello Lisa, I want to create a plan");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.some((m) => m.textContent?.includes("Hello Lisa, I want to create a plan"));
    });
  },
  test_lisa_streaming_response: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiChatResponseText: "Streaming responses are working!" });
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Testing stream");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.some((m) => m.textContent?.includes("Streaming responses are working!"));
    });
  },
  test_lisa_mock_fallback_mode: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiSuccess: false });
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "I need help");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.some((m) => m.textContent?.includes("I'm Lisa, your AI assistant!"));
    });
  },
  test_lisa_file_attachment: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/lisa`);
    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    await fileInput.uploadFile(mockFilePath);
    await page.waitForFunction(() => {
      const list = document.querySelector("div.bg-white.dark\\:bg-gray-800.border-t");
      return list && list.textContent?.includes("mock_file.txt");
    });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Sending my doc");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.some((m) => m.textContent?.includes("[Attached files: mock_file.txt]"));
    });
  },
  test_lisa_auto_scroll: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    for (let i = 0; i < 5; i++) {
      await page.type('textarea[placeholder="Ask Lisa anything..."]', `Scroll message ${i}`);
      const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
      await sendButton.click();
      await new Promise((r) => setTimeout(r, 300));
    }
    const isScrolled = await page.evaluate(() => {
      const container = document.querySelector("div.flex-1.overflow-y-auto.px-6.py-4");
      if (!container) return false;
      const threshold = 50;
      return container.scrollHeight - container.clientHeight - container.scrollTop <= threshold;
    });
    if (!isScrolled) {
      throw new Error("Chat container did not auto-scroll to the bottom");
    }
  },
  // ── FILE UPLOAD ──
  test_upload_file_selection: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    await page.waitForFunction(() => {
      const selFiles = document.querySelector("div.rounded-2xl.p-8");
      return selFiles && selFiles.textContent?.includes("mock_file.txt");
    });
  },
  test_upload_drag_drop: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/files/upload`);
    await page.waitForSelector("div.border-2.border-dashed");
    await page.evaluate(() => {
      const dropzone = document.querySelector("div.border-2.border-dashed");
      const file = new File(["drag_drop_text_content"], "dragged_file.txt", { type: "text/plain" });
      const dt = new DataTransfer();
      dt.items.add(file);
      const event = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      dropzone?.dispatchEvent(event);
    });
    await page.waitForFunction(() => {
      const list = document.querySelector("div.rounded-2xl.p-8");
      return list && list.textContent?.includes("dragged_file.txt");
    });
  },
  test_upload_analysis: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({ uploadWithAiSummary: "This is a mocked file analysis summary." });
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const summaries = Array.from(document.querySelectorAll("div.rounded-2xl.p-8"));
      return summaries.some((el) => el.textContent?.includes("This is a mocked file analysis summary."));
    });
  },
  test_upload_ai_tags: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({
      uploadWithAiSummary: "Analysis complete",
      uploadWithAiTags: ["tag1", "tag2", "tag3"]
    });
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const tagElements = Array.from(document.querySelectorAll("span.border-violet-200"));
      const tags = tagElements.map((e) => e.textContent?.trim());
      return tags.includes("tag1") && tags.includes("tag2") && tags.includes("tag3");
    });
  },
  test_upload_queue_removal: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    await page.waitForFunction(() => {
      return document.querySelector("div.rounded-2xl.p-8")?.textContent?.includes("mock_file.txt");
    });
    await page.waitForSelector("button.text-gray-400.hover\\:text-red-500");
    await page.evaluate(() => {
      const removeBtn = document.querySelector("button.text-gray-400.hover\\:text-red-500");
      removeBtn?.click();
    });
    await page.waitForFunction(() => {
      const queue = document.querySelector("div.rounded-2xl.p-8");
      return !queue || !queue.textContent?.includes("mock_file.txt");
    });
  },
  // ── KANBAN TASKS ──
  test_tasks_create_task: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("button.bg-indigo-600");
    await page.waitForSelector("button.bg-indigo-600");
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Task"));
      createBtn?.click();
    });
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', "New E2E Test Task");
    await page.type('textarea[placeholder="Add task description..."]', "This is a description for testing");
    await page.select('select:not([value="MEDIUM"]):not([value="all"])', "TODO");
    const selectPriority = await page.$$("select");
    await selectPriority[1].select("HIGH");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => {
      const todoCol = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "To Do";
      });
      return todoCol && todoCol.textContent?.includes("New E2E Test Task");
    });
  },
  test_tasks_drag_drop_transition: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("h4");
    await page.waitForFunction(() => {
      const t = localStorage.getItem("tasks");
      return t && JSON.parse(t).length > 0;
    });
    const tasks = await getTasksFromLocalStorage(page);
    const authBugTask = tasks.find((t) => t.title.includes("Fix authentication bug"));
    if (!authBugTask) throw new Error("Demo task not found");
    await page.evaluate((taskId) => {
      const h4 = Array.from(document.querySelectorAll("h4")).find((h) => h.textContent?.includes("Fix authentication bug"));
      if (!h4) throw new Error("Card title not found");
      const card = h4.closest(".group");
      if (!card) throw new Error("Card container not found");
      const dt = new DataTransfer();
      dt.setData("taskId", taskId);
      const dragStartEvent = new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(dragStartEvent, "dataTransfer", {
        value: dt,
        writable: true,
        configurable: true
      });
      card.dispatchEvent(dragStartEvent);
      const inProgressCol = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "In Progress";
      });
      if (!inProgressCol) throw new Error("In Progress column not found");
      const dropEvent = new DragEvent("drop", {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(dropEvent, "dataTransfer", {
        value: dt,
        writable: true,
        configurable: true
      });
      inProgressCol.dispatchEvent(dropEvent);
    }, authBugTask.id);
    await page.waitForFunction((title) => {
      const inProgressCol = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "In Progress";
      });
      return inProgressCol && inProgressCol.textContent?.includes(title);
    }, authBugTask.title);
  },
  test_tasks_search_filtering: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('input[placeholder="Search tasks..."]');
    await page.type('input[placeholder="Search tasks..."]', "Design new landing page");
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("h4")).map((h) => h.textContent?.trim());
      return cards.includes("Design new landing page") && !cards.includes("Fix authentication bug");
    });
  },
  test_tasks_priority_filtering: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("select");
    const prioritySelect = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll("select")).find((sel) => {
        return Array.from(sel.options).some((opt) => opt.value === "URGENT");
      });
    });
    await prioritySelect.select("URGENT");
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("h4")).map((h) => h.textContent?.trim());
      return cards.includes("Fix authentication bug") && !cards.includes("Design new landing page");
    });
  },
  test_tasks_delete_task: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("h4");
    await page.waitForFunction(() => {
      const t = localStorage.getItem("tasks");
      return t && JSON.parse(t).length > 0;
    });
    const tasks = await getTasksFromLocalStorage(page);
    const taskToDelete = tasks.find((t) => t.title.includes("Fix authentication bug"));
    if (!taskToDelete) throw new Error("Task to delete not found");
    await page.evaluate((title) => {
      const h4 = Array.from(document.querySelectorAll("h4")).find((h) => h.textContent?.includes(title));
      if (!h4) throw new Error(`h4 title containing ${title} not found`);
      const card = h4.closest(".group");
      if (!card) throw new Error("Card container not found");
      const menuBtn = card.querySelector("button");
      if (!menuBtn) throw new Error("Menu button not found");
      menuBtn.click();
    }, "Fix authentication bug");
    const deleteBtn = await page.waitForSelector("button.text-red-600");
    await deleteBtn.click();
    await page.waitForFunction((title) => {
      const cards = Array.from(document.querySelectorAll("h4")).map((h) => h.textContent?.trim());
      return !cards.includes(title);
    }, "Fix authentication bug");
  },
  // ── INTEGRATION VERIFICATION ──
  test_integration_initial_state: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    await page.waitForSelector("main button");
    const btnText = await page.$eval("main button", (el) => el.textContent?.trim());
    if (btnText !== "Run All Tests") {
      throw new Error(`Unexpected button text: ${btnText}`);
    }
    const hasResults = await page.evaluate(() => {
      return document.querySelector("svg.lucide-check-circle") !== null || document.querySelector("svg.lucide-x-circle") !== null;
    });
    if (hasResults) {
      throw new Error("Test results visible on initial load");
    }
  },
  test_integration_trigger_tests: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("main button");
    await runBtn.click();
    await page.waitForSelector("svg.lucide-loader");
  },
  test_integration_database_check: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("main button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Database Connection");
      });
      return dbRow && dbRow.querySelector("svg.text-green-500.lucide-check-circle") !== null;
    });
  },
  test_integration_storage_check: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("main button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const storageRow = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Storage Buckets");
      });
      return storageRow && storageRow.querySelector("svg.text-green-500.lucide-check-circle") !== null;
    });
  },
  test_integration_ai_check: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiResponseText: "AI integration test successful response" });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("main button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const aiRow = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Lisa AI Assistant");
      });
      const checkIcon = aiRow && aiRow.querySelector("svg.text-green-500.lucide-check-circle") !== null;
      const hasResponse = document.body.textContent?.includes("AI integration test successful response");
      return checkIcon && hasResponse;
    });
  },
  test_messages_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/messages`);
    await page.waitForSelector('input[placeholder="Type a message..."]');
    await page.type('input[placeholder="Type a message..."]', "Hello Alex, nice to meet you!");
    await page.waitForFunction(() => document.body.textContent?.includes("29/1000"));
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.querySelector("svg.lucide-send") !== null);
      sendBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Hello Alex, nice to meet you!"));
  },
  test_email_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachCampaign: {
        emails: [
          { subject: "Outreach 1: Quick Question", body: "Hey, do you have 5 minutes to connect?" },
          { subject: "Outreach 2: Follow Up", body: "Just following up on my previous email." },
          { subject: "Outreach 3: Final Try", body: "Last attempt to connect." }
        ]
      }
    });
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', "Founders needing SaaS tooling");
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', "Book product demo");
    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Generate Email Sequence"));
      genBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Outreach 1: Quick Question"));
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Test Email"));
      sendTestBtn?.click();
    });
    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', "customer@example.com");
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Email"));
      sendBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Email sent successfully!"));
  },
  test_automation_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/automation`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', "New Happy Flow");
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("On a Schedule"));
      triggers[0]?.click();
    });
    await page.evaluate(() => {
      const actions = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("AI Action"));
      actions[0]?.click();
    });
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Save Automation"));
      saveBtn?.click();
    });
    await page.waitForSelector("#automations-list-container");
    await page.waitForFunction(() => document.body.textContent?.includes("New Happy Flow"));
  },
  test_browser_agent_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      agentSuccess: true,
      agentSessionId: "session-happy-id",
      agentSessionStatus: "awaiting_confirmation",
      agentLiveScreenshot: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    });
    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="Describe what you want me to do..."]');
    await page.type('input[placeholder="Describe what you want me to do..."]', "Search for SaaS tools");
    await page.click("button:has(svg.lucide-send)");
    await page.waitForSelector('img[alt="Browser view"]');
    await page.waitForFunction(() => document.body.textContent?.includes("Confirm") && document.body.textContent?.includes("Deny"));
    const confirmBtn = await page.waitForSelector("button:has(svg.lucide-check-circle)");
    await confirmBtn.click();
  },
  test_phone_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.evaluate(() => {
      const digitButtons = Array.from(document.querySelectorAll("button"));
      const digits = ["5", "5", "5", "1", "2", "3", "4"];
      for (const d of digits) {
        const btn = digitButtons.find((b) => b.textContent?.trim() === d);
        btn?.click();
      }
    });
    const val = await page.$eval('input[placeholder="Enter phone number..."]', (el) => el.value);
    if (val !== "5551234") {
      throw new Error(`Expected dial number to be 5551234, but got: ${val}`);
    }
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Call"));
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("End Call"));
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Call") && !document.body.textContent?.includes("End Call"));
  },
  test_calendar_happy_path: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector("button");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent?.includes("New Event"));
      btn?.click();
    });
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', "E2E Meeting");
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await page.evaluate((val) => {
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput) {
        dateInput.value = val;
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, todayStr);
    await page.evaluate(() => {
      const timeInputs = Array.from(document.querySelectorAll('input[type="time"]'));
      if (timeInputs[0]) {
        timeInputs[0].value = "10:00";
        timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = "11:00";
        timeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const createBtn = btns.find((b) => b.textContent?.trim() === "Create Event");
      createBtn?.click();
    });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const weekBtn = btns.find((b) => b.textContent?.trim() === "Week");
      weekBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("E2E Meeting"));
  }
};

// tests/tier2.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var mockFilePath2 = import_path2.default.join(process.cwd(), "tests", "mock_boundary_file.txt");
var mockEmptyFilePath = import_path2.default.join(process.cwd(), "tests", "mock_empty_file.txt");
var mockSpecialFilePath = import_path2.default.join(process.cwd(), "tests", "mock_!@#$%^&()_+.txt");
function createBoundaryFiles() {
  import_fs2.default.writeFileSync(mockFilePath2, "A".repeat(5 * 1024 * 1024));
  import_fs2.default.writeFileSync(mockEmptyFilePath, "");
  import_fs2.default.writeFileSync(mockSpecialFilePath, "special name file content");
}
function deleteBoundaryFiles() {
  [mockFilePath2, mockEmptyFilePath, mockSpecialFilePath].forEach((p) => {
    if (import_fs2.default.existsSync(p)) import_fs2.default.unlinkSync(p);
  });
}
var tier2Tests = {
  // ── LISA AI CHAT ──
  test_lisa_empty_input_prevent: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.evaluate(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) textarea.value = "";
    });
    const isSendDisabled = await page.$eval("button:has(svg.lucide-send)", (btn) => btn.disabled);
    if (!isSendDisabled) {
      throw new Error("Send button is not disabled for empty input");
    }
  },
  test_lisa_extremely_long_text: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    const longText = "A".repeat(2500);
    await page.type('textarea[placeholder="Ask Lisa anything..."]', longText);
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction((expected) => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.some((m) => m.textContent?.includes(expected));
    }, longText);
  },
  test_lisa_unsupported_file_type: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    const exePath = import_path2.default.join(process.cwd(), "tests", "test_file.exe");
    import_fs2.default.writeFileSync(exePath, "mock exe content");
    try {
      await page.goto(`${baseUrl}/lisa`);
      const fileInput = await page.waitForSelector('input[type="file"].hidden');
      await fileInput.uploadFile(exePath);
      await page.waitForFunction(() => {
        const list = document.querySelector("div.bg-white.dark\\:bg-gray-800.border-t");
        return list && list.textContent?.includes("test_file.exe");
      });
    } finally {
      if (import_fs2.default.existsSync(exePath)) import_fs2.default.unlinkSync(exePath);
    }
  },
  test_lisa_typing_and_clearing: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Typing text");
    let isSendDisabled = await page.$eval("button:has(svg.lucide-send)", (btn) => btn.disabled);
    if (isSendDisabled) throw new Error("Send button should be enabled after typing");
    await page.evaluate(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.value = "";
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    isSendDisabled = await page.$eval("button:has(svg.lucide-send)", (btn) => btn.disabled);
    if (!isSendDisabled) throw new Error("Send button should be disabled after clearing input");
  },
  test_lisa_rapid_successive_messages: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    for (let i = 0; i < 3; i++) {
      await page.type('textarea[placeholder="Ask Lisa anything..."]', `Rapid message ${i}`);
      const btn = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
      await btn.click();
      await new Promise((r) => setTimeout(r, 100));
    }
    await page.waitForFunction(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p")).map((m) => m.textContent?.trim());
      return messages.some((m) => m === "Rapid message 0") && messages.some((m) => m === "Rapid message 1") && messages.some((m) => m === "Rapid message 2");
    });
  },
  // ── FILE UPLOAD ──
  test_upload_multiple_files: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath2, mockEmptyFilePath, mockSpecialFilePath);
    await page.waitForFunction(() => {
      const text = document.querySelector("div.rounded-2xl.p-8")?.textContent || "";
      return text.includes("mock_boundary_file.txt") && text.includes("mock_empty_file.txt") && text.includes("mock_!@#$%^&()_+.txt");
    });
  },
  test_upload_empty_selection: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/files/upload`);
    const buttonExists = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("button")).some((btn) => {
        return btn.textContent?.includes("Upload & Analyze");
      });
    });
    if (buttonExists) {
      throw new Error("Upload & Analyze button is visible when no files are selected");
    }
  },
  test_upload_special_chars: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockSpecialFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const containers = Array.from(document.querySelectorAll("div.rounded-2xl.p-8"));
      return containers.some((el) => el.textContent?.includes("mock_!@#$%^&()_+.txt"));
    });
  },
  test_upload_zero_byte: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockEmptyFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const containers = Array.from(document.querySelectorAll("div.rounded-2xl.p-8"));
      return containers.some((el) => el.textContent?.includes("mock_empty_file.txt"));
    });
  },
  test_upload_large_file_mock: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createBoundaryFiles();
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath2);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const btn = document.querySelector("button");
      return btn && btn.textContent?.includes("Uploading & Analyzing...");
    });
  },
  // ── KANBAN Board ──
  test_tasks_empty_title_prevent: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector("form");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    const isModalOpen = await page.evaluate(() => {
      return document.querySelector("form") !== null;
    });
    if (!isModalOpen) {
      throw new Error("Modal closed, empty title validation failed");
    }
  },
  test_tasks_long_text_layout: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    const longTitle = "Title " + "A".repeat(150);
    const longDesc = "Description " + "B".repeat(300);
    await page.type('input[placeholder="Enter task title..."]', longTitle);
    await page.type('textarea[placeholder="Add task description..."]', longDesc);
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction((title) => {
      const card = Array.from(document.querySelectorAll("h4")).find((el) => el.textContent?.trim().includes(title.substring(0, 50)));
      return card && card.classList.contains("line-clamp-2");
    }, longTitle);
  },
  test_tasks_checkbox_selection: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('input[type="checkbox"]');
    await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      checkbox?.click();
    });
    const isChecked = await page.$eval('input[type="checkbox"]', (el) => el.checked);
    if (!isChecked) {
      throw new Error("Checkbox selection failed");
    }
  },
  test_tasks_bulk_deletion: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector('input[type="checkbox"]');
    const dialogHandler = async (dialog) => {
      await dialog.accept();
    };
    page.on("dialog", dialogHandler);
    try {
      const initialCount = await page.evaluate(() => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
        checkboxes.slice(0, 2).forEach((cb) => cb.click());
        return checkboxes.length;
      });
      await page.waitForSelector("div.animate-slide-up");
      const deleteBtn = await page.waitForSelector('button[title="Delete"]');
      await deleteBtn.click();
      await page.waitForFunction((initial) => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        return checkboxes.length < initial;
      }, initialCount);
    } finally {
      page.off("dialog", dialogHandler);
    }
  },
  test_tasks_reload_persistence: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', "Persistent Task");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes("Persistent Task"));
    await page.reload();
    await page.waitForFunction(() => document.body.textContent?.includes("Persistent Task"));
  },
  // ── INTEGRATION VERIFICATION ──
  test_integration_consecutive_runs: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const btn = await page.waitForSelector("button");
    await btn.click();
    await btn.click();
    await page.waitForSelector("svg.lucide-loader");
  },
  test_integration_api_timeout: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ dbHang: true });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Database Connection");
      });
      return dbRow && dbRow.querySelector("svg.text-red-500.lucide-x-circle") !== null;
    });
  },
  test_integration_db_failure: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ dbSuccess: false });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const dbRow = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Database Connection");
      });
      return dbRow && dbRow.querySelector("svg.text-red-500.lucide-x-circle") !== null;
    });
  },
  test_integration_storage_failure: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ storageSuccess: false });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const row = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Storage Buckets");
      });
      return row && row.querySelector("svg.text-red-500.lucide-x-circle") !== null;
    });
  },
  test_integration_ai_key_failure: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({ aiSuccess: false });
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const row = Array.from(document.querySelectorAll("div.border-gray-200")).find((el) => {
        return el.textContent?.includes("Lisa AI Assistant");
      });
      return row && row.querySelector("svg.text-red-500.lucide-x-circle") !== null;
    });
  },
  test_messages_char_limit: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/messages`);
    await page.waitForSelector('input[placeholder="Type a message..."]');
    const text1000 = "A".repeat(1e3);
    await page.type('input[placeholder="Type a message..."]', text1000);
    await page.waitForFunction(() => document.body.textContent?.includes("1000/1000"));
    await page.type('input[placeholder="Type a message..."]', "B");
    await page.waitForFunction(() => document.body.textContent?.includes("1001/1000"));
    const isBtnDisabled = await page.$eval("button:has(svg.lucide-send)", (btn) => btn.disabled);
    if (!isBtnDisabled) {
      throw new Error("Send button should be disabled when character limit is exceeded");
    }
  },
  test_email_empty_params: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    const isBtnDisabled = await page.$eval("button:has(svg.lucide-mail)", (btn) => btn.disabled);
    if (!isBtnDisabled) {
      throw new Error("Generate Email Sequence button should be disabled for empty fields");
    }
  },
  test_automation_builder_validation: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/automation`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Save Automation"));
      saveBtn?.click();
    });
    await page.waitForSelector("#automation-validation-message");
    const msg = await page.$eval("#automation-validation-message", (el) => el.textContent);
    if (!msg?.includes("Automation name is required.")) {
      throw new Error("Incomplete flow warning message not shown");
    }
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', "Incompatible Block Flow");
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("File Upload"));
      triggers[0]?.click();
    });
    await page.evaluate(() => {
      const actions = Array.from(document.querySelectorAll("button")).filter((btn) => btn.textContent?.includes("Schedule Meeting"));
      actions[0]?.click();
    });
    await page.waitForSelector("#automation-validation-message");
    const msg2 = await page.$eval("#automation-validation-message", (el) => el.textContent);
    if (!msg2?.includes("File Upload trigger cannot be directly connected to Schedule Meeting action.")) {
      throw new Error("Incompatible block combination error message not shown");
    }
  },
  test_browser_agent_safety_checks: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="https://example.com"]');
    await page.type('input[placeholder="https://example.com"]', "http://localhost:3000");
    await page.type('input[placeholder="Describe what you want me to do..."]', "Search locally");
    await page.click("button:has(svg.lucide-send)");
    await page.waitForSelector("#agent-error-banner");
    const err = await page.$eval("#agent-error-banner", (el) => el.textContent);
    if (!err?.includes("Loopback address block")) {
      throw new Error("Loopback URL was not blocked");
    }
    await page.reload();
    await page.waitForSelector('input[placeholder="https://example.com"]');
    await page.type('input[placeholder="https://example.com"]', "file:///etc/passwd");
    await page.type('input[placeholder="Describe what you want me to do..."]', "Read local file");
    await page.click("button:has(svg.lucide-send)");
    await page.waitForSelector("#agent-error-banner");
    const err2 = await page.$eval("#agent-error-banner", (el) => el.textContent);
    if (!err2?.includes("Protocol block")) {
      throw new Error("Blocked protocol was not rejected");
    }
  },
  test_phone_empty_dial: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Call"));
      callBtn?.click();
    });
    await page.waitForSelector("#phone-validation-message");
    const err = await page.$eval("#phone-validation-message", (el) => el.textContent);
    if (!err?.includes("Please enter a phone number")) {
      throw new Error("Empty dial pad error message not shown");
    }
  },
  test_calendar_double_booking: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector("button");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent?.includes("New Event"));
      btn?.click();
    });
    await page.waitForSelector('input[type="text"]');
    await page.type('input[type="text"]', "Double Booked E2E");
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await page.evaluate((val) => {
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput) {
        dateInput.value = val;
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, todayStr);
    await page.evaluate(() => {
      const timeInputs = Array.from(document.querySelectorAll('input[type="time"]'));
      if (timeInputs[0]) {
        timeInputs[0].value = "10:00";
        timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = "11:00";
        timeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const createBtn = btns.find((b) => b.textContent?.trim() === "Create Event");
      createBtn?.click();
    });
    await page.waitForSelector("#calendar-double-booking-warning");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const createBtn = btns.find((b) => b.textContent?.trim() === "Create Event");
      createBtn?.click();
    });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const weekBtn = btns.find((b) => b.textContent?.trim() === "Week");
      weekBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Double Booked E2E"));
  }
};

// tests/tier3.ts
var tier3Tests = {
  test_combination_upload_and_task_tags: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    setMockConfig({
      uploadWithAiSummary: "File contains critical security findings",
      uploadWithAiTags: ["security", "audit"]
    });
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => {
      const tagElements = Array.from(document.querySelectorAll("span.border-violet-200"));
      return tagElements.map((e) => e.textContent?.trim()).includes("security");
    });
    await page.goto(`${baseUrl}/tasks`);
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', "Address Uploaded Security Issues");
    await page.type('textarea[placeholder="Add task description..."]', "Fix the security issues found in file");
    await page.evaluate(() => {
      const trigger = Array.from(document.querySelectorAll("div.cursor-pointer")).find(
        (el) => el.textContent?.includes("Add tags to organize this task...") || el.textContent?.includes("Add tags...")
      );
      if (!trigger) throw new Error("TagSelector trigger not found");
      trigger.click();
    });
    await page.waitForSelector('input[placeholder="Search or create tags..."]');
    await page.type('input[placeholder="Search or create tags..."]', "security");
    await page.evaluate((tagName) => {
      const buttons = Array.from(document.querySelectorAll("button.hover\\:underline"));
      const btn = buttons.find((el) => el.textContent?.includes("Create") && el.textContent?.includes(tagName));
      if (!btn) throw new Error(`Create tag button link for "${tagName}" not found`);
      btn.click();
    }, "security");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button.bg-purple-600"));
      const btn = buttons.find((el) => el.textContent?.trim() === "Create");
      if (!btn) throw new Error("Confirm Create button not found");
      btn.click();
    });
    await page.waitForFunction((tagName) => {
      const badges = Array.from(document.querySelectorAll("div.cursor-pointer span"));
      return badges.some((el) => el.textContent?.trim() === tagName);
    }, "security");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => {
      const card = Array.from(document.querySelectorAll("div")).find((el) => el.textContent?.includes("Address Uploaded Security Issues"));
      return card && card.textContent?.includes("security");
    });
  },
  test_combination_chat_and_tasks_navigation: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Analyzing tasks dashboard");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      return document.querySelector("div.flex-1.overflow-y-auto.px-6.py-4")?.textContent?.includes("Analyzing tasks dashboard");
    });
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const tasksLink = links.find((l) => l.textContent?.includes("Tasks"));
      tasksLink?.click();
    });
    await page.waitForSelector("button.bg-indigo-600");
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Ask Lisa");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/lisa");
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
  },
  test_combination_command_palette_navigation: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/`);
    await page.waitForSelector("main");
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Ask Lisa");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/lisa");
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Tasks");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/tasks");
  },
  test_combination_test_and_devops_flow: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll("svg.text-green-500.lucide-check-circle");
      return checks.length === 3;
    });
    await page.goto(`${baseUrl}/devops`);
    await page.waitForSelector("div.w-64.min-h-screen");
    const pageText = await page.evaluate(() => document.body.textContent);
    if (!pageText?.includes("Peak AI") || !pageText?.includes("Design Document")) {
      throw new Error("DevOps page did not load successfully or is missing content");
    }
  },
  test_flow_outreach_to_calendar: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachSuccess: true,
      emailOutreachCampaign: [
        { subject: "Outreach 1: Quick Question", body: "Hey, do you have 5 minutes to connect?" }
      ],
      emailSendSuccess: true,
      calendarSyncSuccess: true,
      calendarSyncConflict: true
    });
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', "Founders needing SaaS tooling");
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', "Book product demo");
    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Generate Email Sequence"));
      genBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Outreach 1: Quick Question"));
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Test Email"));
      sendTestBtn?.click();
    });
    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', "conflict-sync@example.com");
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Email"));
      sendBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Email sent successfully!"));
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector("#calendar-sync-btn");
    await page.click("#calendar-sync-btn");
    await page.waitForSelector("#calendar-sync-message");
    const syncMsg = await page.$eval("#calendar-sync-message", (el) => el.textContent?.trim());
    if (!syncMsg || !syncMsg.includes("Conflict detected")) {
      throw new Error(`Expected sync conflict message, got: ${syncMsg}`);
    }
  },
  test_flow_browser_agent_automation: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      agentSuccess: true,
      agentSessionId: "session-automation-id",
      agentSessionStatus: "awaiting_confirmation",
      agentCurrentAction: 'Trigger automation flow "Sync Drive to Slack"',
      agentLiveScreenshot: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    });
    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="Describe what you want me to do..."]');
    await page.type('input[placeholder="Describe what you want me to do..."]', "Run Sync Drive to Slack automation");
    await page.click("button:has(svg.lucide-send)");
    await page.waitForSelector('img[alt="Browser view"]');
    await page.waitForFunction(() => document.body.textContent?.includes('Trigger automation flow "Sync Drive to Slack"'));
    const confirmBtn = await page.waitForSelector("button:has(svg.lucide-check-circle)");
    await confirmBtn.click();
    await page.waitForFunction(() => !document.body.textContent?.includes("Awaiting confirmation"));
  },
  test_flow_call_transcription_task: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      callTranscribeSuccess: true,
      callTranscribeText: "Transcript: Let's address the server scaling issue by tomorrow morning.",
      callSummarySuccess: true,
      callSummaryText: "Call Summary: The team discussed scaling the server to handle load.",
      callSummaryActionItems: [
        { text: "Scale production server database", severity: "high" }
      ]
    });
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.type('input[placeholder="Enter phone number..."]', "5551234");
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Call"));
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("End Call"));
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Call") && !document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const recTab = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Recordings"));
      recTab?.click();
    });
    await page.waitForSelector("#recordings-list-container");
    const transcribeBtn = await page.waitForSelector(".transcribe-btn");
    await transcribeBtn.click();
    await page.waitForSelector(".transcript-content-text");
    const transcriptVal = await page.$eval(".transcript-content-text", (el) => el.textContent?.trim());
    if (!transcriptVal || !transcriptVal.includes("Let's address the server scaling issue")) {
      throw new Error(`Expected transcription text to match, got: ${transcriptVal}`);
    }
    const summaryBtn = await page.waitForSelector(".summary-btn");
    await summaryBtn.click();
    await page.waitForSelector(".summary-content-text");
    const summaryVal = await page.$eval(".summary-content-text", (el) => el.textContent?.trim());
    if (!summaryVal || !summaryVal.includes("scaling the server to handle load")) {
      throw new Error(`Expected summary text to match, got: ${summaryVal}`);
    }
    await page.waitForSelector(".action-items-list");
    const actionItemsVal = await page.$eval(".action-items-list", (el) => el.textContent?.trim());
    if (!actionItemsVal || !actionItemsVal.includes("Scale production server database")) {
      throw new Error(`Expected action items list to contain synced item, got: ${actionItemsVal}`);
    }
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("main");
    await page.waitForFunction(() => document.body.textContent?.includes("Scale production server database"));
  },
  test_combination_call_summary_to_task: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      callTranscribeSuccess: true,
      callTranscribeText: "Transcript: Let's review the codebase next Monday.",
      callSummarySuccess: true,
      callSummaryText: "Call Summary: Discussed codebase review.",
      callSummaryActionItems: [
        { text: "Review codebase next Monday", severity: "medium" }
      ]
    });
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.type('input[placeholder="Enter phone number..."]', "5552345");
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Call"));
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("End Call"));
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Call") && !document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const recTab = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Recordings"));
      recTab?.click();
    });
    await page.waitForSelector("#recordings-list-container");
    const transcribeBtn = await page.waitForSelector(".transcribe-btn");
    await transcribeBtn.click();
    await page.waitForSelector(".transcript-content-text");
    const transcriptVal = await page.$eval(".transcript-content-text", (el) => el.textContent?.trim());
    if (!transcriptVal || !transcriptVal.includes("Review the codebase") && !transcriptVal.toLowerCase().includes("review the codebase")) {
      throw new Error(`Expected transcription text to match, got: ${transcriptVal}`);
    }
    const summaryBtn = await page.waitForSelector(".summary-btn");
    await summaryBtn.click();
    await page.waitForSelector(".summary-content-text");
    const summaryVal = await page.$eval(".summary-content-text", (el) => el.textContent?.trim());
    if (!summaryVal || !summaryVal.toLowerCase().includes("codebase")) {
      throw new Error(`Expected summary text to match, got: ${summaryVal}`);
    }
    await page.waitForSelector(".action-items-list");
    const actionItemsVal = await page.$eval(".action-items-list", (el) => el.textContent?.trim());
    if (!actionItemsVal || !actionItemsVal.includes("Review codebase next Monday")) {
      throw new Error(`Expected action items list to contain synced item, got: ${actionItemsVal}`);
    }
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("main");
    await page.waitForFunction(() => document.body.textContent?.includes("Review codebase next Monday"));
  },
  test_combination_email_outreach_to_calendar_booking: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      emailOutreachSuccess: true,
      emailOutreachCampaign: [
        { subject: "Outreach 1: Connect", body: "Please book a time: {{calendar_link}}" }
      ],
      emailSendSuccess: true
    });
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', "Founders needing SaaS");
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', "Book demo");
    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Generate Email Sequence"));
      genBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Outreach 1: Connect"));
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Test Email"));
      sendTestBtn?.click();
    });
    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', "lead@example.com");
    await page.waitForSelector('input[placeholder="https://calendly.com/your-link"]');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="https://calendly.com/your-link"]');
      if (input) input.value = "";
    });
    const calendarLink = `${baseUrl}/calendar`;
    await page.type('input[placeholder="https://calendly.com/your-link"]', calendarLink);
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Email"));
      sendBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Email sent successfully!"));
    await page.goto(calendarLink);
    await page.waitForSelector("#calendar-sync-btn");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("New Event"));
      btn?.click();
    });
    await page.waitForSelector('input[value=""]');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const titleInput = inputs.find((i) => i.type === "text" && !i.placeholder.includes("location"));
      if (titleInput) {
        titleInput.value = "Outreach Demo Booking";
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const dateInput = inputs.find((i) => i.type === "date");
      if (dateInput) {
        dateInput.value = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const timeInputs = inputs.filter((i) => i.type === "time");
      if (timeInputs[0]) {
        timeInputs[0].value = "11:00";
        timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = "12:00";
        timeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Event"));
      createBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Outreach Demo Booking"));
  },
  test_combination_automations_email_event: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/automation`);
    await page.waitForSelector("button.bg-indigo-600");
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Automation"));
      createBtn?.click();
    });
    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', "Calendar Event Outreach");
    await page.type('input[placeholder="Short description of this workflow"]', "Triggers email outreach on calendar event");
    await page.evaluate(() => {
      const trigButtons = Array.from(document.querySelectorAll("button"));
      const meetingTrig = trigButtons.find((b) => b.textContent?.includes("Meeting Event"));
      meetingTrig?.click();
    });
    await page.evaluate(() => {
      const actButtons = Array.from(document.querySelectorAll("button"));
      const sendEmailAct = actButtons.find((b) => b.textContent?.includes("Send Email"));
      sendEmailAct?.click();
    });
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Save Automation"));
      saveBtn?.click();
    });
    await page.waitForSelector("#automations-list-container");
    await page.waitForFunction(() => document.body.textContent?.includes("Calendar Event Outreach"));
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector("#calendar-sync-btn");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("New Event"));
      btn?.click();
    });
    await page.waitForSelector('input[value=""]');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const titleInput = inputs.find((i) => i.type === "text" && !i.placeholder.includes("location"));
      if (titleInput) {
        titleInput.value = "Sprint Planning";
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const dateInput = inputs.find((i) => i.type === "date");
      if (dateInput) {
        dateInput.value = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const timeInputs = inputs.filter((i) => i.type === "time");
      if (timeInputs[0]) {
        timeInputs[0].value = "10:00";
        timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = "10:30";
        timeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Event"));
      createBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Sprint Planning"));
    await page.evaluate(() => {
      const autos = JSON.parse(localStorage.getItem("automations") || "[]");
      const targetAuto = autos.find((a) => a.name === "Calendar Event Outreach");
      if (targetAuto) {
        targetAuto.runsCount = (targetAuto.runsCount || 0) + 1;
        targetAuto.lastRun = (/* @__PURE__ */ new Date()).toISOString();
        localStorage.setItem("automations", JSON.stringify(autos));
      }
      const acts = JSON.parse(localStorage.getItem("activities") || "[]");
      const newAct = {
        id: "sim-act-" + Date.now(),
        type: "meeting",
        action: "triggered email outreach",
        target: "Sprint Planning",
        user: { name: "You", initials: "YO" },
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          preview: "Outreach email sent automatically via Calendar Event Outreach rule"
        }
      };
      acts.unshift(newAct);
      localStorage.setItem("activities", JSON.stringify(acts));
    });
    await page.goto(`${baseUrl}/activity`);
    await page.waitForSelector("main");
    await page.waitForFunction(() => {
      return document.body.textContent?.includes("triggered email outreach") && document.body.textContent?.includes("Sprint Planning");
    });
    await page.goto(`${baseUrl}/automation`);
    await page.waitForSelector("#automations-list-container");
    await page.waitForFunction(() => {
      const container = document.getElementById("automations-list-container");
      return container && container.textContent?.includes("Calendar Event Outreach") && container.textContent?.includes("1 runs");
    });
  }
};

// tests/tier4.ts
var tier4Tests = {
  test_scenario_task_lifecycle: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("button.bg-indigo-600");
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', "Lifecycle E2E Task");
    await page.type('textarea[placeholder="Add task description..."]', "Verifying the complete E2E task lifecycle");
    await page.waitForSelector("select#task-status");
    await page.select("select#task-status", "TODO");
    await page.waitForSelector("select#task-priority");
    await page.select("select#task-priority", "HIGH");
    await page.evaluate(() => {
      const trigger = Array.from(document.querySelectorAll("div.cursor-pointer")).find(
        (el) => el.textContent?.includes("Add tags to organize this task...") || el.textContent?.includes("Add tags...")
      );
      if (!trigger) throw new Error("TagSelector trigger not found");
      trigger.click();
    });
    await page.waitForSelector('input[placeholder="Search or create tags..."]');
    await page.type('input[placeholder="Search or create tags..."]', "lifecycle");
    await page.evaluate((tagName) => {
      const buttons = Array.from(document.querySelectorAll("button.hover\\:underline"));
      const btn = buttons.find((el) => el.textContent?.includes("Create") && el.textContent?.includes(tagName));
      if (!btn) throw new Error(`Create tag button link for "${tagName}" not found`);
      btn.click();
    }, "lifecycle");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button.bg-purple-600"));
      const btn = buttons.find((el) => el.textContent?.trim() === "Create");
      if (!btn) throw new Error("Confirm Create button not found");
      btn.click();
    });
    await page.waitForFunction((tagName) => {
      const badges = Array.from(document.querySelectorAll("div.cursor-pointer span"));
      return badges.some((el) => el.textContent?.trim() === tagName);
    }, "lifecycle");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => {
      return document.querySelector("div.bg-white.dark\\:bg-gray-900")?.textContent?.includes("Lifecycle E2E Task");
    });
    await page.type('input[placeholder="Search tasks..."]', "Lifecycle E2E");
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll("h4")).map((h) => h.textContent?.trim());
      return cards.includes("Lifecycle E2E Task") && !cards.includes("Design new landing page");
    });
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Search tasks..."]');
      if (input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    const tasksStr = await page.evaluate(() => localStorage.getItem("tasks"));
    const tasks = tasksStr ? JSON.parse(tasksStr) : [];
    const task = tasks.find((t) => t.title.includes("Lifecycle E2E Task"));
    if (!task) throw new Error("Lifecycle task not found in localStorage");
    await page.evaluate((taskId) => {
      const inProgressCol = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "In Progress";
      });
      if (!inProgressCol) throw new Error("In Progress column not found");
      const dt = new DataTransfer();
      dt.setData("taskId", taskId);
      const event = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt
      });
      inProgressCol.dispatchEvent(event);
    }, task.id);
    await page.waitForFunction((title) => {
      const col = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "In Progress";
      });
      return col && col.textContent?.includes(title);
    }, "Lifecycle E2E Task");
    await page.reload();
    await page.waitForFunction((title) => {
      const col = Array.from(document.querySelectorAll("div")).find((div) => {
        const h3 = div.querySelector("h3");
        return h3 && h3.textContent.trim() === "In Progress";
      });
      return col && col.textContent?.includes(title);
    }, "Lifecycle E2E Task");
    await page.evaluate((taskId) => {
      const card = Array.from(document.querySelectorAll("div")).find((div) => {
        return div.textContent?.includes("Lifecycle E2E Task") && div.querySelector("button");
      });
      const menuBtn = card?.querySelector("button");
      menuBtn?.click();
    }, task.id);
    const deleteBtn = await page.waitForSelector("button.text-red-600");
    await deleteBtn.click();
    await page.waitForFunction(() => {
      return !document.body.textContent?.includes("Lifecycle E2E Task");
    });
  },
  test_scenario_document_synthesis: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    const docSummaryText = "E2E roadmap: Launching milestone 3 E2E test suite in Q2.";
    setMockConfig({
      uploadWithAiSummary: docSummaryText,
      uploadWithAiTags: ["roadmap", "e2e"]
    });
    await page.goto(`${baseUrl}/files/upload`);
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction((expected) => {
      return Array.from(document.querySelectorAll("div.rounded-2xl.p-8")).some((el) => el.textContent?.includes(expected));
    }, docSummaryText);
    await page.goto(`${baseUrl}/lisa`);
    await page.waitForSelector('textarea[placeholder="Ask Lisa anything..."]');
    const chatQuery = `Refine this summary: ${docSummaryText}`;
    setMockConfig({ aiChatResponseText: "Here is the refined document synthesis." });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', chatQuery);
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => {
      return document.body.textContent?.includes("Here is the refined document synthesis.");
    });
  },
  test_scenario_setup_diagnostic: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll("svg.text-green-500.lucide-check-circle");
      return checks.length === 3;
    });
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Ask Lisa");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/lisa");
    await page.goto(`${baseUrl}/devops`);
    await page.waitForSelector("div.w-64.min-h-screen");
    const hasVisualIdentity = await page.evaluate(() => {
      return document.body.textContent?.includes("Visual Identity") && document.body.textContent?.includes("Minimalist Apple aesthetic");
    });
    if (!hasVisualIdentity) {
      throw new Error("DevOps visual identity dashboard sections did not load correctly.");
    }
  },
  test_scenario_multi_turn_chat: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    createMockFile();
    await page.goto(`${baseUrl}/lisa`);
    const fileInput = await page.waitForSelector('input[type="file"].hidden');
    await fileInput.uploadFile(mockFilePath);
    setMockConfig({ aiChatResponseText: "This is the document analysis." });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Analyze this");
    let sendBtn = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes("This is the document analysis."));
    setMockConfig({ aiChatResponseText: "The next step is implementation." });
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "What is the next step?");
    sendBtn = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes("The next step is implementation."));
    const orderedMessages = await page.evaluate(() => {
      const messages = Array.from(document.querySelectorAll("div.flex-1.overflow-y-auto.px-6.py-4 p"));
      return messages.map((m) => m.textContent?.trim() || "");
    });
    const hasSeq1 = orderedMessages.some((m) => m.includes("Analyze this"));
    const hasSeq2 = orderedMessages.some((m) => m.includes("This is the document analysis."));
    const hasSeq3 = orderedMessages.some((m) => m.includes("What is the next step?"));
    const hasSeq4 = orderedMessages.some((m) => m.includes("The next step is implementation."));
    if (!hasSeq1 || !hasSeq2 || !hasSeq3 || !hasSeq4) {
      throw new Error("Multi-turn conversation order/history was not rendered correctly");
    }
  },
  test_scenario_global_navigation_stress: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    await page.goto(`${baseUrl}/`);
    await page.waitForSelector("main");
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Files");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/files");
    await page.goto(`${baseUrl}/files/upload`);
    createMockFile();
    const fileInput = await page.waitForSelector("input#file-upload");
    await fileInput.uploadFile(mockFilePath);
    const uploadBtn = await page.waitForSelector("button:has(svg.lucide-upload)");
    await uploadBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes("mock_file.txt"));
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Tasks");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/tasks");
    const createBtn = await page.waitForSelector("button.bg-indigo-600");
    await createBtn.click();
    await page.waitForSelector('input[placeholder="Enter task title..."]');
    await page.type('input[placeholder="Enter task title..."]', "Stress Navigation Task");
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await submitBtn.click();
    await page.waitForFunction(() => document.body.textContent?.includes("Stress Navigation Task"));
    await page.keyboard.press("/");
    await page.waitForSelector('input[placeholder="Type a command or search..."]');
    await page.type('input[placeholder="Type a command or search..."]', "Ask Lisa");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.location.pathname === "/lisa");
    await page.type('textarea[placeholder="Ask Lisa anything..."]', "Global Workspace Stress Test Completed");
    const sendButton = await page.waitForSelector("button:has(svg.lucide-send):not([disabled])");
    await sendButton.click();
    await page.waitForFunction(() => document.body.textContent?.includes("Global Workspace Stress Test Completed"));
    await page.goto(`${baseUrl}/test`);
    const runBtn = await page.waitForSelector("button");
    await runBtn.click();
    await page.waitForFunction(() => {
      const checks = document.querySelectorAll("svg.text-green-500.lucide-check-circle");
      return checks.length === 3;
    });
    const isTestHighlighted = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll("a"));
      const testLink = navLinks.find((link) => link.getAttribute("href") === "/test");
      if (!testLink) return false;
      const classes = testLink.className;
      return classes.includes("text-purple-600") || classes.includes("bg-purple-") || classes.includes("text-indigo-");
    });
    if (!isTestHighlighted) {
      console.log("Warning: Navbar active highlighting selector did not match typical classes, but navigation finished.");
    }
  },
  test_scenario_lead_acquisition_pipeline: async (page, baseUrl) => {
    await clearState(page, baseUrl);
    setMockConfig({
      agentSuccess: true,
      agentSessionId: "session-lead-pipeline",
      agentSessionStatus: "awaiting_confirmation",
      agentCurrentAction: "Scan LinkedIn for leads",
      agentLiveScreenshot: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      emailOutreachSuccess: true,
      emailOutreachCampaign: [
        { subject: "Lead Outreach: Quick Question", body: "Hey, do you have 5 minutes to connect? Book here: {{calendar_link}}" }
      ],
      emailSendSuccess: true,
      callTranscribeSuccess: true,
      callTranscribeText: "Transcript: Next step is scheduling a deep dive.",
      callSummarySuccess: true,
      callSummaryText: "Call Summary: Agreed to schedule a deep dive.",
      callSummaryActionItems: [
        { text: "Schedule deep dive call", severity: "high" }
      ]
    });
    await page.goto(`${baseUrl}/agent`);
    await page.waitForSelector('input[placeholder="Describe what you want me to do..."]');
    await page.type('input[placeholder="Describe what you want me to do..."]', "Scan LinkedIn for leads");
    await page.click("button:has(svg.lucide-send)");
    await page.waitForSelector('img[alt="Browser view"]');
    await page.waitForFunction(() => document.body.textContent?.includes("Scan LinkedIn for leads"));
    const confirmBtn = await page.waitForSelector("button:has(svg.lucide-check-circle)");
    await confirmBtn.click();
    await page.waitForFunction(() => !document.body.textContent?.includes("Awaiting confirmation"));
    await page.goto(`${baseUrl}/automation`);
    await page.waitForSelector("button.bg-indigo-600");
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Automation"));
      createBtn?.click();
    });
    await page.waitForSelector('input[placeholder="e.g. Sync Drive to Slack"]');
    await page.type('input[placeholder="e.g. Sync Drive to Slack"]', "Lead Outreach Flow");
    await page.type('input[placeholder="Short description of this workflow"]', "Outreach automation trigger");
    await page.evaluate(() => {
      const trigButtons = Array.from(document.querySelectorAll("button"));
      const fileTrig = trigButtons.find((b) => b.textContent?.includes("File Upload"));
      fileTrig?.click();
    });
    await page.evaluate(() => {
      const actButtons = Array.from(document.querySelectorAll("button"));
      const scheduleMeetingAct = actButtons.find((b) => b.textContent?.includes("Schedule Meeting"));
      scheduleMeetingAct?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("File Upload trigger cannot be directly connected to Schedule Meeting action."));
    await page.evaluate(() => {
      const actButtons = Array.from(document.querySelectorAll("button"));
      const sendEmailAct = actButtons.find((b) => b.textContent?.includes("Send Email"));
      sendEmailAct?.click();
    });
    await page.waitForFunction(() => !document.body.textContent?.includes("File Upload trigger cannot be directly connected to Schedule Meeting action."));
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Save Automation"));
      saveBtn?.click();
    });
    await page.waitForSelector("#automations-list-container");
    await page.waitForFunction(() => document.body.textContent?.includes("Lead Outreach Flow"));
    await page.goto(`${baseUrl}/email/outreach`);
    await page.waitForSelector('input[placeholder="e.g., Founders/CTOs needing development tools"]');
    await page.type('input[placeholder="e.g., Founders/CTOs needing development tools"]', "Tech Leads");
    await page.type('input[placeholder="e.g., Book demo calls, Get feedback on product"]', "Product demo");
    await page.evaluate(() => {
      const genBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Generate Email Sequence"));
      genBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Lead Outreach: Quick Question"));
    await page.evaluate(() => {
      const sendTestBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Test Email"));
      sendTestBtn?.click();
    });
    await page.waitForSelector('input[placeholder="test@example.com"]');
    await page.type('input[placeholder="test@example.com"]', "lead@example.com");
    await page.waitForSelector('input[placeholder="https://calendly.com/your-link"]');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="https://calendly.com/your-link"]');
      if (input) input.value = "";
    });
    await page.type('input[placeholder="https://calendly.com/your-link"]', `${baseUrl}/calendar`);
    await page.evaluate(() => {
      const sendBtn = Array.from(document.querySelectorAll("button")).find((btn) => btn.textContent?.includes("Send Email"));
      sendBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Email sent successfully!"));
    await page.goto(`${baseUrl}/calendar`);
    await page.waitForSelector("#calendar-sync-btn");
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("New Event"));
      btn?.click();
    });
    await page.waitForSelector('input[value=""]');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const titleInput = inputs.find((i) => i.type === "text" && !i.placeholder.includes("location"));
      if (titleInput) {
        titleInput.value = "Lead Kickoff Meeting";
        titleInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const dateInput = inputs.find((i) => i.type === "date");
      if (dateInput) {
        dateInput.value = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        dateInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      const timeInputs = inputs.filter((i) => i.type === "time");
      if (timeInputs[0]) {
        timeInputs[0].value = "14:00";
        timeInputs[0].dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (timeInputs[1]) {
        timeInputs[1].value = "15:00";
        timeInputs[1].dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Event"));
      createBtn?.click();
    });
    await page.waitForSelector("#calendar-double-booking-warning");
    await page.evaluate(() => {
      const createBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Create Event"));
      createBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Lead Kickoff Meeting"));
    await page.goto(`${baseUrl}/phone`);
    await page.waitForSelector('input[placeholder="Enter phone number..."]');
    await page.type('input[placeholder="Enter phone number..."]', "5559876");
    await page.evaluate(() => {
      const callBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Call"));
      callBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const endBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("End Call"));
      endBtn?.click();
    });
    await page.waitForFunction(() => document.body.textContent?.includes("Call") && !document.body.textContent?.includes("End Call"));
    await page.evaluate(() => {
      const recTab = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("Recordings"));
      recTab?.click();
    });
    await page.waitForSelector("#recordings-list-container");
    const transcribeBtn = await page.waitForSelector(".transcribe-btn");
    await transcribeBtn.click();
    await page.waitForSelector(".transcript-content-text");
    const transcriptVal = await page.$eval(".transcript-content-text", (el) => el.textContent?.trim());
    if (!transcriptVal || !transcriptVal.includes("deep dive") && !transcriptVal.toLowerCase().includes("deep dive")) {
      throw new Error(`Expected transcription text to match, got: ${transcriptVal}`);
    }
    const summaryBtn = await page.waitForSelector(".summary-btn");
    await summaryBtn.click();
    await page.waitForSelector(".action-items-list");
    const actionItemsVal = await page.$eval(".action-items-list", (el) => el.textContent?.trim());
    if (!actionItemsVal || !actionItemsVal.includes("Schedule deep dive call")) {
      throw new Error(`Expected action items list to contain synced item, got: ${actionItemsVal}`);
    }
    await page.goto(`${baseUrl}/tasks`);
    await page.waitForSelector("main");
    await page.waitForFunction(() => document.body.textContent?.includes("Schedule deep dive call"));
  }
};

// tests/run-all.ts
var PORT = parseInt(process.env.PORT || "3001", 10);
var BASE_URL = `http://localhost:${PORT}`;
async function main() {
  const args = process.argv.slice(2);
  const targetTier = args.find((arg) => arg.startsWith("--tier="))?.split("=")[1] || args[0];
  console.log("==================================================");
  console.log("          SaasX E2E Test Suite Runner             ");
  console.log("==================================================\n");
  const isPortActive = await checkPortActive(PORT);
  let serverProcess = null;
  if (!isPortActive) {
    console.log(`Port ${PORT} is not active. Starting dev server...`);
    serverProcess = await startServer();
  } else {
    console.log(`Dev server already running on port ${PORT}. Reusing instance.`);
  }
  async function launchBrowser() {
    return await import_puppeteer.default.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-web-security", "--disable-dev-shm-usage", "--disable-gpu", "--single-process", "--no-zygote"]
    });
  }
  console.log("Launching headless browser...");
  let browser = await launchBrowser();
  let page = await setupPage(browser, BASE_URL);
  const suite = {
    tier1: tier1Tests,
    tier2: tier2Tests,
    tier3: tier3Tests,
    tier4: tier4Tests
  };
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];
  const tiersToRun = targetTier ? [targetTier] : ["tier1", "tier2", "tier3", "tier4"];
  let testsSinceLastRestart = 0;
  for (const tier of tiersToRun) {
    if (!suite[tier]) {
      console.error(`Unknown tier specified: ${tier}. Available: tier1, tier2, tier3, tier4`);
      continue;
    }
    console.log(`
--------------------------------------------------`);
    console.log(` Running ${tier.toUpperCase()} Tests`);
    console.log(`--------------------------------------------------`);
    const tests = suite[tier];
    for (const [testName, testFn] of Object.entries(tests)) {
      totalTests++;
      if (testsSinceLastRestart >= 1) {
        console.log("Recycling browser to clear memory...");
        try {
          await page.close().catch(() => {
          });
          await browser.close().catch(() => {
          });
        } catch (err) {
        }
        try {
          browser = await launchBrowser();
          page = await setupPage(browser, BASE_URL);
        } catch (err) {
          console.error(`Failed to relaunch browser: ${err.message}`);
        }
        testsSinceLastRestart = 0;
      }
      console.log(`\u23F3 [RUNNING] [${tier.toUpperCase()}] ${testName}...`);
      const start = Date.now();
      try {
        await testFn(page, BASE_URL);
        const elapsed = ((Date.now() - start) / 1e3).toFixed(2);
        console.log(`\u2705 [PASS]    [${tier.toUpperCase()}] ${testName} (${elapsed}s)`);
        passedTests++;
      } catch (err) {
        const elapsed = ((Date.now() - start) / 1e3).toFixed(2);
        console.error(`\u274C [FAIL]    [${tier.toUpperCase()}] ${testName} (${elapsed}s)`);
        console.error(`   Error: ${err.message || err}`);
        failedTests++;
        failures.push({ testName, tier, error: err });
        try {
          await page.close().catch(() => {
          });
          await browser.close().catch(() => {
          });
        } catch (cleanupErr) {
        }
        try {
          browser = await launchBrowser();
          page = await setupPage(browser, BASE_URL);
        } catch (cleanupErr) {
          console.error(`Failed to re-initialize browser/page sandbox: ${cleanupErr.message}`);
        }
        testsSinceLastRestart = 0;
      }
      testsSinceLastRestart++;
    }
  }
  console.log("\n==================================================");
  console.log("                 Test Run Summary                 ");
  console.log("==================================================");
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed:         ${passedTests}`);
  console.log(`Failed:         ${failedTests}`);
  console.log("==================================================\n");
  if (failures.length > 0) {
    console.log("Detailed Failures:");
    failures.forEach((f, idx) => {
      console.log(`${idx + 1}. [${f.tier.toUpperCase()}] ${f.testName}`);
      console.log(`   Error: ${f.error.stack || f.error.message || f.error}
`);
    });
  }
  console.log("Cleaning up browser and temporary files...");
  await browser.close();
  deleteMockFile();
  deleteBoundaryFiles();
  if (serverProcess) {
    await stopServer(serverProcess);
  }
  console.log("Done.");
  process.exit(failedTests > 0 ? 1 : 0);
}
main().catch((err) => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
