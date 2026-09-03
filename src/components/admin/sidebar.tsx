'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { AdminIcon } from '@/components/admin/admin-icon';
import { ADMIN_NAV } from '@/components/admin/nav-config';
import { can, type Role } from '@/lib/permissions';
import { cn } from '@/lib/utils';

export function AdminSidebar({
  role,
  mobileOpen,
  onMobileClose,
}: {
  role: Role;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('admin-sidebar') === 'collapsed');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggle() {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem('admin-sidebar', next ? 'collapsed' : 'open');
      } catch {
        // ignore
      }
      return next;
    });
  }

  const groups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(role, item.capability)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-50 flex w-64 shrink-0 flex-col border-e border-admin-border bg-admin-panel transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          collapsed && 'lg:w-[4.5rem]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-admin-border px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-black text-white"
            >
              R
            </span>
            {!collapsed ? (
              <span className="truncate font-display text-sm font-extrabold text-admin-text">
                Renessans Admin
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Yopish"
            className="ms-auto grid size-9 place-items-center rounded-lg text-admin-muted hover:bg-admin-hover lg:hidden"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed ? (
                <p className="mb-1.5 px-2 text-[0.6875rem] font-bold tracking-[0.12em] text-admin-muted uppercase">
                  {group.label}
                </p>
              ) : null}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-brand-600 text-white'
                            : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text',
                        )}
                      >
                        <AdminIcon name={item.icon} className="size-[18px] shrink-0" />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggle}
          className="hidden items-center gap-2 border-t border-admin-border px-4 py-3 text-sm text-admin-muted hover:bg-admin-hover lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-4" aria-hidden />
              Yig‘ish
            </>
          )}
        </button>
      </aside>
    </>
  );
}
