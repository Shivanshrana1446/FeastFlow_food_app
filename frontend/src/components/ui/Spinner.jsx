import Icon from './Icon';

export default function Spinner({ className = 'h-6 w-6 text-brand-500', label }) {
  return (
    <span className="inline-flex flex-col items-center gap-2 text-current">
      <Icon name="spinner" className={`animate-spin ${className}`} strokeWidth={2.5} />
      {label && <span className="text-sm text-ink-500">{label}</span>}
    </span>
  );
}
