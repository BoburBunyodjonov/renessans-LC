'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/** Dark mode is admin-only and uses the `class` strategy (PROMPT.md §5). */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      window.localStorage.setItem('admin-theme', next ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
      className="grid size-9 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-text"
    >
      {dark ? (
        <Sun className="size-[18px]" aria-hidden />
      ) : (
        <Moon className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}
