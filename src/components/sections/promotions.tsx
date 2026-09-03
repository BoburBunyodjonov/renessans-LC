'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Gift, Medal, Trophy } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Reveal } from '@/components/shared/reveal';
import { CtaButton } from '@/components/shared/cta-button';
import type { PromotionView } from '@/types/content';

const PLACE_ICONS = [Trophy, Medal, Gift];

function useCountdown(target: string) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (remaining === null) return null;
  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    minutes: Math.floor((remaining % 3_600_000) / 60_000),
    seconds: Math.floor((remaining % 60_000) / 1000),
  };
}

export function PromotionsSection({ promotion }: { promotion: PromotionView | null }) {
  const t = useTranslations('home');
  const countdown = useCountdown(promotion?.endsAt ?? new Date().toISOString());

  if (!promotion) return null;

  return (
    <section
      id="promotions"
      className="relative overflow-hidden bg-brand-600 py-16 text-white md:py-24"
    >
      {promotion.imageUrl ? (
        <Image
          src={promotion.imageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-15"
        />
      ) : null}

      <Container className="relative z-10">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.18em] text-white uppercase">
            {t('sectionPromotions')}
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl text-white md:text-4xl lg:text-5xl">
            {promotion.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white md:text-lg">{promotion.description}</p>
        </Reveal>

        {promotion.prizes.length > 0 ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {promotion.prizes.map((prize, index) => {
              const PrizeIcon = PLACE_ICONS[Math.min(index, PLACE_ICONS.length - 1)]!;
              return (
                <li
                  key={`${prize.place}-${prize.label}`}
                  className="flex items-center gap-4 rounded-lg bg-black/20 p-5"
                >
                  <PrizeIcon className="size-8 shrink-0" aria-hidden />
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase">{prize.place}</p>
                    <p className="font-display text-lg font-extrabold">{prize.label}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <CtaButton source="PROMOTION" variant="white" size="lg">
            {promotion.ctaLabel ?? t('heroCta')}
          </CtaButton>

          {countdown ? (
            <ul className="flex gap-2" aria-hidden>
              {[countdown.days, countdown.hours, countdown.minutes, countdown.seconds].map(
                (value, index) => (
                  <li
                    key={index}
                    className="grid min-w-14 place-items-center rounded-md bg-black/20 px-3 py-2"
                  >
                    <span className="font-display text-xl font-extrabold tabular-nums">
                      {String(value).padStart(2, '0')}
                    </span>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
