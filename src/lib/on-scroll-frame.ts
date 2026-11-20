/**
 * Runs `callback` immediately, then at most once per animation frame on scroll and resize.
 * Returns a function that removes the listeners.
 */
export function onScrollFrame(callback: () => void): () => void {
  let isTicking = false;

  const run = (): void => {
    isTicking = false;
    callback();
  };

  const requestRun = (): void => {
    if (isTicking) {
      return;
    }
    isTicking = true;
    requestAnimationFrame(run);
  };

  window.addEventListener('scroll', requestRun, { passive: true });
  window.addEventListener('resize', requestRun, { passive: true });
  callback();

  return () => {
    window.removeEventListener('scroll', requestRun);
    window.removeEventListener('resize', requestRun);
  };
}
