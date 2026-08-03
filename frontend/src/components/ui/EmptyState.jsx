import Icon from './Icon';
import Button from './Button';

export default function EmptyState({ icon = 'package', title, description, actionLabel, onAction, actionTo, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-14 text-center ${className}`}>
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-ink-800">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {(onAction || actionTo) && actionLabel && (
        <Button className="mt-5" size="sm" onClick={onAction} to={actionTo}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
