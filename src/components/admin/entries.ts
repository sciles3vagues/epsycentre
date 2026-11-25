import type { GroupeEntry, TeamEntry } from '@/lib/content-schemas';

/** Entries as edited in the back office: the server sets `order` from the list position. */
export type Member = Omit<TeamEntry, 'order'>;
export type Groupe = Omit<GroupeEntry, 'order'>;
export type Rdv = Member['rdv'][number];

export const EMPTY_MEMBER: Member = {
  id: '',
  name: '',
  jobTitle: '',
  description: '',
  publics: '',
  problematiques: '',
  modalites: '',
  rdv: [],
};

export const EMPTY_GROUPE: Groupe = { id: '', name: '', description: '' };

export const withoutOrder = <T extends { order: number }>({ order: _order, ...entry }: T): Omit<T, 'order'> => entry;

/** URL-safe id from a name, made unique among the existing ids (kept when the name changes later). */
export function uniqueId(name: string, existing: readonly string[]): string {
  const base =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'entree';
  let id = base;
  for (let suffix = 2; existing.includes(id); suffix += 1) {
    id = `${base}-${suffix}`;
  }
  return id;
}
