import { BUTTON_SMALL } from '@/components/admin/classes';

interface Item {
  id: string;
  label: string;
  detail?: string;
}

interface Props {
  items: Item[];
  /** Prefix of the « Modifier » button ids, so focus can come back to them. */
  idPrefix: string;
  isBusy: boolean;
  emptyText: string;
  onEdit: (index: number) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onDelete: (index: number) => void;
}

export function EntryList({ items, idPrefix, isBusy, emptyText, onEdit, onMove, onDelete }: Props) {
  if (items.length === 0) {
    return <p className="text-tertiary">{emptyText}</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {items.map(({ id, label, detail }, index) => (
        <li key={id} className="flex flex-col gap-3 rounded-box bg-white p-4 md:flex-row md:items-center">
          <div className="flex-1">
            <p className="font-semibold">{label}</p>
            {detail !== undefined && <p className="text-petit text-tertiary">{detail}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id={`${idPrefix}-${id}`}
              className={BUTTON_SMALL}
              disabled={isBusy}
              onClick={() => onEdit(index)}
            >
              Modifier<span className="sr-only"> {label}</span>
            </button>
            <button
              type="button"
              className={BUTTON_SMALL}
              disabled={isBusy || index === 0}
              onClick={() => onMove(index, -1)}
            >
              Monter<span className="sr-only"> {label}</span>
            </button>
            <button
              type="button"
              className={BUTTON_SMALL}
              disabled={isBusy || index === items.length - 1}
              onClick={() => onMove(index, 1)}
            >
              Descendre<span className="sr-only"> {label}</span>
            </button>
            <button type="button" className={BUTTON_SMALL} disabled={isBusy} onClick={() => onDelete(index)}>
              Supprimer<span className="sr-only"> {label}</span>
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
