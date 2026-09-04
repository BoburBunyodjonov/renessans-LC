import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/admin/login-form';

export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('signIn') };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="grid size-11 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white"
          >
            R
          </span>
          <div>
            <p className="font-display text-lg leading-tight font-extrabold text-ink-900 dark:text-white">
              Renessans Admin
            </p>
            <p className="text-sm text-ink-600 dark:text-white/60">Boshqaruv paneli</p>
          </div>
        </div>

        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
