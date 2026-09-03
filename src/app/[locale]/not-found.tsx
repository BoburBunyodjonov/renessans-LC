import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function LocaleNotFound() {
  const t = useTranslations('common');
  const tNav = useTranslations('nav');

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <p className="stat-numeral text-brand-500">404</p>
      <h1 className="text-3xl md:text-4xl">{t('notFound')}</h1>
      <Button size="lg" asChild>
        <Link href="/">{tNav('home')}</Link>
      </Button>
    </Container>
  );
}
