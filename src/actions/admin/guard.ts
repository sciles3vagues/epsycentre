import { ActionError } from 'astro:actions';

import { isAdminSession } from '@/lib/admin-session';

import type { ActionAPIContext } from 'astro:actions';

export async function requireAdmin(context: ActionAPIContext): Promise<void> {
  if (!(await isAdminSession(context.session))) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'Session expirée. Reconnectez-vous.' });
  }
}
