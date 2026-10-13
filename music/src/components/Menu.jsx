import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Popover rendered in a portal with fixed positioning so scroll containers never clip it.
export default function Menu({ anchor, onClose, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: -9999 });

  useLayoutEffect(() => {
    if (!anchor || !ref.current) return;
    const a = anchor.getBoundingClientRect();
    const m = ref.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, a.left), window.innerWidth - m.width - 8);
    const below = a.bottom + 4;
    const top = below + m.height > window.innerHeight - 8 ? Math.max(8, a.top - m.height - 4) : below;
    setPos({ top, left });
  }, [anchor, children]);

  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current?.contains(e.target) && !anchor?.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onClose);
    };
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={ref}
      role="menu"
      dir="rtl"
      className="fixed z-50 max-h-[70vh] w-60 overflow-y-auto rounded-lg bg-elevated p-1 text-sm shadow-2xl shadow-black/60 ring-1 ring-white/5 scroll-thin"
      style={pos}
    >
      {children}
    </div>,
    document.body,
  );
}

export function MenuItem({ icon: Icon, children, onClick, danger }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-right transition hover:bg-hover ${danger ? 'text-red-400' : 'text-white/90'}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 text-subtle" />}
      <span className="truncate">{children}</span>
    </button>
  );
}

export const MenuDivider = () => <div className="my-1 h-px bg-line" />;
