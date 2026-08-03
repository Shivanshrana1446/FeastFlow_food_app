import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 font-display text-lg font-extrabold text-white">
        F
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">FeastFlow</span>
    </Link>
  );
}
