import { useState } from 'react';

import { BUTTON_PRIMARY, BUTTON_SECONDARY, PANEL } from '@/components/admin/classes';
import { Field } from '@/components/admin/Field';
import { useFocusOnMount } from '@/components/admin/useFocusOnMount';

import type { Groupe } from '@/components/admin/entries';

interface Props {
  groupe: Groupe;
  isNew: boolean;
  isBusy: boolean;
  onSave: (groupe: Groupe) => void;
  onCancel: () => void;
}

export function GroupeForm({ groupe, isNew, isBusy, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(groupe);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  return (
    <form
      className={PANEL}
      onSubmit={event => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h3 ref={headingRef} tabIndex={-1} className="font-heading text-nom-mobile md:text-nom">
        {isNew ? 'Nouveau groupe' : `Modifier « ${groupe.name} »`}
      </h3>
      <Field label="Nom" value={draft.name} maxLength={100} onChange={name => setDraft({ ...draft, name })} />
      <Field
        label="Description"
        value={draft.description}
        maxLength={2000}
        isMultiline
        onChange={description => setDraft({ ...draft, description })}
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
