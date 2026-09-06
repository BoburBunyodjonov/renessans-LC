'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  actionError,
  requireCapability,
  revalidate,
  writeAudit,
  type ActionResult,
} from '@/server/actions/helpers';

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1).max(400),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  explanation: z.string().trim().max(1000).optional().or(z.literal('')),
  points: z.number().int().min(1).max(20),
  difficulty: z.number().int().min(1).max(5),
  isActive: z.boolean(),
  answerType: z.enum(['CHOICE', 'TEXT']),
  // A written question is graded against these instead of options.
  acceptedAnswers: z.array(z.string().trim().max(400)).max(20),
  imageUrl: z.string().trim().max(300).optional().or(z.literal('')),
  options: z.array(optionSchema).max(5),
});

export type QuestionInput = z.infer<typeof questionSchema>;

export async function saveQuestion(
  categoryId: string,
  questionId: string | null,
  input: QuestionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireCapability('manageTests');
    const parsed = questionSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'VALIDATION_ERROR' };

    const data = parsed.data;
    const isText = data.answerType === 'TEXT';

    // A question nobody can answer correctly is a scoring bug waiting to
    // happen, so each kind is checked for the answer it is graded against.
    if (isText) {
      if (data.acceptedAnswers.filter((answer) => answer.trim()).length === 0) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          fields: { acceptedAnswers: 'Kamida bitta to‘g‘ri javob kiriting' },
        };
      }
    } else {
      if (data.options.length < 2) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          fields: { options: 'Kamida ikkita variant kerak' },
        };
      }
      if (!data.options.some((option) => option.isCorrect)) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          fields: { options: 'To‘g‘ri javobni belgilang' },
        };
      }
    }

    const base = {
      prompt: data.prompt,
      explanation: data.explanation || null,
      points: data.points,
      difficulty: data.difficulty,
      isActive: data.isActive,
      answerType: data.answerType,
      acceptedAnswers: isText ? data.acceptedAnswers.filter((answer) => answer.trim()) : [],
      imageUrl: data.imageUrl || null,
    };
    // A written question carries no options; a choice keeps only its own.
    const options = isText ? [] : data.options;

    let id = questionId;

    if (questionId) {
      // Options are rewritten wholesale — simpler and safer than diffing.
      await prisma.$transaction([
        prisma.testQuestion.update({ where: { id: questionId }, data: base }),
        prisma.testOption.deleteMany({ where: { questionId } }),
        prisma.testOption.createMany({
          data: options.map((option, index) => ({
            questionId,
            text: option.text,
            isCorrect: option.isCorrect,
            order: index + 1,
          })),
        }),
      ]);
    } else {
      const last = await prisma.testQuestion.findFirst({
        where: { categoryId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const created = await prisma.testQuestion.create({
        data: {
          ...base,
          categoryId,
          order: (last?.order ?? 0) + 1,
          options: {
            create: options.map((option, index) => ({
              text: option.text,
              isCorrect: option.isCorrect,
              order: index + 1,
            })),
          },
        },
        select: { id: true },
      });
      id = created.id;
    }

    await writeAudit({
      userId: user.id,
      action: questionId ? 'UPDATE' : 'CREATE',
      entity: 'TestQuestion',
      entityId: id,
    });
    await revalidate(['tests']);
    revalidatePath('/admin/tests');

    return { ok: true, data: { id: id! } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageTests');
    await prisma.testQuestion.delete({ where: { id } });
    await writeAudit({ userId: user.id, action: 'DELETE', entity: 'TestQuestion', entityId: id });
    await revalidate(['tests']);
    revalidatePath('/admin/tests');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function reorderQuestions(orderedIds: string[]): Promise<ActionResult> {
  try {
    await requireCapability('manageTests');
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.testQuestion.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    await revalidate(['tests']);
    revalidatePath('/admin/tests');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

const bandSchema = z.object({
  minScore: z.number().int().min(0).max(1000),
  maxScore: z.number().int().min(0).max(1000),
  levelName: z.string().trim().min(1).max(60),
  title: z.object({ uz: z.string(), ru: z.string(), en: z.string() }),
  description: z.object({ uz: z.string(), ru: z.string(), en: z.string() }),
  courseId: z.string().nullable().optional(),
});

export async function saveBand(
  categoryId: string,
  bandId: string | null,
  input: z.infer<typeof bandSchema>,
): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageTests');
    const parsed = bandSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'VALIDATION_ERROR' };

    const data = {
      minScore: parsed.data.minScore,
      maxScore: parsed.data.maxScore,
      levelName: parsed.data.levelName,
      title: parsed.data.title,
      description: parsed.data.description,
      courseId: parsed.data.courseId || null,
    };

    if (bandId) {
      await prisma.testLevelBand.update({ where: { id: bandId }, data });
    } else {
      await prisma.testLevelBand.create({ data: { ...data, categoryId } });
    }

    await writeAudit({
      userId: user.id,
      action: bandId ? 'UPDATE' : 'CREATE',
      entity: 'TestLevelBand',
      entityId: bandId,
    });
    await revalidate(['tests']);
    revalidatePath('/admin/tests');

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteBand(id: string): Promise<ActionResult> {
  try {
    await requireCapability('manageTests');
    await prisma.testLevelBand.delete({ where: { id } });
    await revalidate(['tests']);
    revalidatePath('/admin/tests');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Bulk import. Expected columns:
 * `prompt, option1..option5, correct (1-based), points?, difficulty?`
 * Existing questions are kept; imported rows are appended.
 */
export async function importQuestionsCsv(
  categoryId: string,
  csv: string,
): Promise<ActionResult<{ imported: number; skipped: number }>> {
  try {
    const user = await requireCapability('manageTests');

    const lines = csv
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim());
    if (lines.length < 2) return { ok: false, error: 'VALIDATION_ERROR' };

    const header = splitCsvLine(lines[0]!).map((cell) => cell.trim().toLowerCase());
    const indexOf = (name: string) => header.indexOf(name);

    const promptIndex = indexOf('prompt');
    const correctIndex = indexOf('correct');
    if (promptIndex === -1 || correctIndex === -1) {
      return {
        ok: false,
        error: 'VALIDATION_ERROR',
        fields: { csv: 'prompt va correct ustunlari kerak' },
      };
    }

    const optionIndexes = [1, 2, 3, 4, 5]
      .map((number) => indexOf(`option${number}`))
      .filter((index) => index !== -1);

    const last = await prisma.testQuestion.findFirst({
      where: { categoryId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    let order = last?.order ?? 0;

    let imported = 0;
    let skipped = 0;

    for (const line of lines.slice(1)) {
      const cells = splitCsvLine(line);
      const prompt = cells[promptIndex]?.trim();
      const options = optionIndexes
        .map((index) => cells[index]?.trim())
        .filter((text): text is string => Boolean(text));
      const correct = Number(cells[correctIndex]);

      if (
        !prompt ||
        options.length < 2 ||
        !Number.isFinite(correct) ||
        correct < 1 ||
        correct > options.length
      ) {
        skipped += 1;
        continue;
      }

      order += 1;
      await prisma.testQuestion.create({
        data: {
          categoryId,
          prompt: prompt.replace(/\\n/g, '\n'),
          points: Number(cells[indexOf('points')] ?? 1) || 1,
          difficulty: Number(cells[indexOf('difficulty')] ?? 1) || 1,
          order,
          options: {
            create: options.map((text, index) => ({
              text,
              isCorrect: index === correct - 1,
              order: index + 1,
            })),
          },
        },
      });
      imported += 1;
    }

    await writeAudit({
      userId: user.id,
      action: 'CREATE',
      entity: 'TestQuestion',
      diff: { imported, skipped, categoryId },
    });
    await revalidate(['tests']);
    revalidatePath('/admin/tests');

    return { ok: true, data: { imported, skipped } };
  } catch (error) {
    return actionError(error);
  }
}

/** Minimal CSV line splitter with quote support. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}
