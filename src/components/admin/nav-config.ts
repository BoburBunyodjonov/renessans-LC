import type { Capability } from '@/lib/permissions';

export type AdminNavItem = {
  href: string;
  /** Key under the `admin.nav` namespace — the label itself is translated. */
  labelKey: string;
  icon: string;
  capability: Capability;
  /** Matches child routes too. */
  exact?: boolean;
};

export type AdminNavGroup = {
  /** Key under the `admin.navGroups` namespace. */
  labelKey: string;
  items: AdminNavItem[];
};

/** Sidebar structure and the capability each entry requires (PROMPT.md §14). */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    labelKey: 'general',
    items: [
      {
        href: '/admin',
        labelKey: 'dashboard',
        icon: 'LayoutDashboard',
        capability: 'viewLeads',
        exact: true,
      },
    ],
  },
  {
    labelKey: 'inbox',
    items: [
      { href: '/admin/leads', labelKey: 'leads', icon: 'Inbox', capability: 'viewLeads' },
      {
        href: '/admin/applications',
        labelKey: 'applications',
        icon: 'Briefcase',
        capability: 'viewLeads',
      },
      { href: '/admin/messages', labelKey: 'messages', icon: 'Mail', capability: 'viewLeads' },
      {
        href: '/admin/tests/attempts',
        labelKey: 'attempts',
        icon: 'ClipboardList',
        capability: 'viewTests',
      },
    ],
  },
  {
    labelKey: 'content',
    items: [
      {
        href: '/admin/hero',
        labelKey: 'hero',
        icon: 'Presentation',
        capability: 'contentCrud',
      },
      {
        href: '/admin/home-sections',
        labelKey: 'homeSections',
        icon: 'Rows3',
        capability: 'contentCrud',
      },
      {
        href: '/admin/courses',
        labelKey: 'courses',
        icon: 'GraduationCap',
        capability: 'contentCrud',
      },
      { href: '/admin/teachers', labelKey: 'teachers', icon: 'Users', capability: 'contentCrud' },
      {
        href: '/admin/success-stories',
        labelKey: 'successStories',
        icon: 'Trophy',
        capability: 'contentCrud',
      },
      {
        href: '/admin/testimonials',
        labelKey: 'testimonials',
        icon: 'Quote',
        capability: 'contentCrud',
      },
      {
        href: '/admin/advantages',
        labelKey: 'advantages',
        icon: 'Sparkles',
        capability: 'contentCrud',
      },
      {
        href: '/admin/problems',
        labelKey: 'problems',
        icon: 'Puzzle',
        capability: 'contentCrud',
      },
      {
        href: '/admin/promotions',
        labelKey: 'promotions',
        icon: 'Gift',
        capability: 'contentCrud',
      },
      {
        href: '/admin/stats',
        labelKey: 'stats',
        icon: 'ChartNoAxesColumn',
        capability: 'contentCrud',
      },
      {
        href: '/admin/faq',
        labelKey: 'faq',
        icon: 'MessageCircleQuestion',
        capability: 'contentCrud',
      },
      { href: '/admin/posts', labelKey: 'posts', icon: 'Newspaper', capability: 'contentCrud' },
    ],
  },
  {
    labelKey: 'library',
    items: [
      {
        href: '/admin/materials',
        labelKey: 'materials',
        icon: 'FileText',
        capability: 'contentCrud',
      },
      {
        href: '/admin/material-groups',
        labelKey: 'materialGroups',
        icon: 'FolderTree',
        capability: 'contentCrud',
      },
      {
        href: '/admin/tests',
        labelKey: 'tests',
        icon: 'ListChecks',
        capability: 'manageTests',
      },
    ],
  },
  {
    labelKey: 'careers',
    items: [
      {
        href: '/admin/vacancies',
        labelKey: 'vacancies',
        icon: 'Briefcase',
        capability: 'contentCrud',
      },
      {
        href: '/admin/hiring-steps',
        labelKey: 'hiringSteps',
        icon: 'ListOrdered',
        capability: 'contentCrud',
      },
    ],
  },
  {
    labelKey: 'settings',
    items: [
      { href: '/admin/branches', labelKey: 'branches', icon: 'MapPin', capability: 'contentCrud' },
      {
        href: '/admin/navigation',
        labelKey: 'navigation',
        icon: 'Menu',
        capability: 'contentCrud',
      },
      { href: '/admin/media', labelKey: 'media', icon: 'Image', capability: 'contentCrud' },
      {
        href: '/admin/settings',
        labelKey: 'settings',
        icon: 'Settings',
        capability: 'manageSettings',
      },
      {
        href: '/admin/users',
        labelKey: 'users',
        icon: 'UserCog',
        capability: 'manageUsers',
      },
      { href: '/admin/audit', labelKey: 'audit', icon: 'ScrollText', capability: 'viewAudit' },
    ],
  },
];

export const ALL_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items);
