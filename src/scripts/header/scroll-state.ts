import { setDataAttribute } from '@/lib/dom';

export function updateScrollState(header: HTMLElement): void {
  setDataAttribute(header, 'scrolled', String(window.scrollY > 0));
}
