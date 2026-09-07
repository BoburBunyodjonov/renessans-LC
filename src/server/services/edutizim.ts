import 'server-only';

import { buildOrderBody, type EdutizimConfig, type OrderInput } from '@/lib/edutizim-payload';
import { open as openSecret } from '@/lib/secret-box';

/**
 * Talks to EduTizim's public "LeadSite" intake on behalf of the school.
 *
 * That intake authenticates on two headers rather than a token, deduplicates the
 * student by phone, and drops the order into the first kanban column for a
 * moderator to pick up:
 *
 *   POST {base}/student/order
 *   organization: <org username>
 *   apikey: <LeadSite integration key>
 *
 * The same pair of headers opens three read-only endpoints, which is what lets
 * the admin panel offer real branches and courses to choose from instead of
 * asking somebody to paste Mongo ids they copied out of a URL.
 *
 * Credentials come from the settings row, so a school connects itself without
 * anyone touching the server. Environment variables still work and win nothing:
 * they are the fallback, which keeps a single-tenant deployment configured the
 * old way running untouched.
 */

/** EduTizim allows one order per five seconds, so calls are cheap but not free. */
const REQUEST_TIMEOUT_MS = 10_000;

export const DEFAULT_BASE_URL = 'https://backend.edutizim.uz';

export type SendResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; retryable: boolean };

type Credentials = {
  baseUrl: string;
  organization: string;
  apiKey: string;
};

/** A connection the admin is still typing: no key means "keep the stored one". */
export type CredentialDraft = {
  baseUrl?: string | null;
  organization?: string | null;
  apiKey?: string | null;
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Settings first, environment second.
 *
 * A half-filled draft is not a connection: an organisation with no key would
 * otherwise silently borrow the key from the environment and file another
 * school's students under this one's name.
 */
export function resolveCredentials(
  config: EdutizimConfig,
  draft?: CredentialDraft,
): Credentials | null {
  const stored = config.apiKeySealed ? openSecret(config.apiKeySealed) : null;

  const baseUrl = draft?.baseUrl?.trim() || config.baseUrl || process.env.EDUTIZIM_BASE_URL?.trim();
  const organization =
    draft?.organization?.trim() || config.organization || process.env.EDUTIZIM_ORG?.trim();
  const apiKey = draft?.apiKey?.trim() || stored || process.env.EDUTIZIM_API_KEY?.trim();

  if (!baseUrl || !organization || !apiKey) return null;
  return { baseUrl: trimSlash(baseUrl), organization, apiKey };
}

type CallResult<T> = { ok: true; data: T } | { ok: false; error: string; retryable: boolean };

async function call<T>(
  credentials: Credentials,
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown },
): Promise<CallResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${credentials.baseUrl}/student${path}`, {
      method: init.method,
      headers: {
        'Content-Type': 'application/json',
        organization: credentials.organization,
        apikey: credentials.apiKey,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok) {
      // 429 is their one-per-five-seconds limit and 5xx is their side being
      // unwell; both are worth another go. A 4xx means the request is wrong,
      // and retrying it would just fail again.
      return {
        ok: false,
        error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
        retryable: response.status === 429 || response.status >= 500,
      };
    }

    return { ok: true, data: unwrap(text) as T };
  } catch (error) {
    // A timeout or a DNS failure says nothing about the request, so it is worth
    // retrying later.
    return { ok: false, error: describe(error).slice(0, 200), retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

/** Every reply is `{ code, message, data }`; only `data` is ours. */
function unwrap(text: string): unknown {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return (parsed as { data: unknown }).data;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Posts the order. Never throws: the caller has already stored the attempt, and
 * a delivery failure must not lose it or fail the visitor's submission.
 */
export async function sendOrder(config: EdutizimConfig, input: OrderInput): Promise<SendResult> {
  const credentials = resolveCredentials(config);
  if (!credentials) return { ok: false, error: 'EDUTIZIM_NOT_CONFIGURED', retryable: false };
  if (!config.enabled) return { ok: false, error: 'DISABLED', retryable: false };
  if (!config.surveyId) return { ok: false, error: 'SURVEY_NOT_SET', retryable: false };

  const result = await call<unknown>(credentials, '/order', {
    method: 'POST',
    body: buildOrderBody(config, input),
  });

  if (!result.ok) return result;
  return { ok: true, orderId: readOrderId(result.data) };
}

export type EdutizimBranch = { _id: string; name: string };
export type EdutizimCourse = { _id: string; name: string; courses: EdutizimBranch[] };
export type EdutizimSurvey = {
  surveyId: string;
  title: string;
  branchId: string | null;
  customFields: { _id: string; name: string }[];
};

/** The connection test: the cheapest call that proves the key belongs to the org. */
export function fetchBranches(credentials: Credentials) {
  return call<EdutizimBranch[]>(credentials, '/branches', { method: 'GET' });
}

/** Courses and their levels, for the drop-downs a band is mapped with. */
export function fetchCourses(credentials: Credentials, branchId?: string | null) {
  return call<EdutizimCourse[]>(credentials, '/courses', {
    method: 'POST',
    body: branchId ? { branchId } : {},
  });
}

/**
 * Turns the `s26` printed on the school's own surveys page into the id an order
 * is filed under — and, when the survey defines them, the custom fields a score
 * can be written into.
 */
export async function fetchSurvey(
  credentials: Credentials,
  surveyNumber: string,
): Promise<CallResult<EdutizimSurvey>> {
  const query = encodeURIComponent(surveyNumber.trim());
  const result = await call<Record<string, unknown>>(credentials, `/details?survey=${query}`, {
    method: 'GET',
  });
  if (!result.ok) return result;

  const data = result.data ?? {};
  const surveyId = typeof data.surveyId === 'string' ? data.surveyId : '';
  if (!surveyId) return { ok: false, error: 'SURVEY_NOT_FOUND', retryable: false };

  const settings = (data.settings ?? {}) as Record<string, unknown>;
  const branch = (data.branch ?? null) as { _id?: unknown } | null;
  const raw = Array.isArray(settings.customFields) ? settings.customFields : [];

  return {
    ok: true,
    data: {
      surveyId,
      title: typeof settings.subTitle === 'string' ? settings.subTitle : '',
      branchId: typeof branch?._id === 'string' ? branch._id : null,
      customFields: raw.flatMap((field) => {
        const item = field as { _id?: unknown; name?: unknown };
        return typeof item._id === 'string'
          ? [{ _id: item._id, name: typeof item.name === 'string' ? item.name : item._id }]
          : [];
      }),
    },
  };
}

/**
 * The handler replies with the new order's id, but through a `reply.success()`
 * wrapper whose exact shape is not part of any contract — so the id is looked
 * for in the shapes it plausibly takes, and its absence is not an error. The
 * order exists either way; only our link back to it is missing.
 */
function readOrderId(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['_id', 'id', 'orderId']) {
      const value = record[key];
      if (typeof value === 'string') return value;
    }
  }
  return '';
}

/** `fetch failed` with the reason undici tucked into `cause`. */
function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause;
  if (cause instanceof Error) {
    const code = (cause as NodeJS.ErrnoException).code;
    return `${error.message}: ${code ? `${code} ` : ''}${cause.message}`;
  }
  return error.message;
}
