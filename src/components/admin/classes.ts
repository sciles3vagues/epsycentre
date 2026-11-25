const BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-pill border-2 px-4 py-2 font-heading text-petit disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors';
const SMALL = 'px-3 py-1';

export const BUTTON_PRIMARY = `${BUTTON} border-mandarine bg-mandarine text-texte-clair enabled:hover:bg-transparent enabled:hover:text-mandarine`;
export const BUTTON_SECONDARY = `${BUTTON} border-mandarine bg-white text-mandarine enabled:hover:bg-mandarine enabled:hover:text-texte-clair`;
/** Main action on a list entry. */
export const BUTTON_EDIT = `${BUTTON} ${SMALL} border-noir bg-noir text-white enabled:hover:bg-white enabled:hover:text-noir`;
/** Secondary actions (reorder, add a line). */
export const BUTTON_NEUTRAL = `${BUTTON} ${SMALL} border-noir/25 bg-white text-noir enabled:hover:border-noir`;
/** Destructive actions. */
export const BUTTON_DANGER = `${BUTTON} ${SMALL} border-danger bg-white text-danger enabled:hover:bg-danger enabled:hover:text-white`;
export const BUTTON_DANGER_SOLID = `${BUTTON} border-danger bg-danger text-white enabled:hover:bg-white enabled:hover:text-danger`;
export const INPUT = 'w-full rounded-box border-2 border-tertiary bg-white px-3 py-2';
export const PANEL = 'flex flex-col gap-5 rounded-card bg-white p-5 shadow-sm md:p-8';
