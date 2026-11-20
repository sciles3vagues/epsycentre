import { onScrollFrame } from '@/lib/on-scroll-frame';
import { updateHeaderTone } from '@/scripts/header/header-tone';
import { updateStickyState } from '@/scripts/header/sticky-header';

/** Wires the site header (`[data-site-header]`): sticky state + tone, updated once per frame on scroll/resize. */
export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) {
    return;
  }

  onScrollFrame(() => {
    updateStickyState(header);
    updateHeaderTone(header);
  });
}
