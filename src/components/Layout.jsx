import { NavLink, Outlet } from 'react-router-dom';
import { Home, Apple, Dumbbell, User } from 'lucide-react';

const TABS = [
  { to: '/', label: 'בית', icon: Home, end: true },
  { to: '/nutrition', label: 'תזונה', icon: Apple },
  { to: '/workouts', label: 'אימונים', icon: Dumbbell },
  { to: '/profile', label: 'פרופיל', icon: User },
];

export default function Layout() {
  return (
    <div dir="rtl" className="min-h-screen">
      <main className="mx-auto max-w-lg px-4 pt-6 pb-28">
        <Outlet />
      </main>
      <nav className="glass fixed bottom-0 inset-x-0 border-t border-border z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto max-w-lg grid grid-cols-4">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <Icon size={24} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
