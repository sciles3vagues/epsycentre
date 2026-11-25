import { NETLIFY_BUILD_HOOK_URL } from 'astro:env/server';

/** Starts a Netlify production build. Returns false when no build hook is configured (local dev). */
export async function triggerRebuild(): Promise<boolean> {
  if (NETLIFY_BUILD_HOOK_URL === undefined || NETLIFY_BUILD_HOOK_URL === '') {
    return false;
  }
  const response = await fetch(NETLIFY_BUILD_HOOK_URL, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`Build hook answered ${response.status}`);
  }
  return true;
}
