import { after } from 'next/server';

/**
 * Runs an errand after the response has been sent, without losing it.
 *
 * A bare `void promise()` inside a server action looks like it works and mostly
 * does on a fast network, but the work outlives the request only by accident:
 * once the action returns, Next tears the request down and any fetch still in
 * flight dies with an unhelpful `fetch failed`. That is how a placement test
 * reached EduTizim in testing and silently did not in the wild.
 *
 * `after()` is the supported way to say "this belongs to the request but not to
 * the reply". It is only callable inside a request scope, so a caller reached
 * from a script or a seed falls back to the old floating promise — there is no
 * response to outlive there, and the process is still alive to finish it.
 */
export function afterResponse(work: () => Promise<unknown>): void {
  const run = () =>
    work().catch((error) => {
      console.error('[after] background work failed', error);
    });

  try {
    after(run);
  } catch {
    void run();
  }
}
