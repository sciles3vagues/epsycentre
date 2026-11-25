import { onScrollFrame } from '@/lib/on-scroll-frame';

/** Pinned mode needs enough height to show a whole screen, and motion allowed (else screens stack normally). */
const PINNED_QUERY = '(prefers-reduced-motion: no-preference) and (min-height: 40rem)';
/** Scroll distance per screen, as a fraction of the viewport height. */
const STEP_SCROLL = 0.5;

const visibleSteps = (root: HTMLElement): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>('[data-step]')].filter(step => getComputedStyle(step).display !== 'none');

const revealIn = (element: Element): void => {
  for (const item of element.querySelectorAll('[data-reveal]')) {
    item.setAttribute('data-revealed', 'true');
  }
};

/**
 * `[data-scroll-steps]` sections: the panel is pinned behind the previous section (curtain entrance),
 * then each `[data-step]` screen replaces the previous one as the user scrolls (STEP_SCROLL viewport per screen).
 */
function setup(root: HTMLElement): void {
  const media = window.matchMedia(PINNED_QUERY);
  let steps: HTMLElement[] = [];
  // Curtain = how far the panel tucks under the previous section; never more than that section.
  let curtain = 0;

  const stepTop = (index: number): number =>
    root.getBoundingClientRect().top + window.scrollY + curtain + index * STEP_SCROLL * window.innerHeight;

  const activate = (index: number): void => {
    steps.forEach((step, stepIndex) => {
      const isActive = stepIndex === index;
      step.dataset.active = String(isActive);
      if (isActive) {
        revealIn(step);
      }
    });
  };

  const update = (): void => {
    if (root.dataset.pinned !== 'true' || steps.length === 0) {
      return;
    }
    const progress = (-root.getBoundingClientRect().top - curtain) / (STEP_SCROLL * window.innerHeight);
    activate(Math.min(steps.length - 1, Math.max(0, Math.round(progress))));
  };

  const layout = (): void => {
    steps = visibleSteps(root);
    if (!media.matches) {
      delete root.dataset.pinned;
      revealIn(root);
      return;
    }
    root.dataset.pinned = 'true';
    // Never clip content: if any screen is taller than the viewport, fall back to normal flow.
    if (steps.some(step => step.scrollHeight > step.clientHeight + 1)) {
      delete root.dataset.pinned;
      revealIn(root);
      return;
    }
    const previous = root.previousElementSibling;
    curtain = previous instanceof HTMLElement ? Math.min(previous.offsetHeight, window.innerHeight) : 0;
    root.style.setProperty('--curtain', `${curtain}px`);
    root.style.setProperty('--steps', String(steps.length));
    root.style.setProperty('--step-scroll', `${STEP_SCROLL * 100}dvh`);
    document.documentElement.dataset.revealReady = 'true';
    update();
  };

  // Keyboard users: focusing something in a hidden screen scrolls to that screen.
  root.addEventListener('focusin', event => {
    const step = (event.target as Element).closest<HTMLElement>('[data-step]');
    if (root.dataset.pinned !== 'true' || step === null || step.dataset.active === 'true') {
      return;
    }
    window.scrollTo({ top: stepTop(steps.indexOf(step)), behavior: 'instant' });
  });

  media.addEventListener('change', layout);
  window.addEventListener('resize', layout, { passive: true });
  layout();
  onScrollFrame(update);
}

export function initScrollSteps(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-scroll-steps]')) {
    setup(root);
  }
}
