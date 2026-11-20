import { setDataAttribute } from '@/lib/dom';

/** Scroll distance (px) after which the header leaves the page flow and becomes fixed. */
const STICKY_THRESHOLD = 200;

/** Sets `data-sticky` on the header from the current scroll position. */
export function updateStickyState(header: HTMLElement): void {
  setDataAttribute(header, 'sticky', String(window.scrollY > STICKY_THRESHOLD));
}
