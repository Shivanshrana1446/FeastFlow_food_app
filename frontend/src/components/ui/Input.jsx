import { forwardRef, useId, useState } from 'react';
import Icon from './Icon';

const Input = forwardRef(function Input(
  { label, error, hint, icon, type = 'text', className = '', containerClassName = '', ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;
  const describedById = useId();
  const hasMessage = Boolean(error || hint);

  return (
    <label className={`block ${containerClassName}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
      <span className="relative flex items-center">
        {icon && <Icon name={icon} className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-ink-500" />}
        <input
          ref={ref}
          type={resolvedType}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hasMessage ? describedById : undefined}
          className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500 ${
            icon ? 'pl-10.5' : ''
          } ${isPassword ? 'pr-10.5' : ''} ${error ? 'border-danger-500' : 'border-ink-200'} ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 text-ink-500 hover:text-ink-600"
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-4.5 w-4.5" />
          </button>
        )}
      </span>
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

export default Input;
