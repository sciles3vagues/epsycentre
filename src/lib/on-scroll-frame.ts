/** Runs `callback` now, then at most once per frame on scroll/resize. Returns an unsubscribe function. */
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
