import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { checkPortActive, startServer, stopServer } from './helpers';

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

async function runDirectPrismaTests() {
  console.log('\n--- Running Direct Prisma DB Tests ---');
  
  // Clean up any old test data
  await prisma.task.deleteMany({
    where: {
      title: { startsWith: 'Direct-Prisma-Test' }
    }
  });

  // Verify there's at least one workspace and project and user, or create one for test
  let user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found, creating temporary user...');
    user = await prisma.user.create({
      data: {
        id: 'direct-prisma-test-user-id',
        email: 'direct-prisma-test@example.com',
        name: 'Direct Prisma Tester'
      }
    });
  }

  let workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    console.log('No workspace found, creating temporary workspace...');
    workspace = await prisma.workspace.create({
      data: {
        id: 'direct-prisma-test-workspace-id',
        name: 'Direct Prisma Workspace',
        slug: 'direct-prisma-test-workspace',
        clerkOrgId: 'direct-prisma-test-org'
      }
    });

    // Link user to workspace
    await prisma.userWorkspace.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER'
      }
    });
  }

  let project = await prisma.project.findFirst({
    where: { workspaceId: workspace.id }
  });
  if (!project) {
    console.log('No project found, creating temporary project...');
    project = await prisma.project.create({
      data: {
        id: 'direct-prisma-test-project-id',
        name: 'Direct Prisma Project',
        workspaceId: workspace.id
      }
    });
  }

  // 1. Create a task directly in the database
  console.log('1. Creating a task directly via Prisma...');
  const task = await prisma.task.create({
    data: {
      title: 'Direct-Prisma-Test Task 1',
      description: 'This is test 1 description',
      status: 'TODO',
      priority: 'HIGH',
      position: 10,
      creatorId: user.id,
      projectId: project.id
    }
  });
  console.log(`Task created with ID: ${task.id}`);

  // 2. Read the task
  console.log('2. Reading the task back...');
  const readTask = await prisma.task.findUnique({
    where: { id: task.id }
  });
  if (!readTask) throw new Error('Failed to read task from database');
  if (readTask.title !== 'Direct-Prisma-Test Task 1') throw new Error('Task title mismatch');
  if (readTask.status !== 'TODO') throw new Error('Task status mismatch');
  if (readTask.position !== 10) throw new Error('Task position mismatch');
  console.log('Task fields verified successfully.');

  // 3. Update the task (drag-and-drop simulation: status change and reorder position)
  console.log('3. Updating task status & position (simulating drag-and-drop)...');
  const updatedTask = await prisma.task.update({
    where: { id: task.id },
    data: {
      status: 'IN_PROGRESS',
      position: 5
    }
  });
  if (updatedTask.status !== 'IN_PROGRESS') throw new Error('Failed to update status');
  if (updatedTask.position !== 5) throw new Error('Failed to update position');
  console.log('Drag-and-drop database update verified.');

  // 4. Test AI widget suggestion field
  console.log('4. Verifying AI widget suggestion field persistence...');
  const aiTask = await prisma.task.create({
    data: {
      title: 'Direct-Prisma-Test AI Task',
      description: 'Suggested from video call AI widget',
      status: 'TODO',
      priority: 'MEDIUM',
      position: 1,
      aiSuggested: true,
      creatorId: user.id,
      projectId: project.id
    }
  });
  if (aiTask.aiSuggested !== true) throw new Error('Failed to persist aiSuggested: true');
  console.log('AI suggestion flag successfully verified.');

  // 5. Delete a single task
  console.log('5. Deleting a single task...');
  await prisma.task.delete({
    where: { id: task.id }
  });
  const checkDeleted = await prisma.task.findUnique({
    where: { id: task.id }
  });
  if (checkDeleted) throw new Error('Task was not deleted');
  console.log('Single task deletion verified.');

  // 6. Bulk deletion
  console.log('6. Verifying bulk deletion...');
  const bulkTask1 = await prisma.task.create({
    data: {
      title: 'Direct-Prisma-Test Bulk 1',
      position: 100,
      creatorId: user.id,
      projectId: project.id
    }
  });
  const bulkTask2 = await prisma.task.create({
    data: {
      title: 'Direct-Prisma-Test Bulk 2',
      position: 101,
      creatorId: user.id,
      projectId: project.id
    }
  });

  const deleteResult = await prisma.task.deleteMany({
    where: {
      id: { in: [bulkTask1.id, bulkTask2.id] }
    }
  });
  if (deleteResult.count !== 2) throw new Error(`Expected to delete 2 tasks, deleted: ${deleteResult.count}`);
  console.log('Bulk deletion verified.');

  // Clean up AI task
  await prisma.task.delete({ where: { id: aiTask.id } });

  console.log('✅ Direct Prisma DB Tests Passed!');
}

async function runApiTests() {
  console.log('\n--- Running API Tasks HTTP Tests ---');

  // Let's create an authenticated user session
  // We can register a test user or use an existing one
  const testEmail = `apitest-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'API Tester';

  console.log(`1. Registering test user: ${testEmail}...`);
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, name: testName })
  });

  if (!registerRes.ok) {
    throw new Error(`Failed to register test user: ${await registerRes.text()}`);
  }
  const registerData = await registerRes.json();
  console.log('Registration success:', registerData.message);

  console.log('2. Logging in to retrieve cookies...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });

  if (!loginRes.ok) {
    throw new Error(`Failed to login: ${await loginRes.text()}`);
  }

  // Capture the Set-Cookie headers
  const setCookieHeaders = loginRes.headers.get('set-cookie');
  if (!setCookieHeaders) {
    throw new Error('No set-cookie headers returned from login');
  }
  console.log('Captured auth cookies.');

  // Helper for authenticated requests
  const authHeaders = {
    'Cookie': setCookieHeaders,
    'Content-Type': 'application/json'
  };

  // 3. Verify GET /api/tasks returns a clean state
  console.log('3. GETting tasks from /api/tasks...');
  const getTasksRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'GET',
    headers: authHeaders
  });

  if (!getTasksRes.ok) {
    throw new Error(`GET /api/tasks failed: ${await getTasksRes.text()}`);
  }
  const getTasksData = await getTasksRes.json();
  console.log(`GET /api/tasks returned ${getTasksData.tasks.length} tasks.`);

  // 4. Verify POST /api/tasks creates a task
  console.log('4. POSTing a new task to /api/tasks...');
  const createTaskPayload = {
    title: 'E2E API Test Task',
    description: 'This task was created via HTTP API test',
    status: 'TODO',
    priority: 'HIGH',
    tags: ['api-test', 'sync-test']
  };

  const createTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(createTaskPayload)
  });

  if (!createTaskRes.ok) {
    throw new Error(`POST /api/tasks failed: ${await createTaskRes.text()}`);
  }
  const createTaskData = await createTaskRes.json();
  const createdTaskId = createTaskData.task.id;
  console.log(`Task created successfully via API. ID: ${createdTaskId}`);
  if (createTaskData.task.title !== createTaskPayload.title) throw new Error('API POST title mismatch');
  if (createTaskData.task.status !== 'TODO') throw new Error('API POST status mismatch');

  // 5. Verify PUT /api/tasks updates status and position
  console.log('5. PUTting status update (simulating drag-and-drop to COMPLETED/DONE)...');
  const updateTaskPayload = {
    id: createdTaskId,
    status: 'COMPLETED',
    position: 4
  };

  const updateTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(updateTaskPayload)
  });

  if (!updateTaskRes.ok) {
    throw new Error(`PUT /api/tasks failed: ${await updateTaskRes.text()}`);
  }
  const updateTaskData = await updateTaskRes.json();
  console.log('Task status/position updated successfully via API.');
  if (updateTaskData.task.status !== 'COMPLETED') throw new Error('API PUT status mismatch');

  // Verify in GET /api/tasks list
  const getTasksAfterRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'GET',
    headers: authHeaders
  });
  const getTasksAfterData = await getTasksAfterRes.json();
  const verifiedTask = getTasksAfterData.tasks.find((t: any) => t.id === createdTaskId);
  if (!verifiedTask) throw new Error('Created task not found in subsequent GET list');
  if (verifiedTask.status !== 'COMPLETED') throw new Error('GET task status not updated');
  console.log('GET validation after updates successful.');

  // Validation tests
  console.log('5b. Testing PUT with empty title validation...');
  const emptyTitlePutRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ id: createdTaskId, title: '   ' })
  });
  if (emptyTitlePutRes.status !== 400) throw new Error(`Expected 400 for empty PUT title, got ${emptyTitlePutRes.status}`);
  const emptyTitlePutData = await emptyTitlePutRes.json();
  if (emptyTitlePutData.error !== 'Title is required') throw new Error('Incorrect validation message on PUT empty title');
  console.log('PUT empty title validation successfully verified.');

  console.log('5c. Testing POST with invalid due date validation...');
  const invalidDatePostRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Invalid Date Task', dueDate: 'not-a-date' })
  });
  if (invalidDatePostRes.status !== 400) throw new Error(`Expected 400 for invalid POST dueDate, got ${invalidDatePostRes.status}`);
  console.log('POST invalid due date validation successfully verified.');

  console.log('5d. Testing PUT with invalid due date validation...');
  const invalidDatePutRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ id: createdTaskId, dueDate: 'not-a-date' })
  });
  if (invalidDatePutRes.status !== 400) throw new Error(`Expected 400 for invalid PUT dueDate, got ${invalidDatePutRes.status}`);
  console.log('PUT invalid due date validation successfully verified.');

  console.log('5e. Testing POST with invalid tags array validation...');
  const invalidTagsPostRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Invalid Tags Task', tags: 'not-an-array' })
  });
  if (invalidTagsPostRes.status !== 400) throw new Error(`Expected 400 for invalid tags array in POST, got ${invalidTagsPostRes.status}`);
  const invalidTagsPostData = await invalidTagsPostRes.json();
  if (invalidTagsPostData.error !== 'Tags must be an array of strings') throw new Error('Incorrect validation message on POST invalid tags');
  
  const invalidTagsPostRes2 = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Invalid Tags Task 2', tags: [1, 'tag2'] })
  });
  if (invalidTagsPostRes2.status !== 400) throw new Error(`Expected 400 for non-string tag element in POST, got ${invalidTagsPostRes2.status}`);
  console.log('POST invalid tags validation successfully verified.');

  console.log('5f. Testing PUT with invalid tags array validation...');
  const invalidTagsPutRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ id: createdTaskId, tags: 'not-an-array' })
  });
  if (invalidTagsPutRes.status !== 400) throw new Error(`Expected 400 for invalid tags array in PUT, got ${invalidTagsPutRes.status}`);
  
  const invalidTagsPutRes2 = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ id: createdTaskId, tags: [1, 'tag2'] })
  });
  if (invalidTagsPutRes2.status !== 400) throw new Error(`Expected 400 for non-string tag element in PUT, got ${invalidTagsPutRes2.status}`);
  console.log('PUT invalid tags validation successfully verified.');

  console.log('5g. Testing POST /api/tasks/create with invalid tags array validation...');
  const invalidCreateTagsRes = await fetch(`${BASE_URL}/api/tasks/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'AI Task Invalid Tags', tags: 'not-an-array' })
  });
  if (invalidCreateTagsRes.status !== 400) throw new Error(`Expected 400 for invalid tags array in create API, got ${invalidCreateTagsRes.status}`);
  console.log('POST /api/tasks/create invalid tags validation successfully verified.');

  console.log('5h. Testing POST /api/tasks/create with whitespace assignee bypass...');
  const whitespaceAssigneeRes = await fetch(`${BASE_URL}/api/tasks/create`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'AI Task Whitespace Assignee', assignee: '   ' })
  });
  if (!whitespaceAssigneeRes.ok) throw new Error(`Expected success for whitespace assignee, got status ${whitespaceAssigneeRes.status}`);
  const whitespaceAssigneeData = await whitespaceAssigneeRes.json();
  if (whitespaceAssigneeData.task.assignee !== undefined) {
    throw new Error('Expected task assignee to be undefined when bypass is active');
  }
  // Clean up the created task
  await prisma.task.delete({ where: { id: whitespaceAssigneeData.task.id } });
  console.log('POST /api/tasks/create whitespace assignee bypass verified successfully.');

  // 6. Verify single task DELETE via API
  console.log('6. DELETEing task via API...');
  const deleteTaskRes = await fetch(`${BASE_URL}/api/tasks?id=${createdTaskId}`, {
    method: 'DELETE',
    headers: authHeaders
  });

  if (!deleteTaskRes.ok) {
    throw new Error(`DELETE /api/tasks failed: ${await deleteTaskRes.text()}`);
  }
  const deleteTaskData = await deleteTaskRes.json();
  console.log('DELETE response:', deleteTaskData.message);

  // Verify deletion from GET list
  const getTasksFinalRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'GET',
    headers: authHeaders
  });
  const getTasksFinalData = await getTasksFinalRes.json();
  if (getTasksFinalData.tasks.some((t: any) => t.id === createdTaskId)) {
    throw new Error('Task still exists after deletion');
  }
  console.log('Task single deletion API verification successful.');

  // 7. Verify bulk task DELETE via API
  console.log('7. Verifying bulk task deletion via API...');
  // Create 2 tasks
  const t1Res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Bulk 1' })
  });
  const t2Res = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Bulk 2' })
  });

  const t1Id = (await t1Res.json()).task.id;
  const t2Id = (await t2Res.json()).task.id;

  console.log(`Created two tasks for bulk deletion. IDs: ${t1Id}, ${t2Id}`);

  // Bulk Delete
  const bulkDeleteRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({ ids: [t1Id, t2Id] })
  });

  if (!bulkDeleteRes.ok) {
    throw new Error(`Bulk DELETE /api/tasks failed: ${await bulkDeleteRes.text()}`);
  }
  const bulkDeleteData = await bulkDeleteRes.json();
  console.log('Bulk DELETE response:', bulkDeleteData.message);

  // Verify both deleted
  const checkBulkListRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'GET',
    headers: authHeaders
  });
  const checkBulkListData = await checkBulkListRes.json();
  if (checkBulkListData.tasks.some((t: any) => t.id === t1Id || t.id === t2Id)) {
    throw new Error('Some tasks in bulk deletion still exist');
  }
  console.log('Bulk deletion API verification successful.');

  // --- STRESS TESTING / EDGE CASES ---
  console.log('\n--- API Stress Testing / Edge Cases ---');

  // a. Unauthorized Requests (No Cookies)
  console.log('a. Testing Unauthorized Request (No Cookies)...');
  const unauthRes = await fetch(`${BASE_URL}/api/tasks`, { method: 'GET' });
  console.log(`GET status: ${unauthRes.status} (expected: 401)`);
  if (unauthRes.status !== 401) throw new Error(`Expected 401, got ${unauthRes.status}`);

  const unauthPostRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Unauth Task' })
  });
  console.log(`POST status: ${unauthPostRes.status} (expected: 401)`);
  if (unauthPostRes.status !== 401) throw new Error(`Expected 401, got ${unauthPostRes.status}`);

  // b. Empty Title Validation
  console.log('b. Testing Empty Title Validation...');
  const emptyTitleRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: '   ' })
  });
  const emptyTitleData = await emptyTitleRes.json();
  console.log(`POST with empty title: Status ${emptyTitleRes.status}, Error: "${emptyTitleData.error}"`);
  if (emptyTitleRes.status !== 400) throw new Error(`Expected 400, got ${emptyTitleRes.status}`);
  if (emptyTitleData.error !== 'Title is required') throw new Error('Incorrect validation message');

  // c. Missing Title Field
  console.log('c. Testing Missing Title Field...');
  const missingFieldRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ description: 'No title provided' })
  });
  const missingFieldData = await missingFieldRes.json();
  console.log(`POST missing title: Status ${missingFieldRes.status}, Error: "${missingFieldData.error}"`);
  if (missingFieldRes.status !== 400) throw new Error(`Expected 400, got ${missingFieldRes.status}`);

  // d. Malicious Payload (SQL Injection)
  console.log('d. Testing SQL Injection Attack...');
  const sqlInjectionTitle = "test'; DROP TABLE \"Task\"; --";
  const sqlInjectionRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: sqlInjectionTitle })
  });
  if (!sqlInjectionRes.ok) throw new Error('SQL injection payload crashed the API');
  const sqlInjectionData = await sqlInjectionRes.json();
  console.log(`SQL Injection title was successfully stored under ID: ${sqlInjectionData.task.id}`);
  
  // Verify it is stored literally in DB
  const dbTaskCheck = await prisma.task.findUnique({ where: { id: sqlInjectionData.task.id } });
  if (!dbTaskCheck) throw new Error('SQL injection task not found in database');
  if (dbTaskCheck.title !== sqlInjectionTitle) throw new Error('SQL Injection title was corrupted');
  console.log('Database integrity verified (SQL injection handled safely by Prisma ORM).');
  // Clean up
  await prisma.task.delete({ where: { id: sqlInjectionData.task.id } });

  // e. Malicious Payload (XSS)
  console.log('e. Testing XSS Injection Attack...');
  const xssTitle = '<script>alert("XSS")</script>';
  const xssRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: xssTitle })
  });
  if (!xssRes.ok) throw new Error('XSS payload crashed the API');
  const xssData = await xssRes.json();
  console.log(`XSS title was successfully stored under ID: ${xssData.task.id}`);
  
  // Verify it is stored literally in DB
  const dbXssCheck = await prisma.task.findUnique({ where: { id: xssData.task.id } });
  if (!dbXssCheck) throw new Error('XSS task not found in database');
  if (dbXssCheck.title !== xssTitle) throw new Error('XSS title was corrupted');
  console.log('XSS payload successfully stored literally (XSS sanitization is client responsibility, backend stored literally without execution).');
  // Clean up
  await prisma.task.delete({ where: { id: xssData.task.id } });

  // f. Attempt to access or modify task belonging to another user
  console.log('f. Testing Multi-Tenant Isolation (Unauthorized edit of another user\'s task)...');
  // Create task under current user (Tester A)
  const taskARes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'User A Task' })
  });
  const taskAId = (await taskARes.json()).task.id;

  // Log in as Tester B
  const testEmailB = `apitest-b-${Date.now()}@example.com`;
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmailB, password: testPassword, name: 'Tester B' })
  });
  const loginBRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmailB, password: testPassword })
  });
  const cookiesB = loginBRes.headers.get('set-cookie')!;
  const authHeadersB = {
    'Cookie': cookiesB,
    'Content-Type': 'application/json'
  };

  // Check tenant isolation on task assignment
  const dbUserB = await prisma.user.findUnique({
    where: { email: testEmailB }
  });
  if (!dbUserB) throw new Error('Tester B user not found in database');
  const userBId = dbUserB.id;

  // Tester A tries to POST a task assigning it to Tester B (non-workspace member)
  console.log('Testing tenant isolation on task assignment (POST with non-member assignee)...');
  const assignNonMemberPostRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Task for Tester B', assigneeId: userBId })
  });
  if (assignNonMemberPostRes.status !== 400) {
    throw new Error(`Expected 400 for non-member assignee in POST, got ${assignNonMemberPostRes.status}`);
  }
  const assignNonMemberPostData = await assignNonMemberPostRes.json();
  if (assignNonMemberPostData.error !== 'Assignee is not a member of this workspace') {
    throw new Error(`Incorrect validation message: ${assignNonMemberPostData.error}`);
  }
  console.log('Tenant isolation on task assignment (POST) successfully verified.');

  // Tester A tries to PUT/update a task assigning it to Tester B (non-workspace member)
  console.log('Testing tenant isolation on task assignment (PUT with non-member assignee)...');
  const assignNonMemberPutRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ id: taskAId, assigneeId: userBId })
  });
  if (assignNonMemberPutRes.status !== 400) {
    throw new Error(`Expected 400 for non-member assignee in PUT, got ${assignNonMemberPutRes.status}`);
  }
  const assignNonMemberPutData = await assignNonMemberPutRes.json();
  if (assignNonMemberPutData.error !== 'Assignee is not a member of this workspace') {
    throw new Error(`Incorrect validation message: ${assignNonMemberPutData.error}`);
  }
  console.log('Tenant isolation on task assignment (PUT) successfully verified.');

  // Tester B tries to edit Tester A's task
  console.log(`Tester B trying to PUT/update Tester A's task (${taskAId})...`);
  const editOtherRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'PUT',
    headers: authHeadersB,
    body: JSON.stringify({ id: taskAId, title: 'Hacked Title' })
  });
  console.log(`Tester B update status: ${editOtherRes.status} (expected: 404/403)`);
  if (editOtherRes.status !== 404 && editOtherRes.status !== 403) {
    throw new Error(`Tester B was able to modify Tester A's task! Status code: ${editOtherRes.status}`);
  }

  // Tester B tries to delete Tester A's task
  console.log(`Tester B trying to DELETE Tester A's task (${taskAId})...`);
  const deleteOtherRes = await fetch(`${BASE_URL}/api/tasks?id=${taskAId}`, {
    method: 'DELETE',
    headers: authHeadersB
  });
  console.log(`Tester B delete status: ${deleteOtherRes.status} (expected: 404/403)`);
  if (deleteOtherRes.status !== 404 && deleteOtherRes.status !== 403) {
    throw new Error(`Tester B was able to delete Tester A's task! Status code: ${deleteOtherRes.status}`);
  }

  console.log('Multi-tenant isolation verified: tasks cannot be accessed or modified by unauthorized members.');

  // Clean up Tester A task
  await prisma.task.delete({ where: { id: taskAId } });

  console.log('✅ API Tasks HTTP Tests Passed!');
}

async function main() {
  console.log('==================================================');
  console.log('    Kanban Tasks DB Sync Integration Tester       ');
  console.log('==================================================\n');

  // Run database direct tests (does not require running dev server)
  await runDirectPrismaTests();

  // Run API HTTP tests (requires running dev server)
  const isPortActive = await checkPortActive(3001);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log('Port 3001 is not active. Starting dev server...');
    serverProcess = await startServer();
  } else {
    console.log('Dev server already running on port 3001. Reusing instance.');
  }

  try {
    await runApiTests();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  } finally {
    if (serverProcess) {
      await stopServer(serverProcess);
    }
  }

  console.log('\n==================================================');
  console.log('   All Tasks Persistence and API Sync Tests PASS  ');
  console.log('==================================================');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal tester crash:', error);
  process.exit(1);
});
