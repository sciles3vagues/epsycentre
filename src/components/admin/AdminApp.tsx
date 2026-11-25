import { useEffect, useRef, useState } from 'react';
import { actions } from 'astro:actions';

import { errorMessage } from '@/components/admin/action-error';
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/components/admin/classes';
import { EMPTY_GROUPE, EMPTY_MEMBER, uniqueId, withoutOrder } from '@/components/admin/entries';
import { EntryList } from '@/components/admin/EntryList';
import { GroupeForm } from '@/components/admin/GroupeForm';
import { TeamForm } from '@/components/admin/TeamForm';
import { useConfirm } from '@/components/admin/useConfirm';

import type { Groupe, Member } from '@/components/admin/entries';
import type { GroupeEntry, TeamEntry } from '@/lib/content-schemas';

interface Props {
  initial: { team: TeamEntry[]; groupes: GroupeEntry[]; hasUnpublishedChanges: boolean; publishedAt: string | null };
}

type Collection = 'team' | 'groupes';

interface Editing {
  collection: Collection;
  /** null: new entry. */
  index: number | null;
}

interface Status {
  isError: boolean;
  text: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
});

const LABELS = {
  team: { one: 'Membre', title: 'L’équipe', add: 'Ajouter un membre', empty: 'Aucun membre pour le moment.' },
  groupes: { one: 'Groupe', title: 'Les groupes', add: 'Ajouter un groupe', empty: 'Aucun groupe pour le moment.' },
} as const;

const moved = <T,>(list: T[], index: number, offset: -1 | 1): T[] => {
  const next = [...list];
  const [item] = next.splice(index, 1);
  if (item !== undefined) {
    next.splice(index + offset, 0, item);
  }
  return next;
};

export default function AdminApp({ initial }: Props) {
  const [team, setTeam] = useState<Member[]>(initial.team.map(withoutOrder));
  const [groupes, setGroupes] = useState<Groupe[]>(initial.groupes.map(withoutOrder));
  const [hasChanges, setHasChanges] = useState(initial.hasUnpublishedChanges);
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt);
  const [editing, setEditing] = useState<Editing | null>(null);
  // Element id to focus after the next render (e.g. the « Modifier » button of the entry just saved).
  const focusTargetRef = useRef<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDialog, confirm] = useConfirm();

  useEffect(() => {
    if (focusTargetRef.current !== null) {
      document.getElementById(focusTargetRef.current)?.focus();
      focusTargetRef.current = null;
    }
  });

  const focusAfterRender = (id: string): void => {
    focusTargetRef.current = id;
  };

  /** Runs an action and announces the outcome. */
  async function run<T>(
    call: () => Promise<{ data?: T; error?: unknown }>,
    success: string
  ): Promise<{ isOk: true; data: T } | { isOk: false }> {
    setIsBusy(true);
    setStatus(null);
    const { data, error } = await call();
    setIsBusy(false);
    if (error !== undefined) {
      setStatus({ isError: true, text: errorMessage(error) });
      return { isOk: false };
    }
    setStatus({ isError: false, text: success });
    return { isOk: true, data: data as T };
  }

  async function saveList(collection: Collection, next: Member[] | Groupe[], success: string): Promise<boolean> {
    const result =
      collection === 'team'
        ? await run(() => actions.admin.saveTeam({ entries: next as Member[] }), success)
        : await run(() => actions.admin.saveGroupes({ entries: next as Groupe[] }), success);
    if (!result.isOk) {
      return false;
    }
    if (collection === 'team') {
      setTeam(next as Member[]);
    } else {
      setGroupes(next);
    }
    setHasChanges(true);
    return true;
  }

  const listOf = (collection: Collection): Member[] | Groupe[] => (collection === 'team' ? team : groupes);

  async function saveEntry(collection: Collection, index: number | null, entry: Member | Groupe): Promise<void> {
    const list = listOf(collection) as (Member | Groupe)[];
    const id =
      index === null
        ? uniqueId(
            entry.name,
            list.map(item => item.id)
          )
        : entry.id;
    const saved = { ...entry, id };
    const next = index === null ? [...list, saved] : list.map((item, position) => (position === index ? saved : item));
    const { one } = LABELS[collection];
    if (await saveList(collection, next, `${one} « ${saved.name} » enregistré (non publié).`)) {
      setEditing(null);
      focusAfterRender(`modifier-${collection}-${id}`);
    }
  }

  async function moveEntry(collection: Collection, index: number, offset: -1 | 1): Promise<void> {
    const list = listOf(collection) as (Member | Groupe)[];
    await saveList(collection, moved(list, index, offset), 'Ordre enregistré (non publié).');
  }

  async function deleteEntry(collection: Collection, index: number): Promise<void> {
    const list = listOf(collection) as (Member | Groupe)[];
    const entry = list[index];
    if (entry === undefined || !(await confirm(`Supprimer « ${entry.name} » ?`, 'Supprimer'))) {
      return;
    }
    const next = list.filter((_, position) => position !== index);
    await saveList(collection, next, `« ${entry.name} » supprimé (non publié).`);
    focusAfterRender(`ajouter-${collection}`);
  }

  async function uploadPhoto(file: File): Promise<string | undefined> {
    const formData = new FormData();
    formData.append('photo', file);
    const result = await run(
      () => actions.admin.uploadPhoto(formData),
      'Photo envoyée. Enregistrez le membre pour la garder.'
    );
    return result.isOk ? result.data.key : undefined;
  }

  async function publish(): Promise<void> {
    if (
      !(await confirm('Publier les modifications sur le site ? La mise à jour prend environ 2 minutes.', 'Publier'))
    ) {
      return;
    }
    const result = await run(() => actions.admin.publish(), 'Publication…');
    if (!result.isOk) {
      return;
    }
    setHasChanges(false);
    setPublishedAt(new Date().toISOString());
    setStatus({
      isError: false,
      text: result.data.isRebuilding
        ? 'Publication lancée : le site sera à jour dans 2 minutes environ.'
        : 'Publié. (Aucune mise à jour du site configurée dans cet environnement.)',
    });
  }

  async function discard(): Promise<void> {
    if (!(await confirm('Annuler toutes les modifications non publiées ?', 'Annuler les modifications'))) {
      return;
    }
    if (!(await run(() => actions.admin.discardDrafts(), 'Modifications annulées.')).isOk) {
      return;
    }
    const { data } = await actions.admin.getDrafts();
    if (data !== undefined) {
      setTeam(data.team.map(withoutOrder));
      setGroupes(data.groupes.map(withoutOrder));
      setHasChanges(data.hasUnpublishedChanges);
    }
    setEditing(null);
  }

  async function exportBackup(): Promise<void> {
    const result = await run(() => actions.admin.exportJson(), 'Sauvegarde téléchargée.');
    if (!result.isOk) {
      return;
    }
    const { data } = result;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `epsycentre-sauvegarde-${data.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const renderSection = (collection: Collection) => {
    const { title, add, empty } = LABELS[collection];
    const isEditingHere = editing?.collection === collection;
    const headingId = `titre-${collection}`;

    return (
      <section aria-labelledby={headingId} className="flex flex-col gap-4">
        <h2 id={headingId} className="font-heading text-titre-mobile text-tertiary md:typo-titre">
          {title}
        </h2>
        {isEditingHere && collection === 'team' && (
          <TeamForm
            member={editing.index === null ? EMPTY_MEMBER : (team[editing.index] ?? EMPTY_MEMBER)}
            isNew={editing.index === null}
            isBusy={isBusy}
            onSave={member => void saveEntry('team', editing.index, member)}
            onCancel={() => {
              setEditing(null);
              focusAfterRender(
                editing.index === null ? 'ajouter-team' : `modifier-team-${team[editing.index]?.id ?? ''}`
              );
            }}
            onUploadPhoto={uploadPhoto}
          />
        )}
        {isEditingHere && collection === 'groupes' && (
          <GroupeForm
            groupe={editing.index === null ? EMPTY_GROUPE : (groupes[editing.index] ?? EMPTY_GROUPE)}
            isNew={editing.index === null}
            isBusy={isBusy}
            onSave={groupe => void saveEntry('groupes', editing.index, groupe)}
            onCancel={() => {
              setEditing(null);
              focusAfterRender(
                editing.index === null ? 'ajouter-groupes' : `modifier-groupes-${groupes[editing.index]?.id ?? ''}`
              );
            }}
          />
        )}
        {!isEditingHere && (
          <>
            <EntryList
              items={
                collection === 'team'
                  ? team.map(({ id, name, jobTitle }) => ({ id, label: name, detail: jobTitle }))
                  : groupes.map(({ id, name }) => ({ id, label: name }))
              }
              idPrefix={`modifier-${collection}`}
              isBusy={isBusy || editing !== null}
              emptyText={empty}
              onEdit={index => setEditing({ collection, index })}
              onMove={(index, offset) => void moveEntry(collection, index, offset)}
              onDelete={index => void deleteEntry(collection, index)}
            />
            <button
              type="button"
              id={`ajouter-${collection}`}
              className={`${BUTTON_SECONDARY} self-start`}
              disabled={isBusy || editing !== null}
              onClick={() => setEditing({ collection, index: null })}
            >
              {add}
            </button>
          </>
        )}
      </section>
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 rounded-card bg-white p-5 md:p-8">
        <p>
          {hasChanges ? <strong>Modifications non publiées.</strong> : 'Tout est publié.'}{' '}
          {publishedAt !== null && `Dernière publication : ${DATE_FORMAT.format(new Date(publishedAt))}.`}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={BUTTON_PRIMARY}
            disabled={isBusy || !hasChanges}
            onClick={() => void publish()}
          >
            Publier les modifications
          </button>
          {hasChanges && (
            <button type="button" className={BUTTON_SECONDARY} disabled={isBusy} onClick={() => void discard()}>
              Annuler les modifications
            </button>
          )}
          <button type="button" className={BUTTON_SECONDARY} disabled={isBusy} onClick={() => void exportBackup()}>
            Exporter (sauvegarde)
          </button>
        </div>
        <p role="status" className={status?.isError === true ? 'font-semibold text-mandarine' : 'text-tertiary'}>
          {status?.text}
        </p>
      </div>

      {renderSection('team')}
      {renderSection('groupes')}
      {confirmDialog}
    </div>
  );
}
