/**
 * Reveals `[data-reveal]` elements once, as they scroll into view.
 * Elements are only hidden after this runs (`html[data-reveal-ready]`), so content stays visible
 * without JS, without IntersectionObserver, or with prefers-reduced-motion.
 */
export function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement | SVGElement>('[data-reveal]');
  const canAnimate = 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (elements.length === 0 || !canAnimate) {
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -15% 0px' }
  );

  document.documentElement.dataset.revealReady = 'true';
  for (const element of elements) {
    // Scroll-steps sections reveal their own content (src/scripts/scroll-steps.ts).
    if (element.closest('[data-scroll-steps]') === null) {
      observer.observe(element);
    }
  }
}
