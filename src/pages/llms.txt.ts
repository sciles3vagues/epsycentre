import { SITE } from '@/config/site';

import type { APIRoute } from 'astro';

/**
 * llms.txt (https://llmstxt.org) — concise, machine-readable site summary for AI agents and search assistants.
 * Add one line per important page as the site grows.
 */
export const GET: APIRoute = ({ site }) => {
  const url = (path: string): string => new URL(path, site).href;
  const body = [`# ${SITE.name}`, '', `> ${SITE.description}`, '', '## Pages', '', `- [Accueil](${url('/')})`, ''].join(
    '\n'
  );
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
