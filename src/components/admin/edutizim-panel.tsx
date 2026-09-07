'use client';

import { useState, useTransition, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Eye, EyeOff, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Panel, PanelTitle } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/field';
import {
  resolveEdutizimSurvey,
  testEdutizimConnection,
} from '@/server/actions/edutizim';
import type { EdutizimBranch } from '@/server/services/edutizim';

/**
 * Connecting the site to EduTizim, without anybody touching the server.
 *
 * The school reads one thing off their own EduTizim screens — the survey number
 * their surveys page prints, `s26` and the like. Everything else is discovered:
 * the key is proved against their branch list before it is saved, the branch is
 * picked from that list, and the survey number is exchanged for the id an order
 * is actually filed under. Nobody is asked to paste a Mongo id.
 *
 * The key itself is write-only here. What is stored was sealed on the server and
 * is never sent back, so this shows a masked hint and treats a blank field as
 * "leave it alone" — clearing it takes its own button.
 */

export type EdutizimValues = {
  enabled: boolean;
  baseUrl: string;
  organization: string;
  /** Only ever holds a freshly typed key on its way to the server. */
  apiKey: string;
  clearApiKey: boolean;
  surveyNumber: string;
  surveyId: string;
  branchId: string;
  scoreFieldId: string;
  levelFieldId: string;
  kindFieldId: string;
};

type CustomField = { _id: string; name: string };

export function EdutizimPanel({
  value,
  onChange,
  apiKeySet,
  apiKeyHint,
}: {
  value: EdutizimValues;
  onChange: (next: EdutizimValues) => void;
  /** Whether a key is already stored — the field starts blank either way. */
  apiKeySet: boolean;
  apiKeyHint: string;
}) {
  const t = useTranslations('admin');
  const [pending, startTransition] = useTransition();
  const [branches, setBranches] = useState<EdutizimBranch[] | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[] | null>(null);
  // A key being typed or generated is shown in the clear on purpose: it has to
  // be copied into EduTizim by hand, and it is gone from this page after saving.
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof EdutizimValues>(key: K, next: EdutizimValues[K]) =>
    onChange({ ...value, [key]: next });

  // Everything an order needs before one can be sent. Anything less and the
  // switch below is not a choice, it is a wrong answer waiting to happen.
  const complete = Boolean(
    value.baseUrl.trim() &&
      value.organization.trim() &&
      (value.apiKey.trim() || (apiKeySet && !value.clearApiKey)) &&
      value.surveyId.trim(),
  );

  /** What the lookups need: the typed key if there is one, else the stored one. */
  const draft = () => ({
    baseUrl: value.baseUrl,
    organization: value.organization,
    apiKey: value.apiKey || undefined,
  });

  function connect() {
    startTransition(async () => {
      const result = await testEdutizimConnection(draft());
      if (!result.ok || !result.data) {
        setBranches(null);
        setStatus({ ok: false, text: describe(result.ok ? undefined : result.error) });
        return;
      }

      setBranches(result.data);
      setStatus({ ok: true, text: t('settings.edutizimConnected', { count: result.data.length }) });
      // Proving the connection is as close to "I want this on" as anything the
      // school does here; leaving them a box to tick afterwards only produces
      // a fully configured integration that quietly sends nothing.
      if (value.surveyId) set('enabled', true);
    });
  }

  function resolveSurvey() {
    startTransition(async () => {
      const result = await resolveEdutizimSurvey({ ...draft(), surveyNumber: value.surveyNumber });
      if (!result.ok || !result.data) {
        setStatus({ ok: false, text: describe(result.ok ? undefined : result.error) });
        return;
      }

      const survey = result.data;
      setCustomFields(survey.customFields);
      onChange({
        ...value,
        enabled: true,
        surveyId: survey.surveyId,
        // A survey tied to a branch decides the branch; overriding it would only
        // produce an order EduTizim files somewhere else anyway.
        branchId: survey.branchId ?? value.branchId,
      });
      setStatus({ ok: true, text: t('settings.edutizimSurveyFound', { id: survey.surveyId }) });
    });
  }

  function describe(error: string | undefined): string {
    if (error === 'EDUTIZIM_INCOMPLETE') return t('settings.edutizimIncomplete');
    if (error === 'SURVEY_NOT_FOUND') return t('settings.edutizimSurveyMissing');
    return error ?? t('errors.unknown');
  }

  return (
    <Panel className="flex flex-col gap-5">
      <PanelTitle>{t('settings.edutizim')}</PanelTitle>
      <p className="text-sm text-admin-muted">{t('settings.edutizimHint')}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Text
          id="edu-base"
          label={t('settings.edutizimBaseUrl')}
          value={value.baseUrl}
          placeholder="https://backend.edutizim.uz"
          onChange={(next) => set('baseUrl', next)}
        />
        <Text
          id="edu-org"
          label={t('settings.edutizimOrg')}
          value={value.organization}
          placeholder="markaz"
          onChange={(next) => set('organization', next)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edu-key" className="text-admin-text">
          {t('settings.edutizimApiKey')}
        </Label>
        <div className="flex gap-2">
          <Input
            id="edu-key"
            type={revealed ? 'text' : 'password'}
            autoComplete="off"
            spellCheck={false}
            value={value.apiKey}
            placeholder={apiKeySet && !value.clearApiKey ? apiKeyHint : ''}
            onChange={(event) =>
              onChange({ ...value, apiKey: event.target.value, clearApiKey: false })
            }
            className="border-admin-border bg-admin-panel font-mono text-admin-text"
          />
          {value.apiKey ? (
            <>
              <IconButton
                label={revealed ? t('settings.edutizimKeyHide') : t('settings.edutizimKeyReveal')}
                onClick={() => setRevealed((current) => !current)}
              >
                {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </IconButton>
              <IconButton
                label={t('common.copyLink')}
                onClick={() => {
                  void navigator.clipboard.writeText(value.apiKey);
                  toast.success(t('common.copied'));
                }}
              >
                <Copy className="size-4" />
              </IconButton>
            </>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              onChange({ ...value, apiKey: generateKey(), clearApiKey: false });
              setRevealed(true);
            }}
            className="shrink-0 border-admin-border text-admin-text hover:bg-admin-panel hover:text-admin-text"
          >
            <Sparkles className="size-4" />
            {t('settings.edutizimKeyGenerate')}
          </Button>
        </div>
        <span className="text-xs text-admin-muted">
          {value.clearApiKey
            ? t('settings.edutizimKeyCleared')
            : apiKeySet
              ? t('settings.edutizimKeyStored')
              : t('settings.edutizimKeyHint')}
          {apiKeySet && !value.clearApiKey ? (
            <button
              type="button"
              onClick={() => onChange({ ...value, apiKey: '', clearApiKey: true })}
              className="ml-2 font-bold text-danger dark:text-admin-danger"
            >
              {t('settings.edutizimKeyClear')}
            </button>
          ) : null}
        </span>
        {/* A key is a shared secret: generating one here only does something
            once the same text is in EduTizim's own integration. Saying so at the
            moment the key appears is the only place anybody will read it. */}
        {value.apiKey ? (
          <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-ink-700 dark:bg-admin-hover dark:text-admin-text">
            {t('settings.edutizimKeyPasteThere')}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="dark" disabled={pending} onClick={connect}>
          <RefreshCw className={pending ? 'animate-spin' : ''} />
          {t('settings.edutizimTest')}
        </Button>
        {status ? (
          <span
            className={`text-sm font-semibold ${
              status.ok ? 'text-success' : 'text-danger dark:text-admin-danger'
            }`}
          >
            {status.ok ? <Check className="mr-1 inline size-4" /> : null}
            {status.text}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edu-survey" className="text-admin-text">
          {t('settings.edutizimSurveyNumber')}
        </Label>
        <div className="flex gap-2">
          <Input
            id="edu-survey"
            value={value.surveyNumber}
            placeholder="s26"
            onChange={(event) => set('surveyNumber', event.target.value)}
            className="border-admin-border bg-admin-panel text-admin-text"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || !value.surveyNumber.trim()}
            onClick={resolveSurvey}
            className="shrink-0 border-admin-border text-admin-text hover:bg-admin-panel hover:text-admin-text"
          >
            {t('settings.edutizimSurveyResolve')}
          </Button>
        </div>
        <span className="text-xs text-admin-muted">
          {value.surveyId
            ? t('settings.edutizimSurveyCurrent', { id: value.surveyId })
            : t('settings.edutizimSurveyHint')}
        </span>
      </div>

      {/* Until the connection is tested there is no list to choose from, so the
          stored branch stays visible as the only option rather than vanishing. */}
      <Choice
        id="edu-branch"
        label={t('settings.edutizimBranch')}
        value={value.branchId}
        options={branches ?? (value.branchId ? [{ _id: value.branchId, name: value.branchId }] : [])}
        emptyLabel={t('settings.edutizimPickAfterTest')}
        onChange={(next) => set('branchId', next)}
      />

      {/* Whether results are actually going anywhere. This used to be a
          checkbox above the fields, which made "configured" and "switched on"
          two separate things somebody had to get right in the correct order. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-admin-hover px-4 py-3">
        <span className="text-sm text-admin-text">
          {!complete
            ? t('settings.edutizimStatusIncomplete')
            : value.enabled
              ? t('settings.edutizimStatusOn')
              : t('settings.edutizimStatusOff')}
        </span>
        {complete ? (
          <button
            type="button"
            onClick={() => set('enabled', !value.enabled)}
            className="text-sm font-bold text-brand-600 dark:text-admin-accent"
          >
            {value.enabled ? t('settings.edutizimPause') : t('settings.edutizimResume')}
          </button>
        ) : null}
      </div>

      {/* Custom fields are optional in EduTizim: a survey without them still
          receives the score, in the comment the moderator reads first. Saying
          where they come from beats leaving three empty drop-downs and no clue
          which of the two systems is supposed to produce the options. */}
      <p className="text-sm text-admin-muted">{t('settings.edutizimFieldsHint')}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Choice
          id="edu-score"
          label={t('settings.edutizimScoreField')}
          value={value.scoreFieldId}
          options={customFields ?? []}
          emptyLabel={t('settings.edutizimNoCustomFields')}
          onChange={(next) => set('scoreFieldId', next)}
        />
        <Choice
          id="edu-level"
          label={t('settings.edutizimLevelField')}
          value={value.levelFieldId}
          options={customFields ?? []}
          emptyLabel={t('settings.edutizimNoCustomFields')}
          onChange={(next) => set('levelFieldId', next)}
        />
        <Choice
          id="edu-kind"
          label={t('settings.edutizimKindField')}
          value={value.kindFieldId}
          options={customFields ?? []}
          emptyLabel={t('settings.edutizimNoCustomFields')}
          onChange={(next) => set('kindFieldId', next)}
        />
      </div>
    </Panel>
  );
}

/**
 * A fresh key, 160 bits of it, from the browser's CSPRNG.
 *
 * It is only ever compared against itself — EduTizim stores the same string and
 * checks the header equals it — so the only property that matters is that
 * nobody can guess it. The prefix is there so that whoever finds this string in
 * a settings screen a year from now knows what it belongs to.
 */
function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `renessans-site-${hex}`;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="grid size-11 shrink-0 place-items-center rounded-xl border border-admin-border text-admin-muted hover:bg-admin-hover hover:text-admin-text"
    >
      {children}
    </button>
  );
}

function Text({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-admin-text">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="border-admin-border bg-admin-panel text-admin-text"
      />
    </div>
  );
}

function Choice({
  id,
  label,
  value,
  options,
  emptyLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { _id: string; name: string }[];
  emptyLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-admin-text">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
      >
        <option value="">{options.length > 0 ? '—' : emptyLabel}</option>
        {options.map((option) => (
          <option key={option._id} value={option._id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
