import 'server-only';

import { buildOrderBody, type EdutizimConfig, type OrderInput } from '@/lib/edutizim-payload';

/**
 * Sends a finished placement test to EduTizim as an order (lead).
 *
 * EduTizim already has a public intake for exactly this — the `LeadSite`
 * integration — so nothing is invented here. It authenticates on two headers
 * rather than a token, deduplicates the student by phone, and drops the order
 * into the first kanban column for a moderator to pick up:
 *
 *   POST {base}/student/order
 *   organization: <org username>
 *   apikey: <LeadSite integration key>
 *
 * Its DTO drops any field it does not declare, silently, so the payload here
 * sticks to exactly what `StudentOrderDto` accepts.
 *
 * The key is a secret and lives in the environment; which survey and branch to
 * file under is ordinary configuration the school changes in our admin. The
 * payload itself is built in `@/lib/edutizim-payload`, which is plain enough to
 * unit test.
 */

/** EduTizim allows one order per five seconds, so calls are cheap but not free. */
const REQUEST_TIMEOUT_MS = 10_000;

export type SendResult =
  { ok: true; orderId: string } | { ok: false; error: string; retryable: boolean };

type Env = {
  baseUrl: string;
  organization: string;
  apiKey: string;
};

function readEnv(): Env | null {
  const baseUrl = process.env.EDUTIZIM_BASE_URL?.trim();
  const organization = process.env.EDUTIZIM_ORG?.trim();
  const apiKey = process.env.EDUTIZIM_API_KEY?.trim();
  if (!baseUrl || !organization || !apiKey) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ''), organization, apiKey };
}

/** True when the integration could run at all — used by the admin to explain why it is idle. */
export function isConfigured(): boolean {
  return readEnv() !== null;
}

/**
 * Posts the order. Never throws: the caller has already stored the attempt, and
 * a delivery failure must not lose it or fail the visitor's submission.
 */
export async function sendOrder(config: EdutizimConfig, input: OrderInput): Promise<SendResult> {
  const env = readEnv();
  if (!env) return { ok: false, error: 'EDUTIZIM_NOT_CONFIGURED', retryable: false };
  if (!config.enabled) return { ok: false, error: 'DISABLED', retryable: false };
  if (!config.surveyId) return { ok: false, error: 'SURVEY_NOT_SET', retryable: false };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.baseUrl}/student/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        organization: env.organization,
        apikey: env.apiKey,
      },
      body: JSON.stringify(buildOrderBody(config, input)),
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      // 429 is their one-per-five-seconds limit and 5xx is their side being
      // unwell; both are worth another go. A 4xx means the payload is wrong,
      // and retrying it would just fail again.
      const retryable = response.status === 429 || response.status >= 500;
      return {
        ok: false,
        error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
        retryable,
      };
    }

    return { ok: true, orderId: readOrderId(text) };
  } catch (error) {
    // A timeout or a DNS failure says nothing about the payload, so it is worth
    // retrying later.
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message.slice(0, 200), retryable: true };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The handler replies with the new order's id, but through a `reply.success()`
 * wrapper whose exact shape is not part of any contract — so the id is looked
 * for in the shapes it plausibly takes, and its absence is not an error. The
 * order exists either way; only our link back to it is missing.
 */
function readOrderId(text: string): string {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object') {
      const record = parsed as Record<string, unknown>;
      for (const key of ['data', 'result', '_id', 'id']) {
        const value = record[key];
        if (typeof value === 'string') return value;
        if (value && typeof value === 'object') {
          const nested = (value as Record<string, unknown>)._id;
          if (typeof nested === 'string') return nested;
        }
      }
    }
  } catch {
    // Not JSON; fall through.
  }
  return '';
}
