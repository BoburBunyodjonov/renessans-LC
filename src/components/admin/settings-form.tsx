'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminFormShell } from '@/components/admin/form-shell';
import { Panel, PanelTitle } from '@/components/admin/ui';
import { Input, Label } from '@/components/ui/field';
import { LocalizedEditor, LocalizedInput, LocalizedList } from '@/components/admin/localized-input';
import { MediaPicker } from '@/components/admin/media-picker';
import { saveSettings, type SettingsInput } from '@/server/actions/settings';
import { DEFAULT_LOCALE, type Localized } from '@/types/i18n';

type Values = {
  brandName: Localized;
  tagline: Localized;
  primaryCtaLabel: Localized;
  primaryCtaHref: string;
  externalLmsLabel: string;
  externalLmsUrl: string;
  phones: string[];
  email: string;
  socials: Record<string, string>;
  tickerItems: Localized[];
  currency: string;
  ga4Id: string;
  metaPixelId: string;
  yandexMetricaId: string;
  telegramChatIds: Record<string, string>;
  privacyPolicy: Localized;
  madeByLabel: Localized;
  madeByUrl: string;
  logoLightUrl: string;
  ogImageUrl: string;
};

const SOCIAL_KEYS = ['telegram', 'instagram', 'youtube', 'facebook', 'tiktok', 'whatsapp'] as const;
const TELEGRAM_KEYS: [string, string][] = [
  ['lead', 'settings.telegramLead'],
  ['application', 'settings.telegramApplication'],
  ['contact', 'settings.telegramContact'],
  ['test', 'settings.telegramTest'],
];

const inputTheme = 'border-admin-border bg-admin-panel text-admin-text';

export function SettingsForm({ initial }: { initial: Values }) {
  const t = useTranslations('admin');
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }

  return (
    <AdminFormShell
      dirty={dirty}
      previewHref={`/${DEFAULT_LOCALE}`}
      onSave={async () => {
        const result = await saveSettings(values as unknown as SettingsInput);
        if (result.ok) setDirty(false);
        return result;
      }}
    >
      <Panel className="flex flex-col gap-5">
        <PanelTitle>{t('settings.brand')}</PanelTitle>
        <LocalizedInput
          id="brandName"
          label={t('settings.brandName')}
          value={values.brandName}
          onChange={(value) => update('brandName', value)}
          required
        />
        <LocalizedInput
          id="tagline"
          label={t('settings.tagline')}
          value={values.tagline}
          onChange={(value) => update('tagline', value)}
        />
        <MediaPicker
          label={t('settings.logo')}
          folder="brand"
          value={values.logoLightUrl || null}
          onChange={(url) => update('logoLightUrl', url ?? '')}
        />
        <MediaPicker
          label={t('settings.ogImage')}
          folder="brand"
          value={values.ogImageUrl || null}
          onChange={(url) => update('ogImageUrl', url ?? '')}
        />
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle>{t('settings.ctaAndLms')}</PanelTitle>
        <LocalizedInput
          id="primaryCtaLabel"
          label={t('settings.ctaLabel')}
          value={values.primaryCtaLabel}
          onChange={(value) => update('primaryCtaLabel', value)}
        />
        <Field
          label={t('settings.ctaHref')}
          value={values.primaryCtaHref}
          onChange={(value) => update('primaryCtaHref', value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('settings.lmsLabel')}
            value={values.externalLmsLabel}
            onChange={(value) => update('externalLmsLabel', value)}
          />
          <Field
            label={t('settings.lmsUrl')}
            value={values.externalLmsUrl}
            onChange={(value) => update('externalLmsUrl', value)}
          />
        </div>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle>{t('settings.contact')}</PanelTitle>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-admin-text">{t('settings.phones')}</Label>
            <button
              type="button"
              onClick={() => update('phones', [...values.phones, ''])}
              className="text-xs font-bold text-brand-600 dark:text-admin-accent"
            >
              + {t('common.add')}
            </button>
          </div>
          {values.phones.map((phone, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={phone}
                onChange={(event) =>
                  update(
                    'phones',
                    values.phones.map((item, i) => (i === index ? event.target.value : item)),
                  )
                }
                className={inputTheme}
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    'phones',
                    values.phones.filter((_, i) => i !== index),
                  )
                }
                className="px-3 text-xs font-bold text-danger dark:text-admin-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <Field
          label={t('settings.email')}
          value={values.email}
          onChange={(value) => update('email', value)}
        />
        <Field
          label={t('settings.currency')}
          value={values.currency}
          onChange={(value) => update('currency', value)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map((key) => (
            <Field
              key={key}
              label={key[0]!.toUpperCase() + key.slice(1)}
              value={values.socials[key] ?? ''}
              onChange={(value) => update('socials', { ...values.socials, [key]: value })}
            />
          ))}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle hint={t('settings.tickerHint')}>{t('settings.ticker')}</PanelTitle>
        <LocalizedList
          id="tickerItems"
          label={t('settings.tickerItems')}
          value={values.tickerItems}
          onChange={(value) => update('tickerItems', value)}
        />
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle hint={t('settings.analyticsHint')}>{t('settings.analytics')}</PanelTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Google Analytics 4 ID"
            value={values.ga4Id}
            onChange={(value) => update('ga4Id', value)}
          />
          <Field
            label="Meta Pixel ID"
            value={values.metaPixelId}
            onChange={(value) => update('metaPixelId', value)}
          />
          <Field
            label="Yandex Metrica ID"
            value={values.yandexMetricaId}
            onChange={(value) => update('yandexMetricaId', value)}
          />
        </div>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle hint={t('settings.telegramHint')}>{t('settings.telegram')}</PanelTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {TELEGRAM_KEYS.map(([key, label]) => (
            <Field
              key={key}
              label={t(label)}
              value={values.telegramChatIds[key] ?? ''}
              onChange={(value) =>
                update('telegramChatIds', { ...values.telegramChatIds, [key]: value })
              }
            />
          ))}
        </div>
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle>{t('settings.privacy')}</PanelTitle>
        <LocalizedEditor
          id="privacyPolicy"
          label={t('settings.privacyText')}
          value={values.privacyPolicy}
          onChange={(value) => update('privacyPolicy', value)}
        />
      </Panel>

      <Panel className="flex flex-col gap-5">
        <PanelTitle>{t('settings.credit')}</PanelTitle>
        <LocalizedInput
          id="madeByLabel"
          label={t('settings.privacyText')}
          value={values.madeByLabel}
          onChange={(value) => update('madeByLabel', value)}
        />
        <Field
          label={t('settings.creditUrl')}
          value={values.madeByUrl}
          onChange={(value) => update('madeByUrl', value)}
        />
      </Panel>
    </AdminFormShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `settings-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-admin-text">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputTheme}
      />
    </div>
  );
}
