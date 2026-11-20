import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * tailwind-merge only knows Tailwind's default scale: custom `--text-*` tokens (global.css) must be declared
 * as font sizes, otherwise `text-corps` is treated as a colour and dropped when merged with `text-noir`.
 * Keep this list in sync with the `--text-*` tokens in src/styles/global.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['titre', 'titre-mobile', 'grand', 'bouton', 'bouton-mobile', 'nom', 'corps', 'petit'] }],
    },
  },
});

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
