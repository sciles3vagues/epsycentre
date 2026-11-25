import { createHash, timingSafeEqual } from 'node:crypto';
import { ADMIN_PASSWORD } from 'astro:env/server';

import type { AstroSession } from 'astro';

const digest = (value: string): Buffer => createHash('sha256').update(value).digest();

/** The configured password, or undefined when the back office isn't set up (login always refused). */
const adminPassword = (): string | undefined =>
  ADMIN_PASSWORD === undefined || ADMIN_PASSWORD === '' ? undefined : ADMIN_PASSWORD;

/** Constant-time comparison (digests have the same length whatever the input). */
export function isAdminPassword(input: string): boolean {
  const password = adminPassword();
  return password !== undefined && timingSafeEqual(digest(input), digest(password));
}

/** Ties a session to the current password: changing ADMIN_PASSWORD logs everyone out. */
const passwordFingerprint = (password: string): string => digest(`epsy-admin:${password}`).toString('hex').slice(0, 16);

export async function startAdminSession(session: AstroSession): Promise<void> {
  const password = adminPassword();
  if (password === undefined) {
    return;
  }
  // New session id at login (no session fixation).
  await session.regenerate();
  session.set('admin', { fingerprint: passwordFingerprint(password) });
}

export async function isAdminSession(session: AstroSession | undefined): Promise<boolean> {
  const password = adminPassword();
  if (session === undefined || password === undefined) {
    return false;
  }
  const admin = await session.get('admin');
  return admin?.fingerprint === passwordFingerprint(password);
}
