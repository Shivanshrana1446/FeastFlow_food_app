import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import Icon from '@/components/ui/Icon';

export default function Sidebar({ items, roleLabel, className = '' }) {
  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col border-r border-ink-100 bg-white ${className}`}>
      <div className="flex h-16 items-center border-b border-ink-100 px-5">
        <Logo />
      </div>
      <p className="px-5 pt-5 text-xs font-bold uppercase tracking-wider text-ink-500">{roleLabel}</p>
      <nav className="flex-1 space-y-1 px-3 py-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'
              }`
            }
          >
            <Icon name={item.icon} className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-100 p-4">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-500 hover:bg-ink-50"
        >
          <Icon name="arrowLeft" className="h-4.5 w-4.5" />
          Back to site
        </NavLink>
      </div>
    </aside>
  );
}
