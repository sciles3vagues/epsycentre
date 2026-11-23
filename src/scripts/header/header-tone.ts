import { setDataAttribute } from '@/lib/dom';

export type HeaderTone = 'clair' | 'mandarine';

const DEFAULT_TONE: HeaderTone = 'mandarine';

const isHeaderTone = (value: string | undefined): value is HeaderTone => value === 'clair' || value === 'mandarine';

function findToneAt(y: number): HeaderTone {
  for (const section of document.querySelectorAll<HTMLElement>('[data-header-tone]')) {
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= y && bottom > y) {
      const tone = section.dataset.headerTone;
      return isHeaderTone(tone) ? tone : DEFAULT_TONE;
    }
  }
  return DEFAULT_TONE;
}

export function updateHeaderTone(header: HTMLElement): void {
  const { top, height } = header.getBoundingClientRect();
  setDataAttribute(header, 'tone', findToneAt(top + height / 2));
}
