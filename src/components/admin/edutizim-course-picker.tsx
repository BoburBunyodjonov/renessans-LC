'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input, Label } from '@/components/ui/field';
import { listEdutizimCourses } from '@/server/actions/edutizim';
import type { EdutizimCourse } from '@/server/services/edutizim';

/**
 * Which EduTizim course and level a band files its students under.
 *
 * These used to be two boxes for pasting Mongo ids, on the reasoning that the
 * site had no way to browse them. It does now, so the ids are picked from the
 * school's own course list — and if that list cannot be fetched (the connection
 * is not set up yet, or EduTizim is down) the boxes come back, because a band
 * saved with a hand-copied id is still better than a band that cannot be saved.
 */
export function EdutizimCoursePicker({
  courseId,
  subCourseId,
  onChange,
}: {
  courseId: string | null;
  subCourseId: string | null;
  onChange: (next: { courseId: string | null; subCourseId: string | null }) => void;
}) {
  const t = useTranslations('admin');
  const [courses, setCourses] = useState<EdutizimCourse[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    listEdutizimCourses({})
      .then((result) => {
        if (!live) return;
        if (result.ok && result.data) setCourses(result.data);
        else setFailed(true);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, []);

  const selected = courses?.find((course) => course._id === courseId);

  if (failed || !courses) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Raw
            id="band-edu-course"
            label={t('tests.edutizimCourseId')}
            value={courseId}
            onChange={(next) => onChange({ courseId: next, subCourseId })}
          />
          <Raw
            id="band-edu-sub"
            label={t('tests.edutizimSubCourseId')}
            value={subCourseId}
            onChange={(next) => onChange({ courseId, subCourseId: next })}
          />
        </div>
        <p className="text-xs text-admin-muted">
          {failed ? t('tests.edutizimOffline') : t('common.loading')}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="band-edu-course" className="text-admin-text">
            {t('tests.edutizimCourseId')}
          </Label>
          <select
            id="band-edu-course"
            value={courseId ?? ''}
            // Changing the course invalidates the level under it, which would
            // otherwise travel on and place the student in the wrong group.
            onChange={(event) =>
              onChange({ courseId: event.target.value || null, subCourseId: null })
            }
            className="h-11 rounded-xl border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
          >
            <option value="">—</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="band-edu-sub" className="text-admin-text">
            {t('tests.edutizimSubCourseId')}
          </Label>
          <select
            id="band-edu-sub"
            value={subCourseId ?? ''}
            disabled={!selected || selected.courses.length === 0}
            onChange={(event) => onChange({ courseId, subCourseId: event.target.value || null })}
            className="h-11 rounded-xl border border-admin-border bg-admin-panel px-3 text-sm text-admin-text disabled:opacity-50"
          >
            <option value="">
              {selected && selected.courses.length === 0 ? t('tests.edutizimNoLevels') : '—'}
            </option>
            {selected?.courses.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-admin-muted">{t('tests.edutizimHint')}</p>
    </>
  );
}

function Raw({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-admin-text">
        {label}
      </Label>
      <Input
        id={id}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || null)}
        placeholder="674817471cd113e973f7eb9a"
        className="border-admin-border bg-admin-panel text-admin-text"
      />
    </div>
  );
}
