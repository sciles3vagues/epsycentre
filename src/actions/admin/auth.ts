import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';

import { isAdminPassword, startAdminSession } from '@/lib/admin-session';
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from '@/lib/login-rate-limit';

export const login = defineAction({
  accept: 'form',
  input: z.object({ password: z.string().min(1).max(256) }),
  handler: async ({ password }, context) => {
    const ip = context.clientAddress;
    if (await isLoginLocked(ip)) {
      throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'Trop de tentatives. Réessayez dans 15 minutes.' });
    }
    if (!isAdminPassword(password)) {
      await recordLoginFailure(ip);
      throw new ActionError({ code: 'UNAUTHORIZED', message: 'Mot de passe incorrect.' });
    }
    if (context.session === undefined) {
      throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Session indisponible.' });
    }
    await clearLoginFailures(ip);
    await startAdminSession(context.session);
  },
});

export const logout = defineAction({
  accept: 'form',
  handler: (_input, context) => {
    context.session?.destroy();
  },
});
