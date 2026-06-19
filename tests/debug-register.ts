import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

async function main() {
  const attackerEmail = `attacker-${Date.now()}@example.com`;
  const attackerPassword = 'Password123!';

  console.log(`Sending POST to ${BASE_URL}/api/auth/register`);
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: attackerEmail, password: attackerPassword, name: 'Attacker Bob' })
    });
    console.log(`Status: ${regRes.status}`);
    const body = await regRes.text();
    console.log(`Body:`, body);
  } catch (e) {
    console.error(`Error:`, e);
  }
}

main().catch(console.error);
