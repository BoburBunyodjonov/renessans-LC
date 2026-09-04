import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { PageHeader, Panel, StatusPill } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.tests') };
}

const localizedUz = (value: unknown, fallback: string): string => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const uz = (value as Record<string, unknown>).uz;
    if (typeof uz === 'string' && uz.trim()) return uz;
  }
  return fallback;
};

export default async function TestsPage() {
  const t = await getTranslations('admin');
  const categories = await prisma.testCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { questions: true, attempts: true, bands: true } },
    },
  });

  return (
    <>
      <PageHeader title={t('nav.tests')} description={t('tests.description')} />

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
                  {category.isPublished ? t('common.published') : t('common.hidden')}
                </StatusPill>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm text-admin-muted">
                <div>
                  <dt className="text-xs uppercase">{t('tests.questions')}</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.questions}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">{t('tests.levels')}</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.bands}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase">{t('tests.attempts')}</dt>
                  <dd className="font-display text-xl font-extrabold text-admin-text tabular-nums">
                    {category._count.attempts}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/admin/tests/${category.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 dark:text-admin-accent dark:hover:text-admin-accent"
              >
                {t('tests.editQuestions')}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Panel>
          </li>
        ))}
      </ul>
    </>
  );
}
