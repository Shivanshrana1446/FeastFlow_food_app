import { initials } from '@/utils/format';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${SIZES[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${SIZES[size]} ${className}`}
    >
      {initials(name) || '?'}
    </span>
  );
}
