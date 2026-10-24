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
      <nav className="glass fixed bottom-0 inset-x-0 border-t border-primary/15 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto max-w-lg grid grid-cols-4 gap-1 px-2 py-1.5">
          {TABS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-[11px] font-semibold border transition-all duration-300 active:scale-95 ${
                  isActive ? 'text-primary border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10' : 'text-muted-foreground border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute -top-0.5 inset-x-0 mx-auto w-6 h-0.5 rounded-full bg-brand" />}
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
