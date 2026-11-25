import { ActionError, isInputError } from 'astro:actions';

const FIELD_LABELS: Record<string, string> = {
  name: 'Nom',
  jobTitle: 'Fonction',
  description: 'Description',
  publics: 'Public accueilli',
  problematiques: 'Problématiques',
  modalites: 'Modalités de consultation',
  label: 'Texte affiché (prise de RDV)',
  value: 'Coordonnée (prise de RDV)',
  photo: 'Photo',
};

/** French message for a failed action. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ActionError)) {
    return 'Une erreur est survenue. Réessayez.';
  }
  if (error.code === 'UNAUTHORIZED') {
    return 'Session expirée : rechargez la page pour vous reconnecter.';
  }
  if (isInputError(error)) {
    const labels = error.issues
      .map(issue => FIELD_LABELS[String(issue.path.at(-1))])
      .filter((label): label is string => label !== undefined);
    if (labels.length > 0) {
      return `Champs à corriger : ${[...new Set(labels)].join(', ')}.`;
    }
    return error.issues[0]?.message ?? 'Certaines informations sont invalides.';
  }
  return error.message;
}
