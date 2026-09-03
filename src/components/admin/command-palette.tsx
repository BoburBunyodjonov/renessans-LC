'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { AdminIcon } from '@/components/admin/admin-icon';
import { ADMIN_NAV } from '@/components/admin/nav-config';
import { can, type Role } from '@/lib/permissions';

/** ⌘K / Ctrl+K jump-to-resource palette. */
export function CommandPalette({ role }: { role: Role }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const groups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(role, item.capability)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-lg border border-admin-border px-3 text-sm text-admin-muted transition-colors hover:bg-admin-hover md:flex"
      >
        <Search className="size-4" aria-hidden />
        Qidirish
        <kbd className="ms-2 rounded border border-admin-border px-1.5 py-0.5 text-[0.625rem]">
          ⌘K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Buyruqlar"
        className="fixed inset-0 z-100 grid place-items-start justify-center bg-black/45 p-4 pt-[12vh]"
      >
        <div className="w-full max-w-lg overflow-hidden rounded-lg border border-admin-border bg-admin-panel shadow-2xl">
          <Command.Input
            placeholder="Bo‘lim nomini yozing..."
            className="h-12 w-full border-b border-admin-border bg-transparent px-4 text-admin-text outline-none placeholder:text-admin-muted"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-center text-sm text-admin-muted">
              Hech narsa topilmadi
            </Command.Empty>
            {groups.map((group) => (
              <Command.Group
                key={group.label}
                heading={group.label}
                className="text-admin-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[0.6875rem] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase"
              >
                {group.items.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-admin-text data-[selected=true]:bg-brand-600 data-[selected=true]:text-white"
                  >
                    <AdminIcon name={item.icon} className="size-[18px]" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
