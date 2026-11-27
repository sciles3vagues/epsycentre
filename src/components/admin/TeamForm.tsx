import { useEffect, useId, useRef, useState } from 'react';

import {
  BUTTON_DANGER,
  BUTTON_NEUTRAL,
  BUTTON_PRIMARY,
  BUTTON_SECONDARY,
  FILE_BUTTON,
  PANEL,
  SELECT,
} from '@/components/admin/classes';
import { Field } from '@/components/admin/Field';
import { focusFirstInvalid, requiredErrors, withoutError } from '@/components/admin/form-errors';
import { ChevronDownIcon, PlusIcon, TrashIcon, UploadIcon } from '@/components/admin/icons';
import { useFocusOnMount } from '@/components/admin/useFocusOnMount';

import type { Member, Rdv } from '@/components/admin/entries';
import type { FormErrors } from '@/components/admin/form-errors';
import type { SyntheticEvent } from 'react';

const MAX_RDV = 5;

const RDV_TYPES = {
  phone: { label: 'Téléphone', inputType: 'tel', placeholder: '05 59 00 00 00' },
  email: { label: 'E-mail', inputType: 'email', placeholder: 'nom@exemple.fr' },
  url: { label: 'Lien de prise de RDV', inputType: 'url', placeholder: 'https://www.doctolib.fr/…' },
} as const;

type RdvLine = Rdv & { key: string };

const rdvErrorKey = (lineKey: string): string => `rdv:${lineKey}`;

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
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempts, setAttempts] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const photoId = useId();

  useEffect(() => {
    if (attempts > 0) {
      focusFirstInvalid(formRef.current);
    }
  }, [attempts]);

  const update = (changes: Partial<Member>): void => {
    setDraft({ ...draft, ...changes });
    setErrors(previous => Object.keys(changes).reduce(withoutError, previous));
  };
  const updateLine = (key: string, changes: Partial<Rdv>): void => {
    setLines(lines.map(line => (line.key === key ? { ...line, ...changes } : line)));
    setErrors(previous => withoutError(previous, rdvErrorKey(key)));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = requiredErrors([
      { key: 'name', label: 'Nom', value: draft.name },
      { key: 'jobTitle', label: 'Fonction', value: draft.jobTitle },
      { key: 'publics', label: 'Public accueilli', value: draft.publics },
      { key: 'problematiques', label: 'Problématiques', value: draft.problematiques },
      { key: 'modalites', label: 'Modalités de consultation', value: draft.modalites },
      ...lines.map(line => ({
        key: rdvErrorKey(line.key),
        label: `${RDV_TYPES[line.type].label} (moyen de RDV ${lines.indexOf(line) + 1})`,
        value: line.value,
      })),
    ]);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempts(count => count + 1);
      return;
    }
    if (formRef.current?.reportValidity() === false) {
      return;
    }
    onSave({ ...draft, rdv: lines.map(({ key: _key, ...rdv }) => rdv) });
  };

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
    <form ref={formRef} noValidate className={PANEL} onSubmit={handleSubmit}>
      <h3 ref={headingRef} tabIndex={-1} className="font-heading text-nom-mobile md:text-nom">
        {isNew ? 'Nouveau membre' : `Modifier « ${member.name} »`}
      </h3>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Nom"
          value={draft.name}
          maxLength={100}
          placeholder="Dr Prénom Nom"
          error={errors.name}
          onChange={name => update({ name })}
        />
        <Field
          label="Fonction"
          value={draft.jobTitle}
          maxLength={100}
          placeholder="Psychologue"
          error={errors.jobTitle}
          onChange={jobTitle => update({ jobTitle })}
        />
      </div>
      <Field
        label="Description (optionnel)"
        value={draft.description ?? ''}
        maxLength={1000}
        isOptional
        isMultiline
        onChange={description => update({ description })}
      />
      <Field
        label="Public accueilli"
        value={draft.publics}
        maxLength={2000}
        isMultiline
        error={errors.publics}
        onChange={publics => update({ publics })}
      />
      <Field
        label="Problématiques"
        value={draft.problematiques}
        maxLength={2000}
        isMultiline
        error={errors.problematiques}
        onChange={problematiques => update({ problematiques })}
      />
      <Field
        label="Modalités de consultation"
        value={draft.modalites}
        maxLength={2000}
        isMultiline
        error={errors.modalites}
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
        <input
          id={photoId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={`${photoId}-aide`}
          disabled={isUploading}
          onChange={event => void handlePhoto(event.target.files?.[0])}
          className="peer sr-only"
        />
        <label htmlFor={photoId} className={FILE_BUTTON}>
          <UploadIcon />
          {draft.photo === undefined ? 'Ajouter une photo' : 'Remplacer la photo'}
        </label>
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
          const { label: typeLabel, inputType, placeholder } = RDV_TYPES[line.type];
          return (
            // One group per line so screen readers can tell the « Type » fields apart.
            <fieldset key={line.key} className="flex flex-col gap-3 md:flex-row md:items-end">
              <legend className="sr-only">Moyen de RDV {index + 1}</legend>
              <label className="flex flex-col gap-1 md:w-56">
                <span className="font-semibold">Type</span>
                <span className="relative">
                  <select
                    value={line.type}
                    onChange={event => updateLine(line.key, { type: event.target.value as Rdv['type'] })}
                    className={SELECT}
                  >
                    {Object.entries(RDV_TYPES).map(([type, { label }]) => (
                      <option key={type} value={type}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-noir/60">
                    <ChevronDownIcon />
                  </span>
                </span>
              </label>
              <div className="md:flex-1">
                <Field
                  label={typeLabel}
                  type={inputType}
                  value={line.value}
                  maxLength={300}
                  pattern={line.type === 'url' ? 'https://.+' : undefined}
                  placeholder={placeholder}
                  error={errors[rdvErrorKey(line.key)]}
                  onChange={value => updateLine(line.key, { value })}
                />
              </div>
              <button
                type="button"
                className={`${BUTTON_DANGER} self-start md:mb-1 md:self-auto`}
                onClick={() => setLines(lines.filter(({ key }) => key !== line.key))}
              >
                <TrashIcon />
                Supprimer<span className="sr-only"> le moyen de RDV {index + 1}</span>
              </button>
            </fieldset>
          );
        })}
        {lines.length < MAX_RDV && (
          <button
            type="button"
            className={`${BUTTON_NEUTRAL} self-start`}
            onClick={() =>
              setLines([...lines, { type: 'phone', value: '', key: crypto.randomUUID() } satisfies RdvLine])
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
