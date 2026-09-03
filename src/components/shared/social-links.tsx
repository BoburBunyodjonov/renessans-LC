import type { SVGProps } from 'react';
import type { SocialKey, SocialLinks } from '@/types/content';
import { cn } from '@/lib/utils';
import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
} from '@/components/shared/brand-icons';

const ICONS: Record<SocialKey, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  telegram: TelegramIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
};

const LABELS: Record<SocialKey, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  youtube: 'YouTube',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
};

const ORDER: SocialKey[] = ['telegram', 'instagram', 'youtube', 'facebook', 'tiktok', 'whatsapp'];

export function SocialLinksRow({
  socials,
  className,
  itemClassName,
  size = 'md',
}: {
  socials: SocialLinks;
  className?: string;
  itemClassName?: string;
  size?: 'sm' | 'md';
}) {
  const entries = ORDER.filter((key) => Boolean(socials[key]));
  if (entries.length === 0) return null;

  return (
    <ul className={cn('flex items-center gap-2', className)}>
      {entries.map((key) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={socials[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LABELS[key]}
              className={cn(
                'inline-flex items-center justify-center rounded-full border border-ink-300/60 text-ink-600 transition-colors hover:border-brand-600 hover:text-brand-600',
                size === 'sm' ? 'size-9' : 'size-10',
                itemClassName,
              )}
            >
              <Icon className="size-[18px]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
