export type FormErrors = Partial<Record<string, string>>;

export interface RequiredField {
  key: string;
  label: string;
  value: string;
}

/** Says what is missing and what to do, since the message is the only cue for the user. */
export const requiredMessage = (label: string): string =>
  `Ce champ est obligatoire : renseignez « ${label} » pour enregistrer.`;

/** Errors for required fields that are empty or only spaces. */
export function requiredErrors(fields: readonly RequiredField[]): FormErrors {
  return Object.fromEntries(
    fields.filter(({ value }) => value.trim() === '').map(({ key, label }) => [key, requiredMessage(label)])
  );
}

export function withoutError(errors: FormErrors, key: string): FormErrors {
  const { [key]: _removed, ...rest } = errors;
  return rest;
}

/** Moves focus to the first field flagged invalid, so the user lands where the fix is. */
export function focusFirstInvalid(form: HTMLFormElement | null): void {
  form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}
