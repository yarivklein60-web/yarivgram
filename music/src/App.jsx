import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import MobileNav from './components/MobileNav';
import PlayerBar from './components/PlayerBar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import LibraryPage from './pages/LibraryPage';
import Playlist from './pages/Playlist';
import Search from './pages/Search';
import { useLibrary } from './lib/library';
import { ToastProvider } from './lib/toast';

export default function App() {
  const { status } = useLibrary();
  const main = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    main.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ToastProvider>
      <div className="flex h-[100dvh] flex-col bg-base">
        <div className="flex min-h-0 flex-1 gap-2 md:p-2 md:pb-0">
          <Sidebar />
          <main ref={main} className="min-w-0 flex-1 overflow-y-auto bg-panel scroll-thin md:rounded-xl">
            {status === 'ready' ? (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/liked" element={<Playlist liked />} />
                <Route path="/playlist/:id" element={<Playlist />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-subtle">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                {status === 'seeding' ? 'מכין שירי דוגמה…' : 'טוען את הספרייה…'}
              </div>
            )}
          </main>
        </div>
        <PlayerBar />
        <MobileNav />
      </div>
    </ToastProvider>
  );
}
