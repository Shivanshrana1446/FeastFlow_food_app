import { forwardRef, useId } from 'react';

const TextArea = forwardRef(function TextArea(
  { label, error, hint, rows = 4, className = '', containerClassName = '', ...rest },
  ref
) {
  const describedById = useId();
  const hasMessage = Boolean(error || hint);

  return (
    <label className={`block ${containerClassName}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={hasMessage ? describedById : undefined}
        className={`w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500 ${
          error ? 'border-danger-500' : 'border-ink-200'
        } ${className}`}
        {...rest}
      />
      {error ? (
        <span id={describedById} className="mt-1.5 block text-xs font-medium text-danger-500">
          {error}
        </span>
      ) : hint ? (
        <span id={describedById} className="mt-1.5 block text-xs text-ink-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
});

export default TextArea;
