import { io } from 'socket.io-client';
import { checkPortActive, startServer, stopServer } from './helpers';

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

function waitForEvent(socket: any, eventName: string, timeoutMs: number = 2000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, listener);
      reject(new Error(`Timeout waiting for event "${eventName}" on socket ${socket.id}`));
    }, timeoutMs);
    
    const listener = (data: any) => {
      clearTimeout(timer);
      socket.off(eventName, listener);
      resolve(data);
    };
    
    socket.on(eventName, listener);
  });
}

function expectNoEvent(socket: any, eventName: string, waitMs: number = 1500): Promise<void> {
  return new Promise((resolve, reject) => {
    const listener = (data: any) => {
      socket.off(eventName, listener);
      reject(new Error(`Received unexpected event "${eventName}" on socket ${socket.id} with data: ${JSON.stringify(data)}`));
    };
    
    socket.on(eventName, listener);
    
    setTimeout(() => {
      socket.off(eventName, listener);
      resolve();
    }, waitMs);
  });
}

async function main() {
  console.log('==================================================');
  console.log('    SaasX Multi-User Chat Verification Test      ');
  console.log('==================================================\n');

  // Check if server is running
  const isPortActive = await checkPortActive(PORT);
  let serverProcess: any = null;
  if (!isPortActive) {
    console.log(`Port ${PORT} is not active. Starting dev server...`);
    serverProcess = await startServer();
  } else {
    console.log(`Dev server is already running on port ${PORT}. Reusing instance.`);
  }

  let socketA: any = null;
  let socketB: any = null;
  let socketC: any = null;

  try {
    console.log('\nConnecting 3 clients to Socket.io server...');
    socketA = io(BASE_URL, { forceNew: true, transports: ['websocket'] });
    socketB = io(BASE_URL, { forceNew: true, transports: ['websocket'] });
    socketC = io(BASE_URL, { forceNew: true, transports: ['websocket'] });

    await Promise.all([
      new Promise<void>((resolve, reject) => {
        socketA.on('connect', () => {
          console.log(`Client A connected: ${socketA.id}`);
          resolve();
        });
        socketA.on('connect_error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        socketB.on('connect', () => {
          console.log(`Client B connected: ${socketB.id}`);
          resolve();
        });
        socketB.on('connect_error', reject);
      }),
      new Promise<void>((resolve, reject) => {
        socketC.on('connect', () => {
          console.log(`Client C connected: ${socketC.id}`);
          resolve();
        });
        socketC.on('connect_error', reject);
      }),
    ]);

    console.log('\nStep 1: Joining chat rooms...');
    // User A and User B join Room 1
    socketA.emit('join-chat', { conversationId: 'room-1', userId: 'user-a', userName: 'User A' });
    socketB.emit('join-chat', { conversationId: 'room-1', userId: 'user-b', userName: 'User B' });
    
    // User C joins Room 2
    socketC.emit('join-chat', { conversationId: 'room-2', userId: 'user-c', userName: 'User C' });

    // Wait a brief moment to ensure rooms are registered on the server
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Room joining completed: User A and User B in room-1, User C in room-2.');

    console.log('\nStep 2: Testing broadcast message & room isolation scoping...');
    const messagePayload = {
      id: 'msg-' + Date.now(),
      conversationId: 'room-1',
      senderId: 'user-a',
      senderName: 'User A',
      content: 'Hello, room-1 members!',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    // Emit from A, B should receive, C should NOT
    socketA.emit('send-chat-message', {
      conversationId: 'room-1',
      message: messagePayload
    });

    const [receivedMsg] = await Promise.all([
      waitForEvent(socketB, 'new-chat-message', 2000),
      expectNoEvent(socketC, 'new-chat-message', 1500)
    ]);

    console.log('✅ Broadcast Message Pass:');
    console.log(`   - Client B received: "${receivedMsg.content}" from ${receivedMsg.senderName}`);
    console.log('   - Client C did NOT receive the message (Isolated).');

    if (receivedMsg.content !== messagePayload.content || receivedMsg.id !== messagePayload.id) {
      throw new Error('Received message content or ID mismatch!');
    }

    console.log('\nStep 3: Testing typing indicators...');
    // Emit typing from A
    socketA.emit('typing', { conversationId: 'room-1', userId: 'user-a', userName: 'User A' });

    const [typingData] = await Promise.all([
      waitForEvent(socketB, 'user-typing', 2000),
      expectNoEvent(socketC, 'user-typing', 1500)
    ]);

    console.log('✅ Typing Indicator (Start) Pass:');
    console.log(`   - Client B received typing state from: ${typingData.userName} (${typingData.userId})`);
    console.log('   - Client C did NOT receive the typing event.');

    if (typingData.userId !== 'user-a' || typingData.userName !== 'User A') {
      throw new Error('Typing indicator data mismatch!');
    }

    // Emit stop-typing from A
    socketA.emit('stop-typing', { conversationId: 'room-1', userId: 'user-a' });

    const [stopTypingData] = await Promise.all([
      waitForEvent(socketB, 'user-stop-typing', 2000),
      expectNoEvent(socketC, 'user-stop-typing', 1500)
    ]);

    console.log('✅ Typing Indicator (Stop) Pass:');
    console.log(`   - Client B received stop typing event for user: ${stopTypingData.userId}`);
    console.log('   - Client C did NOT receive the stop typing event.');

    if (stopTypingData.userId !== 'user-a') {
      throw new Error('Stop typing indicator data mismatch!');
    }

    console.log('\nStep 4: Testing read receipts...');
    // Emit read receipt from B
    socketB.emit('read-receipt', { conversationId: 'room-1', userId: 'user-b' });

    const [readData] = await Promise.all([
      waitForEvent(socketA, 'read-status', 2000),
      expectNoEvent(socketC, 'read-status', 1500)
    ]);

    console.log('✅ Read Receipt Pass:');
    console.log(`   - Client A received read status: user-b read room-1 at ${readData.lastReadAt}`);
    console.log('   - Client C did NOT receive the read receipt event.');

    if (readData.conversationId !== 'room-1' || readData.userId !== 'user-b') {
      throw new Error('Read receipt data mismatch!');
    }

    console.log('\nStep 5: Testing leave chat...');
    // B leaves room-1
    socketB.emit('leave-chat', { conversationId: 'room-1', userId: 'user-b' });
    await new Promise(resolve => setTimeout(resolve, 200));

    // A sends another message to room-1
    const secondMessagePayload = {
      id: 'msg-second-' + Date.now(),
      conversationId: 'room-1',
      senderId: 'user-a',
      senderName: 'User A',
      content: 'Are you still there, B?',
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    socketA.emit('send-chat-message', {
      conversationId: 'room-1',
      message: secondMessagePayload
    });

    // Both B and C should NOT receive the message now
    await Promise.all([
      expectNoEvent(socketB, 'new-chat-message', 1500),
      expectNoEvent(socketC, 'new-chat-message', 1500)
    ]);

    console.log('✅ Leave Chat Pass:');
    console.log('   - Client B (who left) did NOT receive the new message.');
    console.log('   - Client C (in room-2) did NOT receive the new message.');

    console.log('\nAll Multi-User Chat Socket.io integration tests passed successfully!');

  } catch (error: any) {
    console.error('\n❌ Test Failure:');
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  } finally {
    console.log('\nDisconnecting clients...');
    if (socketA) socketA.disconnect();
    if (socketB) socketB.disconnect();
    if (socketC) socketC.disconnect();

    if (serverProcess) {
      console.log('Stopping dev server...');
      await stopServer(serverProcess);
    }
    console.log('Done.');
  }
}

main();
