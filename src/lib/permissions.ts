export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Capability matrix from PROMPT.md §14. Every server action checks this — the
 * UI only mirrors it.
 */
export const CAPABILITIES = {
  manageSettings: ['SUPER_ADMIN', 'ADMIN'],
  manageUsers: ['SUPER_ADMIN'],
  contentCrud: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  publish: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  manageLeads: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'],
  viewLeads: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER'],
  manageTests: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  viewTests: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'VIEWER'],
  softDelete: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
  hardDelete: ['SUPER_ADMIN', 'ADMIN'],
  exportCsv: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'],
  viewAudit: ['SUPER_ADMIN', 'ADMIN'],
} as const satisfies Record<string, readonly Role[]>;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: Role | undefined | null, capability: Capability): boolean {
  if (!role) return false;
  return (CAPABILITIES[capability] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  MODERATOR: 'Moderator',
  VIEWER: 'Viewer',
};
