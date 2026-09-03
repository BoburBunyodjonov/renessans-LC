import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowRight } from 'lucide-react';
import { PageHeader, Panel, StatusPill } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Test savollari' };

const localizedUz = (value: unknown, fallback: string): string => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return fallback;
};

export default async function TestsPage() {
  const categories = await prisma.testCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { questions: true, attempts: true, bands: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Test savollari"
        description="Yo‘nalishni tanlab savollar bazasi va daraja chegaralarini tahrirlang."
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-admin-text">
                    {localizedUz(category.title, category.slug)}
                  </h2>
                  <p className="mt-0.5 text-sm text-admin-muted">{category.slug}</p>
                </div>
                <StatusPill tone={category.isPublished ? 'success' : 'neutral'}>
                  {category.isPublished ? 'Chop etilgan' : 'Yashirin'}
                </StatusPill>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm text-admin-muted">
                <div>
                  <dt className="text-xs uppercase">Savollar</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.questions}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">Darajalar</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.bands}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">Urinishlar</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.attempts}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/admin/tests/${category.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
              >
                Savollarni tahrirlash
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Panel>
          </li>
        ))}
      </ul>
    </>
  );
}
