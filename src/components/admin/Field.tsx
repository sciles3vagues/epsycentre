import { useId } from 'react';

import { INPUT } from '@/components/admin/classes';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  isMultiline?: boolean;
  type?: 'text' | 'email' | 'tel' | 'url';
  pattern?: string;
  hint?: string;
}

export function Field({ label, value, onChange, maxLength, isMultiline = false, type = 'text', pattern, hint }: Props) {
  const id = useId();
  const hintId = `${id}-aide`;
  const describedBy = hint === undefined ? undefined : hintId;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {hint !== undefined && (
        <p id={hintId} className="text-petit text-tertiary">
          {hint}
        </p>
      )}
      {isMultiline ? (
        <textarea
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          required
          maxLength={maxLength}
          rows={3}
          aria-describedby={describedBy}
          className={INPUT}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          required
          maxLength={maxLength}
          pattern={pattern}
          aria-describedby={describedBy}
          className={INPUT}
        />
      )}
    </div>
  );
}
