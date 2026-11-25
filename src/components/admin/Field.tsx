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
  /** Example value only: the label stays visible and carries the meaning. */
  placeholder?: string;
}

export function Field({
  label,
  value,
  onChange,
  maxLength,
  isMultiline = false,
  type = 'text',
  pattern,
  placeholder,
}: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {isMultiline ? (
        <textarea
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          required
          maxLength={maxLength}
          rows={3}
          placeholder={placeholder}
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
          placeholder={placeholder}
          className={INPUT}
        />
      )}
    </div>
  );
}
