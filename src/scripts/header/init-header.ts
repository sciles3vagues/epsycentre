import { onScrollFrame } from '@/lib/on-scroll-frame';
import { updateHeaderTone } from '@/scripts/header/header-tone';
import { updateStickyState } from '@/scripts/header/sticky-header';

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
