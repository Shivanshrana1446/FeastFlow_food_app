import { forwardRef, useId } from 'react';
import Icon from './Icon';

/** options: [{ value, label }] */
const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className = '', containerClassName = '', ...rest },
  ref
) {
  const errorId = useId();

  return (
    <label className={`block ${containerClassName}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
      <span className="relative block">
        <select
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full appearance-none rounded-xl border bg-white px-3.5 pr-9 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500 ${
            error ? 'border-danger-500' : 'border-ink-200'
          } ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      </span>
      {error && (
        <span id={errorId} className="mt-1.5 block text-xs font-medium text-danger-500">
          {error}
        </span>
      )}
    </label>
  );
});

export default Select;
