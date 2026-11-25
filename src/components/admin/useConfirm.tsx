import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { BUTTON_DANGER_SOLID, BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/admin/classes';

import type { ReactNode } from 'react';

interface Request {
  message: string;
  confirmLabel: string;
  isDangerous: boolean;
}

/** Accessible confirmation (native modal <dialog>): `await confirm(message, label)` resolves to true or false. */
export function useConfirm(): [
  ReactNode,
  (message: string, confirmLabel: string, isDangerous?: boolean) => Promise<boolean>,
] {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolveRef = useRef<((isConfirmed: boolean) => void) | null>(null);
  const answerRef = useRef(false);
  const [request, setRequest] = useState<Request | null>(null);
  const messageId = useId();

  const confirm = useCallback(
    (message: string, confirmLabel: string, isDangerous = false) =>
      new Promise<boolean>(resolve => {
        resolveRef.current = resolve;
        answerRef.current = false;
        setRequest({ message, confirmLabel, isDangerous });
      }),
    []
  );

  useEffect(() => {
    if (request !== null) {
      dialogRef.current?.showModal();
    }
  }, [request]);

  const answer = (isConfirmed: boolean): void => {
    answerRef.current = isConfirmed;
    dialogRef.current?.close();
  };

  // Escape, the buttons and backdrop-less closes all end here.
  const handleClose = (): void => {
    resolveRef.current?.(answerRef.current);
    resolveRef.current = null;
    setRequest(null);
  };

  const dialog = (
    <dialog
      ref={dialogRef}
      aria-labelledby={messageId}
      onClose={handleClose}
      className="m-auto max-w-md rounded-card bg-white p-6 backdrop:bg-noir/50"
    >
      <p id={messageId} className="text-corps-mobile">
        {request?.message}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className={BUTTON_SECONDARY} onClick={() => answer(false)}>
          Annuler
        </button>
        <button
          type="button"
          className={request?.isDangerous === true ? BUTTON_DANGER_SOLID : BUTTON_PRIMARY}
          onClick={() => answer(true)}
        >
          {request?.confirmLabel}
        </button>
      </div>
    </dialog>
  );

  return [dialog, confirm];
}
