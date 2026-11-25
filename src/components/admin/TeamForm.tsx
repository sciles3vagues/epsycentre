import { useId, useState } from 'react';

import {
  BUTTON_DANGER,
  BUTTON_NEUTRAL,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  INPUT,
  PANEL,
} from '@/components/admin/classes';
import { Field } from '@/components/admin/Field';
import { PlusIcon, TrashIcon } from '@/components/admin/icons';
import { useFocusOnMount } from '@/components/admin/useFocusOnMount';

import type { Member, Rdv } from '@/components/admin/entries';

const MAX_RDV = 5;

const RDV_TYPES = {
  phone: { label: 'Téléphone', inputType: 'tel', hint: 'Exemple : 05 59 00 00 00' },
  email: { label: 'E-mail', inputType: 'email', hint: 'Exemple : nom@exemple.fr' },
  url: { label: 'Lien (Doctolib…)', inputType: 'url', hint: 'Adresse complète commençant par https://' },
} as const;

type RdvLine = Rdv & { key: string };

interface Props {
  member: Member;
  isNew: boolean;
  isBusy: boolean;
  onSave: (member: Member) => void;
  onCancel: () => void;
  /** Uploads the file and returns its key, or undefined on failure (the error is announced by the caller). */
  onUploadPhoto: (file: File) => Promise<string | undefined>;
}

export function TeamForm({ member, isNew, isBusy, onSave, onCancel, onUploadPhoto }: Props) {
  const [draft, setDraft] = useState(member);
  const [lines, setLines] = useState<RdvLine[]>(() => member.rdv.map(rdv => ({ ...rdv, key: crypto.randomUUID() })));
  const [isUploading, setIsUploading] = useState(false);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const photoId = useId();

  const update = (changes: Partial<Member>): void => setDraft({ ...draft, ...changes });
  const updateLine = (key: string, changes: Partial<Rdv>): void =>
    setLines(lines.map(line => (line.key === key ? { ...line, ...changes } : line)));

  const handlePhoto = async (file: File | undefined): Promise<void> => {
    if (file === undefined) {
      return;
    }
    setIsUploading(true);
    const key = await onUploadPhoto(file);
    setIsUploading(false);
    if (key !== undefined) {
      update({ photo: key });
    }
  };

  return (
    <form
      className={PANEL}
      onSubmit={event => {
        event.preventDefault();
        onSave({ ...draft, rdv: lines.map(({ key: _key, ...rdv }) => rdv) });
      }}
    >
      <h3 ref={headingRef} tabIndex={-1} className="font-heading text-nom-mobile md:text-nom">
        {isNew ? 'Nouveau membre' : `Modifier « ${member.name} »`}
      </h3>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Nom" value={draft.name} maxLength={100} onChange={name => update({ name })} />
        <Field label="Fonction" value={draft.jobTitle} maxLength={100} onChange={jobTitle => update({ jobTitle })} />
      </div>
      <Field
        label="Description"
        value={draft.description}
        maxLength={1000}
        isMultiline
        onChange={description => update({ description })}
      />
      <Field
        label="Public accueilli"
        value={draft.publics}
        maxLength={2000}
        isMultiline
        onChange={publics => update({ publics })}
      />
      <Field
        label="Problématiques"
        value={draft.problematiques}
        maxLength={2000}
        isMultiline
        onChange={problematiques => update({ problematiques })}
      />
      <Field
        label="Modalités de consultation"
        value={draft.modalites}
        maxLength={2000}
        isMultiline
        onChange={modalites => update({ modalites })}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-semibold">Photo</legend>
        {draft.photo !== undefined && (
          <img
            src={`/media/${draft.photo}`}
            alt={`Aperçu du portrait de ${draft.name}`}
            className="aspect-898/1246 w-32 rounded-box object-cover"
          />
        )}
        <label htmlFor={photoId}>{draft.photo === undefined ? 'Ajouter une photo' : 'Remplacer la photo'}</label>
        <input
          id={photoId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${photoId}-aide`}
          disabled={isUploading}
          onChange={event => void handlePhoto(event.target.files?.[0])}
        />
        <p id={`${photoId}-aide`} className="text-petit text-tertiary">
          {isUploading ? 'Envoi de la photo…' : 'JPEG, PNG ou WebP, 5 Mo maximum. Recadrée en portrait sur le site.'}
        </p>
        {draft.photo !== undefined && (
          <button type="button" className={`${BUTTON_DANGER} self-start`} onClick={() => update({ photo: undefined })}>
            <TrashIcon />
            Retirer la photo
          </button>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 font-semibold">Prise de RDV</legend>
        {lines.map((line, index) => {
          const { label: typeLabel, inputType, hint } = RDV_TYPES[line.type];
          return (
            <div key={line.key} className="flex flex-col gap-3 rounded-box border-2 border-tertiary/30 p-4">
              <label className="flex flex-col gap-1">
                <span className="font-semibold">Type (moyen {index + 1})</span>
                <select
                  value={line.type}
                  onChange={event => updateLine(line.key, { type: event.target.value as Rdv['type'] })}
                  className={INPUT}
                >
                  {Object.entries(RDV_TYPES).map(([type, { label }]) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label={`Texte affiché (${typeLabel})`}
                value={line.label}
                maxLength={line.type === 'phone' ? 60 : 120}
                onChange={label => updateLine(line.key, { label })}
              />
              <Field
                label={typeLabel}
                type={inputType}
                value={line.value}
                maxLength={300}
                pattern={line.type === 'url' ? 'https://.+' : undefined}
                hint={hint}
                onChange={value => updateLine(line.key, { value })}
              />
              <button
                type="button"
                className={`${BUTTON_DANGER} self-start`}
                onClick={() => setLines(lines.filter(({ key }) => key !== line.key))}
              >
                <TrashIcon />
                Retirer ce moyen de RDV
              </button>
            </div>
          );
        })}
        {lines.length < MAX_RDV && (
          <button
            type="button"
            className={`${BUTTON_NEUTRAL} self-start`}
            onClick={() =>
              setLines([...lines, { type: 'phone', label: '', value: '', key: crypto.randomUUID() } satisfies RdvLine])
            }
          >
            <PlusIcon />
            Ajouter un moyen de RDV
          </button>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={BUTTON_PRIMARY} disabled={isBusy || isUploading}>
          Enregistrer
        </button>
        <button type="button" className={BUTTON_SECONDARY} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
