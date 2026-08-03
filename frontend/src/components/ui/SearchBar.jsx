import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBar({ placeholder = 'Search...', onSearch, className = '', defaultValue = '', delay = 400 }) {
  const [value, setValue] = useState(defaultValue);
  const debounced = useDebounce(value, delay);

  useEffect(() => {
    onSearch?.(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className={`relative ${className}`}>
      <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10.5 pr-4 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500"
      />
    </div>
  );
}
