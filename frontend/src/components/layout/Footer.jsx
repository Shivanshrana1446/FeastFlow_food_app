import Logo from './Logo';
import Icon from '@/components/ui/Icon';

const COLUMNS = [
  { title: 'Company', links: ['About us', 'Careers', 'Press'] },
  { title: 'For partners', links: ['Partner with us', 'Delivery partner', 'Restaurant apps'] },
  { title: 'Support', links: ['Help center', 'Safety', 'Terms & privacy'] },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Great food, fast — from the restaurants you love, delivered right to your door.
            </p>
            <div className="mt-4 flex gap-3 text-ink-500">
              <Icon name="mail" className="h-4.5 w-4.5" />
              <Icon name="phone" className="h-4.5 w-4.5" />
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink-900">{col.title}</h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <span className="cursor-default text-sm text-ink-500">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>© {new Date().getFullYear()} FeastFlow. All rights reserved.</p>
          <p>Made for food lovers, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
