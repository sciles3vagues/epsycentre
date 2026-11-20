/** Media queries shared between CSS breakpoints (Tailwind) and scripts. Keep in sync with Tailwind's defaults. */
export const MEDIA = {
  /** Tailwind `xl` — desktop header is shown from here, mobile header below. */
  desktopHeader: '(min-width: 80rem)',
} as const;
