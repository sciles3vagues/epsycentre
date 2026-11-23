import { setDataAttribute } from '@/lib/dom';

import type { SectionBackground } from '@/types/background';

const DEFAULT_BACKGROUND: SectionBackground = 'white';

const isSectionBackground = (value: string | undefined): value is SectionBackground =>
  value === 'white' || value === 'fond' || value === 'gradient';

function findBackgroundAt(y: number): SectionBackground {
  for (const section of document.querySelectorAll<HTMLElement>('[data-section-bg]')) {
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= y && bottom > y) {
      const background = section.dataset.sectionBg;
      return isSectionBackground(background) ? background : DEFAULT_BACKGROUND;
    }
  }
  return DEFAULT_BACKGROUND;
}

export function updateHeaderTheme(header: HTMLElement): void {
  const { top, height } = header.getBoundingClientRect();
  const background = findBackgroundAt(top + height / 2);
  setDataAttribute(header, 'bg', background);
  setDataAttribute(header, 'tone', background === 'gradient' ? 'clair' : 'mandarine');
}
