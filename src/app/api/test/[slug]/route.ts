import type { NextRequest } from 'next/server';
import { fail, logError, ok, requestId, serverError } from '@/lib/api';
import { getTestRunner } from '@/server/queries/tests';
import { isLocale, DEFAULT_LOCALE } from '@/types/i18n';

export const runtime = 'nodejs';

/**
 * Public question bank. `isCorrect` is never selected by the query behind this
 * route — answers are graded server-side by `/submit` (PROMPT.md §8).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const id = requestId();
  const { slug } = await params;

  const requested = request.nextUrl.searchParams.get('locale') ?? DEFAULT_LOCALE;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;

  try {
    const runner = await getTestRunner(slug, locale);
    if (!runner || runner.questions.length === 0) {
      return fail('NOT_FOUND', 'Test not found', 404);
    }
    return ok(runner);
  } catch (error) {
    logError('api/test', id, error);
    return serverError(id);
  }
}
