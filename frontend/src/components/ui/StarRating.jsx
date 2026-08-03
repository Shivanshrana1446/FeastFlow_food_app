import { useState } from 'react';
import Icon from './Icon';

/** Read-only by default; pass `onChange` to make it an interactive rating input. */
export default function StarRating({ value = 0, onChange, size = 'h-4 w-4', count }) {
  const [hovered, setHovered] = useState(0);
  const interactive = Boolean(onChange);
  const display = interactive && hovered ? hovered : value;

  if (!interactive) {
    // A row of disabled, unlabeled buttons is worse for screen readers than a
    // single labeled image — announce it as one thing: "4.5 out of 5 stars".
    return (
      <span className="inline-flex items-center gap-1">
        <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= Math.round(display) ? 'starFilled' : 'star'}
              className={`${size} ${star <= Math.round(display) ? 'text-warning-500' : 'text-ink-300'}`}
              aria-hidden="true"
            />
          ))}
        </span>
        {typeof count === 'number' && <span className="text-xs text-ink-500">({count})</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHovered(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star)}
            className="cursor-pointer"
          >
            <Icon
              name={star <= Math.round(display) ? 'starFilled' : 'star'}
              className={`${size} ${star <= Math.round(display) ? 'text-warning-500' : 'text-ink-300'}`}
            />
          </button>
        ))}
      </span>
      {typeof count === 'number' && <span className="text-xs text-ink-500">({count})</span>}
    </span>
  );
}
