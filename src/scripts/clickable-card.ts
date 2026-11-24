/**
 * `[data-clickable-card]`: a click anywhere on the card triggers its `[data-card-action]` control.
 * The control stays the only focusable element (keyboard and screen readers use it directly).
 */
export function initClickableCards(): void {
  for (const card of document.querySelectorAll<HTMLElement>('[data-clickable-card]')) {
    if (card.dataset.clickableReady === 'true') {
      continue;
    }
    card.dataset.clickableReady = 'true';

    const action = card.querySelector<HTMLElement>('[data-card-action]');
    if (!action) {
      continue;
    }

    card.addEventListener('click', event => {
      const isOnControl = event.target instanceof Element && event.target.closest('a, button') !== null;
      const isSelectingText = (window.getSelection()?.toString() ?? '') !== '';
      if (isOnControl || isSelectingText) {
        return;
      }
      action.click();
    });
  }
}
