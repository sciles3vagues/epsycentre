import { SITE } from '@/config/site';

import type { APIRoute } from 'astro';

/** https://llmstxt.org — add one line per important page. */
export const GET: APIRoute = ({ site }) => {
  const url = (path: string): string => new URL(path, site).href;
  const body = [`# ${SITE.name}`, '', `> ${SITE.description}`, '', '## Pages', '', `- [Accueil](${url('/')})`, ''].join(
    '\n'
  );
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
