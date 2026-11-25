import { BUTTON_DANGER, BUTTON_EDIT, BUTTON_NEUTRAL } from '@/components/admin/classes';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from '@/components/admin/icons';

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
        <li key={id} className="flex flex-col gap-3 rounded-box bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex-1">
            <p className="font-semibold">{label}</p>
            {detail !== undefined && <p className="text-petit text-tertiary">{detail}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id={`${idPrefix}-${id}`}
              className={BUTTON_EDIT}
              disabled={isBusy}
              onClick={() => onEdit(index)}
            >
              <PencilIcon />
              Modifier<span className="sr-only"> {label}</span>
            </button>
            <button
              type="button"
              className={BUTTON_NEUTRAL}
              disabled={isBusy || index === 0}
              onClick={() => onMove(index, -1)}
            >
              <ArrowUpIcon />
              Monter<span className="sr-only"> {label}</span>
            </button>
            <button
              type="button"
              className={BUTTON_NEUTRAL}
              disabled={isBusy || index === items.length - 1}
              onClick={() => onMove(index, 1)}
            >
              <ArrowDownIcon />
              Descendre<span className="sr-only"> {label}</span>
            </button>
            <button
              type="button"
              className={`${BUTTON_DANGER} md:ml-4`}
              disabled={isBusy}
              onClick={() => onDelete(index)}
            >
              <TrashIcon />
              Supprimer<span className="sr-only"> {label}</span>
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
