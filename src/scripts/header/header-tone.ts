import { setDataAttribute } from '@/lib/dom';

/** Header colour: `clair` (peach cream) on orange/photo sections, `mandarine` on light ones. */
export type HeaderTone = 'clair' | 'mandarine';

const DEFAULT_TONE: HeaderTone = 'mandarine';

const isHeaderTone = (value: string | undefined): value is HeaderTone => value === 'clair' || value === 'mandarine';

/** Tone declared by the section (`data-header-tone`) that spans the given viewport Y coordinate. */
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

/** Sets `data-tone` on the header from the section under its vertical middle. */
export function updateHeaderTone(header: HTMLElement): void {
  const { top, height } = header.getBoundingClientRect();
  setDataAttribute(header, 'tone', findToneAt(top + height / 2));
}
