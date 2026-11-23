export function initCarousels(): void {
  for (const carousel of document.querySelectorAll<HTMLElement>('[data-carousel]')) {
    const toggle = carousel.querySelector<HTMLButtonElement>('[data-carousel-toggle]');
    if (!toggle) {
      continue;
    }

    toggle.addEventListener('click', () => {
      const isPaused = carousel.dataset.paused !== 'true';
      carousel.dataset.paused = String(isPaused);
      const label = isPaused ? toggle.dataset.labelPlay : toggle.dataset.labelPause;
      if (label !== undefined) {
        toggle.setAttribute('aria-label', label);
      }
    });
  }
}
