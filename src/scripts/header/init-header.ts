import { onScrollFrame } from '@/lib/on-scroll-frame';
import { updateHeaderTheme } from '@/scripts/header/header-theme';
import { updateScrollState } from '@/scripts/header/scroll-state';

export function initHeader(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) {
    return;
  }

  onScrollFrame(() => {
    updateScrollState(header);
    updateHeaderTheme(header);
  });
}
