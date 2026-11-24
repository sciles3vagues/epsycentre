import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

/**
 * Custom `--text-*` tokens must be declared as font sizes, otherwise tailwind-merge treats `text-corps` as a colour
 * and drops it next to `text-noir`. Keep in sync with global.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'titre',
            'titre-mobile',
            'hero-mobile',
            'grand',
            'grand-mobile',
            'bouton',
            'bouton-mobile',
            'nom',
            'nom-mobile',
            'corps',
            'corps-mobile',
            'petit',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
