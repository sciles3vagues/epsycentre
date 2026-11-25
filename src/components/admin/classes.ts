const BUTTON =
  'inline-flex items-center justify-center gap-2 rounded-pill border-2 px-4 py-2 font-heading text-petit disabled:cursor-not-allowed disabled:opacity-50 motion-safe:transition-colors';

export const BUTTON_PRIMARY = `${BUTTON} border-mandarine bg-mandarine text-texte-clair enabled:hover:bg-transparent enabled:hover:text-mandarine`;
export const BUTTON_SECONDARY = `${BUTTON} border-mandarine bg-white text-mandarine enabled:hover:bg-mandarine enabled:hover:text-texte-clair`;
export const BUTTON_SMALL = `${BUTTON} border-tertiary bg-white px-3 py-1 text-tertiary enabled:hover:bg-tertiary enabled:hover:text-texte-clair`;
export const INPUT = 'w-full rounded-box border-2 border-tertiary bg-white px-3 py-2';
export const PANEL = 'flex flex-col gap-5 rounded-card bg-white p-5 md:p-8';
