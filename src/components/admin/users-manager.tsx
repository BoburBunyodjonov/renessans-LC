'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, UserX } from 'lucide-react';
import { Panel, PanelTitle, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/field';
import { describeError } from '@/components/admin/form-shell';
import { deactivateUser, saveUser } from '@/server/actions/settings';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/permissions';

type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
};

const blank = {
  id: null as string | null,
  name: '',
  email: '',
  role: 'EDITOR' as Role,
  isActive: true,
  password: '',
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: StaffUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(blank);
  const [open, setOpen] = useState(false);

  function edit(user: StaffUser) {
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: '',
    });
    setOpen(true);
  }

  function submit() {
    startTransition(async () => {
      const result = await saveUser(form.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
        password: form.password,
      });

      if (result.ok) {
        toast.success('Saqlandi');
        setForm(blank);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.fields?.password ?? describeError(result.error));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <div className="flex items-center justify-between">
          <PanelTitle>Xodimlar</PanelTitle>
          <Button
            size="sm"
            onClick={() => {
              setForm(blank);
              setOpen(true);
            }}
          >
            <Plus aria-hidden />
            Yangi
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-admin-border">
              <tr className="text-xs text-admin-muted uppercase">
                <th className="px-3 py-2 text-start">Ism</th>
                <th className="px-3 py-2 text-start">Email</th>
                <th className="px-3 py-2 text-start">Rol</th>
                <th className="px-3 py-2 text-start">Oxirgi kirish</th>
                <th className="px-3 py-2 text-start">Holat</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-admin-border last:border-0">
                  <td className="px-3 py-2 font-semibold text-admin-text">{user.name}</td>
                  <td className="px-3 py-2 text-admin-muted">{user.email}</td>
                  <td className="px-3 py-2">
                    <StatusPill tone={user.role === 'SUPER_ADMIN' ? 'brand' : 'neutral'}>
                      {ROLE_LABELS[user.role]}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2 text-xs text-admin-muted tabular-nums">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('uz-UZ') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <StatusPill tone={user.isActive ? 'success' : 'danger'}>
                      {user.isActive ? 'Faol' : 'Bloklangan'}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-2 text-end">
                    <button
                      type="button"
                      onClick={() => edit(user)}
                      className="me-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Tahrirlash
                    </button>
                    {user.isActive && user.id !== currentUserId ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const result = await deactivateUser(user.id);
                            if (result.ok) {
                              toast.success('Bloklandi');
                              router.refresh();
                            } else {
                              toast.error(describeError(result.error));
                            }
                          })
                        }
                        className="inline-flex items-center gap-1 text-sm font-semibold text-danger"
                      >
                        <UserX className="size-4" aria-hidden />
                        Bloklash
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {open ? (
        <Panel className="flex flex-col gap-4">
          <PanelTitle>{form.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}</PanelTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-name" className="text-admin-text">
                Ism
              </Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="border-admin-border bg-admin-panel text-admin-text"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-email" className="text-admin-text">
                Email
              </Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="border-admin-border bg-admin-panel text-admin-text"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-role" className="text-admin-text">
                Rol
              </Label>
              <select
                id="user-role"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
                className="h-12 rounded-sm border border-admin-border bg-admin-panel px-3 text-admin-text"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="user-password" className="text-admin-text">
                Parol {form.id ? '(o‘zgartirish uchun)' : ''}
              </Label>
              <Input
                id="user-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="border-admin-border bg-admin-panel text-admin-text"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-admin-text">
            <input
              type="checkbox"
              className="size-4 accent-brand-600"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Faol
          </label>

          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Saqlash
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-admin-muted hover:bg-admin-hover"
            >
              Bekor qilish
            </Button>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
