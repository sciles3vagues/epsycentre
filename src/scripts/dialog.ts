/**
 * `<dialog data-dialog>` API:
 * - `data-dialog-open="<id>"` on a trigger (aria-expanded kept in sync)
 * - `data-dialog-close` and links inside close it
 * - `data-dialog-focus` = element focused on open
 * - `data-dialog-close-at="<media query>"` closes it when the query matches
 * - a click on the backdrop closes it
 * Safe to call several times (each component that renders a dialog calls it).
 */
export function initDialogs(): void {
  for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog[data-dialog]')) {
    initDialog(dialog);
  }
}

function initDialog(dialog: HTMLDialogElement): void {
  if (dialog.dataset.dialogReady === 'true') {
    return;
  }
  dialog.dataset.dialogReady = 'true';

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

  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

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
