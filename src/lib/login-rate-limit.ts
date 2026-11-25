import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { z } from 'astro/zod';

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

const attemptsSchema = z.object({ failures: z.number(), resetAt: z.number() });
type Attempts = z.infer<typeof attemptsSchema>;

const authStore = () => getStore({ name: 'auth', consistency: 'strong' });

// IPs are hashed: no raw personal data at rest.
const keyFor = (ip: string): string => `login/${createHash('sha256').update(ip).digest('hex')}`;

async function currentAttempts(ip: string): Promise<Attempts | null> {
  const parsed = attemptsSchema.safeParse(await authStore().get(keyFor(ip), { type: 'json' }));
  return parsed.success && parsed.data.resetAt > Date.now() ? parsed.data : null;
}

export async function isLoginLocked(ip: string): Promise<boolean> {
  const attempts = await currentAttempts(ip);
  return attempts !== null && attempts.failures >= MAX_FAILURES;
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const attempts = (await currentAttempts(ip)) ?? { failures: 0, resetAt: Date.now() + WINDOW_MS };
  await authStore().setJSON(keyFor(ip), { ...attempts, failures: attempts.failures + 1 });
}

export async function clearLoginFailures(ip: string): Promise<void> {
  await authStore().delete(keyFor(ip));
}
