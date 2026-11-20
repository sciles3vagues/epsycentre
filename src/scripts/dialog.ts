/**
 * Behaviour for native modal dialogs (`<dialog data-dialog>`), driven by data attributes:
 * - `data-dialog-open="<dialog id>"` on a trigger opens it with `showModal()`; `aria-expanded` is kept in sync.
 * - `data-dialog-close` elements and links inside the dialog close it (links then navigate normally).
 * - `data-dialog-focus` marks the element focused on open (otherwise the browser picks the first focusable one).
 * - `data-dialog-close-at="<media query>"` on the dialog closes it when the query starts matching.
 * Focus trap, Escape to close, inert page and focus return to the trigger are provided by the browser.
 */
export function initDialogs(): void {
  for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog]')) {
    initDialog(dialog);
  }
}

function initDialog(dialog: HTMLDialogElement): void {
  const triggers = document.querySelectorAll<HTMLElement>(`[data-dialog-open="${CSS.escape(dialog.id)}"]`);

  const setExpanded = (isExpanded: boolean): void => {
    for (const trigger of triggers) {
      trigger.setAttribute('aria-expanded', String(isExpanded));
    }
  };

  const open = (): void => {
    dialog.showModal();
    dialog.querySelector<HTMLElement>('[data-dialog-focus]')?.focus();
    setExpanded(true);
  };

  for (const trigger of triggers) {
    trigger.addEventListener('click', open);
  }

  dialog.addEventListener('close', () => setExpanded(false));

  for (const element of dialog.querySelectorAll('[data-dialog-close], a[href]')) {
    element.addEventListener('click', () => dialog.close());
  }

  const closeAt = dialog.dataset.dialogCloseAt;
  if (closeAt !== undefined) {
    window.matchMedia(closeAt).addEventListener('change', event => {
      if (event.matches && dialog.open) {
        dialog.close();
      }
    });
  }
}
