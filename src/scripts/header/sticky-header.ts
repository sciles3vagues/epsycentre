import { setDataAttribute } from '@/lib/dom';

const STICKY_THRESHOLD = 200;

export function updateStickyState(header: HTMLElement): void {
  setDataAttribute(header, 'sticky', String(window.scrollY > STICKY_THRESHOLD));
}
