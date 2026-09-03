import type { Capability } from '@/lib/permissions';

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  capability: Capability;
  /** Matches child routes too. */
  exact?: boolean;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

/** Sidebar structure and the capability each entry requires (PROMPT.md §14). */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: 'Umumiy',
    items: [
      {
        href: '/admin',
        label: 'Boshqaruv paneli',
        icon: 'LayoutDashboard',
        capability: 'viewLeads',
        exact: true,
      },
    ],
  },
  {
    label: 'Murojaatlar',
    items: [
      { href: '/admin/leads', label: 'Arizalar', icon: 'Inbox', capability: 'viewLeads' },
      {
        href: '/admin/applications',
        label: 'Vakansiya arizalari',
        icon: 'Briefcase',
        capability: 'viewLeads',
      },
      { href: '/admin/messages', label: 'Xabarlar', icon: 'Mail', capability: 'viewLeads' },
      {
        href: '/admin/tests/attempts',
        label: 'Test natijalari',
        icon: 'ClipboardList',
        capability: 'viewTests',
      },
    ],
  },
  {
    label: 'Kontent',
    items: [
      {
        href: '/admin/hero',
        label: 'Hero slaydlar',
        icon: 'Presentation',
        capability: 'contentCrud',
      },
      {
        href: '/admin/home-sections',
        label: 'Bosh sahifa bloklari',
        icon: 'Rows3',
        capability: 'contentCrud',
      },
      {
        href: '/admin/courses',
        label: 'Kurslar',
        icon: 'GraduationCap',
        capability: 'contentCrud',
      },
      { href: '/admin/teachers', label: 'Ustozlar', icon: 'Users', capability: 'contentCrud' },
      {
        href: '/admin/success-stories',
        label: 'IELTS natijalari',
        icon: 'Trophy',
        capability: 'contentCrud',
      },
      { href: '/admin/testimonials', label: 'Fikrlar', icon: 'Quote', capability: 'contentCrud' },
      {
        href: '/admin/advantages',
        label: 'Afzalliklar',
        icon: 'Sparkles',
        capability: 'contentCrud',
      },
      {
        href: '/admin/problems',
        label: 'Muammo va yechimlar',
        icon: 'Puzzle',
        capability: 'contentCrud',
      },
      { href: '/admin/promotions', label: 'Aksiyalar', icon: 'Gift', capability: 'contentCrud' },
      {
        href: '/admin/stats',
        label: 'Statistika raqamlari',
        icon: 'ChartNoAxesColumn',
        capability: 'contentCrud',
      },
      {
        href: '/admin/faq',
        label: 'FAQ',
        icon: 'MessageCircleQuestion',
        capability: 'contentCrud',
      },
      { href: '/admin/posts', label: 'Blog', icon: 'Newspaper', capability: 'contentCrud' },
    ],
  },
  {
    label: 'Materiallar va test',
    items: [
      {
        href: '/admin/materials',
        label: 'Materiallar',
        icon: 'FileText',
        capability: 'contentCrud',
      },
      {
        href: '/admin/material-groups',
        label: 'Material bo‘limlari',
        icon: 'FolderTree',
        capability: 'contentCrud',
      },
      {
        href: '/admin/tests',
        label: 'Test savollari',
        icon: 'ListChecks',
        capability: 'manageTests',
      },
    ],
  },
  {
    label: 'Karyera',
    items: [
      {
        href: '/admin/vacancies',
        label: 'Vakansiyalar',
        icon: 'Briefcase',
        capability: 'contentCrud',
      },
      {
        href: '/admin/hiring-steps',
        label: 'Ishga qabul bosqichlari',
        icon: 'ListOrdered',
        capability: 'contentCrud',
      },
    ],
  },
  {
    label: 'Sozlamalar',
    items: [
      { href: '/admin/branches', label: 'Filiallar', icon: 'MapPin', capability: 'contentCrud' },
      { href: '/admin/navigation', label: 'Menyu', icon: 'Menu', capability: 'contentCrud' },
      { href: '/admin/media', label: 'Media', icon: 'Image', capability: 'contentCrud' },
      {
        href: '/admin/settings',
        label: 'Sayt sozlamalari',
        icon: 'Settings',
        capability: 'manageSettings',
      },
      {
        href: '/admin/users',
        label: 'Foydalanuvchilar',
        icon: 'UserCog',
        capability: 'manageUsers',
      },
      { href: '/admin/audit', label: 'Audit jurnali', icon: 'ScrollText', capability: 'viewAudit' },
    ],
  },
];

export const ALL_NAV_ITEMS = ADMIN_NAV.flatMap((group) => group.items);
