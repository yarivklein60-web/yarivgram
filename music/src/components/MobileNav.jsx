import { NavLink } from 'react-router-dom';
import { Home, Library, Search } from 'lucide-react';

const items = [
  { to: '/', label: 'בית', icon: Home, end: true },
  { to: '/search', label: 'חיפוש', icon: Search },
  { to: '/library', label: 'הספרייה', icon: Library },
];

export default function MobileNav() {
  return (
    <nav className="grid grid-cols-3 bg-gradient-to-t from-black to-black/90 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive ? 'text-white' : 'text-subtle'}`
          }
        >
          <Icon className="h-6 w-6" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
