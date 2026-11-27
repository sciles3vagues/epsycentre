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
  /** Optional fields may stay empty; the label must then say so. */
  isOptional?: boolean;
  /** Shown under the field and announced; the field is then flagged invalid. */
  error?: string;
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
  isOptional = false,
  error,
}: Props) {
  const id = useId();
  const errorId = `${id}-erreur`;
  const isRequired = !isOptional;
  const describedBy = error === undefined ? undefined : errorId;

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
          required={isRequired}
          aria-invalid={error === undefined ? undefined : true}
          aria-describedby={describedBy}
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
          required={isRequired}
          aria-invalid={error === undefined ? undefined : true}
          aria-describedby={describedBy}
          maxLength={maxLength}
          pattern={pattern}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
      {error !== undefined && (
        <p id={errorId} role="alert" className="text-erreur text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
