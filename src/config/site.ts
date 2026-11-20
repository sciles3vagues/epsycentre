/** Site-wide metadata used for SEO, Open Graph, structured data and llms.txt. */
export const SITE = {
  name: 'Epsycentre',
  locale: 'fr_FR',
  lang: 'fr',
  description: 'Epsycentre — description à compléter (150 à 160 caractères pour les moteurs de recherche).',
  defaultOgImage: '/og-default.png',
  // TODO: replace with the real booking URL (e.g. Doctolib) once provided.
  bookingUrl: '#acces',
} as const;
