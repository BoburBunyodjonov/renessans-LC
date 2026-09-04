'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Check, Download, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Panel, PanelTitle, StatusPill } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/field';
import { LocalizedInput, LocalizedTextarea } from '@/components/admin/localized-input';
import { describeError } from '@/components/admin/form-shell';
import {
  deleteBand,
  deleteQuestion,
  importQuestionsCsv,
  saveBand,
  saveQuestion,
} from '@/server/actions/tests';
import { toCsv } from '@/lib/csv';
import { cn } from '@/lib/utils';
import type { Localized } from '@/types/i18n';

type Option = { id?: string; text: string; isCorrect: boolean };

type Question = {
  id: string;
  prompt: string;
  explanation: string | null;
  points: number;
  difficulty: number;
  isActive: boolean;
  options: Option[];
};

type Band = {
  id: string;
  minScore: number;
  maxScore: number;
  levelName: string;
  title: Localized;
  description: Localized;
  courseId: string | null;
};

const inputTheme = 'border-admin-border bg-admin-panel text-admin-text';
const EMPTY_LOCALIZED: Localized = { uz: '', ru: '', en: '' };

const blankQuestion = (): Question => ({
  id: '',
  prompt: '',
  explanation: '',
  points: 1,
  difficulty: 1,
  isActive: true,
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

export function QuestionBank({
  categoryId,
  slug,
  questions,
  bands,
  courses,
  canEdit,
}: {
  categoryId: string;
  slug: string;
  questions: Question[];
  bands: Band[];
  courses: { value: string; label: string }[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('admin');
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Question | null>(null);
  const [importing, setImporting] = useState(false);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(describeError(result.error ?? 'UNKNOWN_ERROR', t));
      }
    });
  }

  function exportCsv() {
    const csv = toCsv(
      questions.map((question) => {
        const row: Record<string, string | number> = {
          prompt: question.prompt.replace(/\n/g, '\\n'),
          points: question.points,
          difficulty: question.difficulty,
          correct: question.options.findIndex((option) => option.isCorrect) + 1,
        };
        question.options.forEach((option, index) => {
          row[`option${index + 1}`] = option.text;
        });
        return row;
      }),
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slug}-questions.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const result = await importQuestionsCsv(categoryId, text);
      if (result.ok) {
        toast.success(
          t('tests.imported', {
            imported: result.data?.imported ?? 0,
            skipped: result.data?.skipped ?? 0,
          }),
        );
        router.refresh();
      } else {
        toast.error(result.fields?.csv ?? describeError(result.error, t));
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PanelTitle hint={t('tests.csvHint')}>{t('tests.bank')}</PanelTitle>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              <Download aria-hidden />
              {t('tests.csvExport')}
            </Button>

            {canEdit ? (
              <>
                <label
                  className={cn(
                    'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-admin-border px-4 text-sm font-semibold text-admin-text hover:bg-admin-hover',
                    importing && 'pointer-events-none opacity-60',
                  )}
                >
                  {importing ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="size-4" aria-hidden />
                  )}
                  {t('tests.csvImport')}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void importCsv(file);
                      event.target.value = '';
                    }}
                  />
                </label>

                <Button size="sm" onClick={() => setEditing(blankQuestion())}>
                  <Plus aria-hidden />
                  {t('tests.question')}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <ol className="mt-4 flex flex-col gap-2">
          {questions.map((question, index) => (
            <li
              key={question.id}
              className="flex items-start gap-3 rounded-lg border border-admin-border p-3"
            >
              <span className="w-8 shrink-0 font-display text-sm font-extrabold text-admin-muted tabular-nums">
                {index + 1}.
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold whitespace-pre-line text-admin-text">
                  {question.prompt}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-muted">
                  {question.options.map((option) => (
                    <li
                      key={option.id ?? option.text}
                      className={cn(
                        'inline-flex items-center gap-1',
                        option.isCorrect && 'font-bold text-success',
                      )}
                    >
                      {option.isCorrect ? <Check className="size-3.5" aria-hidden /> : null}
                      {option.text}
                    </li>
                  ))}
                </ul>
              </div>

              {!question.isActive ? (
                <StatusPill tone="neutral">{t('tests.inactive')}</StatusPill>
              ) : null}

              {canEdit ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(question)}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t('tests.deleteQuestion'))) return;
                      run(() => deleteQuestion(question.id), t('common.deleted'));
                    }}
                    className="rounded-md px-1 text-danger hover:bg-danger/10"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>

        {questions.length === 0 ? (
          <p className="py-6 text-center text-sm text-admin-muted">{t('tests.noQuestions')}</p>
        ) : null}
      </Panel>

      {editing ? (
        <Panel className="flex flex-col gap-4">
          <PanelTitle>{editing.id ? t('tests.editQuestion') : t('tests.newQuestion')}</PanelTitle>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="q-prompt" className="text-admin-text">
              {t('tests.promptLabel')}
            </Label>
            <Textarea
              id="q-prompt"
              rows={3}
              value={editing.prompt}
              onChange={(event) => setEditing({ ...editing, prompt: event.target.value })}
              className={inputTheme}
            />
            <p className="text-xs text-admin-muted">{t('tests.promptHint')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-admin-text">{t('tests.options')}</Label>
            {editing.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-option"
                  aria-label={t('tests.correctOption', { index: index + 1 })}
                  className="size-4 accent-brand-600"
                  checked={option.isCorrect}
                  onChange={() =>
                    setEditing({
                      ...editing,
                      options: editing.options.map((item, i) => ({
                        ...item,
                        isCorrect: i === index,
                      })),
                    })
                  }
                />
                <Input
                  value={option.text}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      options: editing.options.map((item, i) =>
                        i === index ? { ...item, text: event.target.value } : item,
                      ),
                    })
                  }
                  className={inputTheme}
                />
                {editing.options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        options: editing.options.filter((_, i) => i !== index),
                      })
                    }
                    className="px-2 text-xs font-bold text-danger"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
            {editing.options.length < 5 ? (
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    ...editing,
                    options: [...editing.options, { text: '', isCorrect: false }],
                  })
                }
                className="self-start text-xs font-bold text-brand-600"
              >
                {t('tests.addOption')}
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q-points" className="text-admin-text">
                {t('tests.points')}
              </Label>
              <Input
                id="q-points"
                type="number"
                min={1}
                value={editing.points}
                onChange={(event) =>
                  setEditing({ ...editing, points: Number(event.target.value) || 1 })
                }
                className={inputTheme}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="q-difficulty" className="text-admin-text">
                {t('tests.difficulty')}
              </Label>
              <Input
                id="q-difficulty"
                type="number"
                min={1}
                max={5}
                value={editing.difficulty}
                onChange={(event) =>
                  setEditing({ ...editing, difficulty: Number(event.target.value) || 1 })
                }
                className={inputTheme}
              />
            </div>
            <label className="mt-7 flex items-center gap-2 text-sm text-admin-text">
              <input
                type="checkbox"
                className="size-4 accent-brand-600"
                checked={editing.isActive}
                onChange={(event) => setEditing({ ...editing, isActive: event.target.checked })}
              />
              {t('tests.active')}
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  () =>
                    saveQuestion(categoryId, editing.id || null, {
                      prompt: editing.prompt,
                      explanation: editing.explanation ?? '',
                      points: editing.points,
                      difficulty: editing.difficulty,
                      isActive: editing.isActive,
                      options: editing.options.filter((option) => option.text.trim()),
                    }),
                  t('common.saved'),
                )
              }
            >
              {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {t('common.save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(null)}
              className="text-admin-muted hover:bg-admin-hover"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </Panel>
      ) : null}

      <BandEditor
        categoryId={categoryId}
        bands={bands}
        courses={courses}
        canEdit={canEdit}
        pending={pending}
        onRun={run}
      />
    </div>
  );
}

function BandEditor({
  categoryId,
  bands,
  courses,
  canEdit,
  pending,
  onRun,
}: {
  categoryId: string;
  bands: Band[];
  courses: { value: string; label: string }[];
  canEdit: boolean;
  pending: boolean;
  onRun: (action: () => Promise<{ ok: boolean; error?: string }>, success: string) => void;
}) {
  const t = useTranslations('admin');
  const [draft, setDraft] = useState<Band | null>(null);

  return (
    <Panel className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <PanelTitle hint={t('tests.bandsHint')}>{t('tests.bands')}</PanelTitle>
        {canEdit ? (
          <Button
            size="sm"
            onClick={() =>
              setDraft({
                id: '',
                minScore: 0,
                maxScore: 10,
                levelName: '',
                title: { ...EMPTY_LOCALIZED },
                description: { ...EMPTY_LOCALIZED },
                courseId: null,
              })
            }
          >
            <Plus aria-hidden />
            {t('tests.band')}
          </Button>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {bands.map((band) => (
          <li
            key={band.id}
            className="flex items-center gap-3 rounded-lg border border-admin-border p-3"
          >
            <span className="w-24 font-display text-sm font-extrabold text-admin-text tabular-nums">
              {band.minScore}–{band.maxScore}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-admin-text">{band.levelName}</p>
              <p className="truncate text-xs text-admin-muted">{band.title.uz}</p>
            </div>
            {canEdit ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDraft(band)}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(t('tests.deleteBand'))) return;
                    onRun(() => deleteBand(band.id), t('common.deleted'));
                  }}
                  className="rounded-md px-1 text-danger"
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {draft ? (
        <div className="flex flex-col gap-4 rounded-lg border border-admin-border p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="band-min" className="text-admin-text">
                {t('tests.minScore')}
              </Label>
              <Input
                id="band-min"
                type="number"
                value={draft.minScore}
                onChange={(event) =>
                  setDraft({ ...draft, minScore: Number(event.target.value) || 0 })
                }
                className={inputTheme}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="band-max" className="text-admin-text">
                {t('tests.maxScore')}
              </Label>
              <Input
                id="band-max"
                type="number"
                value={draft.maxScore}
                onChange={(event) =>
                  setDraft({ ...draft, maxScore: Number(event.target.value) || 0 })
                }
                className={inputTheme}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="band-level" className="text-admin-text">
                {t('tests.levelName')}
              </Label>
              <Input
                id="band-level"
                value={draft.levelName}
                onChange={(event) => setDraft({ ...draft, levelName: event.target.value })}
                className={inputTheme}
              />
            </div>
          </div>

          <LocalizedInput
            id="band-title"
            label={t('tests.bandTitle')}
            value={draft.title}
            onChange={(title) => setDraft({ ...draft, title })}
          />
          <LocalizedTextarea
            id="band-description"
            label={t('tests.bandDescription')}
            rows={3}
            value={draft.description}
            onChange={(description) => setDraft({ ...draft, description })}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="band-course" className="text-admin-text">
              {t('tests.recommendedCourse')}
            </Label>
            <select
              id="band-course"
              value={draft.courseId ?? ''}
              onChange={(event) => setDraft({ ...draft, courseId: event.target.value || null })}
              className={cn(inputTheme, 'h-12 rounded-sm border px-3')}
            >
              <option value="">—</option>
              {courses.map((course) => (
                <option key={course.value} value={course.value}>
                  {course.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => {
                onRun(
                  () =>
                    saveBand(categoryId, draft.id || null, {
                      minScore: draft.minScore,
                      maxScore: draft.maxScore,
                      levelName: draft.levelName,
                      title: draft.title,
                      description: draft.description,
                      courseId: draft.courseId,
                    }),
                  t('common.saved'),
                );
                setDraft(null);
              }}
            >
              {t('common.save')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraft(null)}
              className="text-admin-muted hover:bg-admin-hover"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
