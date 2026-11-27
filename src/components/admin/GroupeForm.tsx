import { useEffect, useRef, useState } from 'react';

import { BUTTON_PRIMARY, BUTTON_SECONDARY, PANEL } from '@/components/admin/classes';
import { Field } from '@/components/admin/Field';
import { focusFirstInvalid, requiredErrors, withoutError } from '@/components/admin/form-errors';
import { useFocusOnMount } from '@/components/admin/useFocusOnMount';

import type { Groupe } from '@/components/admin/entries';
import type { FormErrors } from '@/components/admin/form-errors';
import type { SyntheticEvent } from 'react';

interface Props {
  groupe: Groupe;
  isNew: boolean;
  isBusy: boolean;
  onSave: (groupe: Groupe) => void;
  onCancel: () => void;
}

export function GroupeForm({ groupe, isNew, isBusy, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(groupe);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempts, setAttempts] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  useEffect(() => {
    if (attempts > 0) {
      focusFirstInvalid(formRef.current);
    }
  }, [attempts]);

  const update = (changes: Partial<Groupe>): void => {
    setDraft({ ...draft, ...changes });
    setErrors(previous => Object.keys(changes).reduce(withoutError, previous));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const found = requiredErrors([
      { key: 'name', label: 'Nom', value: draft.name },
      { key: 'description', label: 'Description', value: draft.description },
    ]);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setAttempts(count => count + 1);
      return;
    }
    if (formRef.current?.reportValidity() === false) {
      return;
    }
    onSave(draft);
  };

  return (
    <form ref={formRef} noValidate className={PANEL} onSubmit={handleSubmit}>
      <h3 ref={headingRef} tabIndex={-1} className="font-heading text-nom-mobile md:text-nom">
        {isNew ? 'Nouveau groupe' : `Modifier « ${groupe.name} »`}
      </h3>
      <Field
        label="Nom"
        value={draft.name}
        maxLength={100}
        placeholder="Anxiété sociale"
        error={errors.name}
        onChange={name => update({ name })}
      />
      <Field
        label="Description"
        value={draft.description}
        maxLength={2000}
        isMultiline
        error={errors.description}
        onChange={description => update({ description })}
      />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={BUTTON_PRIMARY} disabled={isBusy}>
          Enregistrer
        </button>
        <button type="button" className={BUTTON_SECONDARY} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}
