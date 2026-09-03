import { getTelegramChatIds } from '@/server/queries/site';

export type NotificationKind = 'lead' | 'application' | 'contact' | 'test';

/** Overridable so tests can point at a local mock. */
const API = process.env.TELEGRAM_API_BASE?.replace(/\/$/, '') || 'https://api.telegram.org';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** `<b>Label:</b> value` lines, skipping anything empty. */
export function telegramLines(entries: [string, string | number | null | undefined][]): string {
  return entries
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => `<b>${escapeHtml(label)}:</b> ${escapeHtml(String(value))}`)
    .join('\n');
}

async function resolveChatId(kind: NotificationKind): Promise<string | null> {
  try {
    const perKind = await getTelegramChatIds();
    if (perKind[kind]) return perKind[kind];
  } catch {
    // Settings unreachable — fall through to the env default.
  }
  return process.env.TELEGRAM_CHAT_ID?.trim() || null;
}

/**
 * Fire-and-forget notification. Never throws: a failed notification must not
 * fail the visitor's request (PROMPT.md §11).
 */
export async function sendTelegramMessage(
  text: string,
  options: { kind?: NotificationKind; disablePreview?: boolean } = {},
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = await resolveChatId(options.kind ?? 'lead');

  if (!token || !chatId) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[telegram] not configured, message skipped:\n' + text);
    }
    return false;
  }

  try {
    const response = await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: options.disablePreview ?? true,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[telegram] send failed', response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[telegram] send error', error);
    return false;
  }
}

/** Kicks off a notification without awaiting it. */
export function notify(text: string, options?: { kind?: NotificationKind }): void {
  void sendTelegramMessage(text, options).catch((error) => {
    console.error('[telegram] notify error', error);
  });
}
