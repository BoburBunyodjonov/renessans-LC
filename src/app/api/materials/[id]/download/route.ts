import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, logError, requestId, serverError } from '@/lib/api';
import { getClientIp, hashIp } from '@/lib/ip';
import { rateLimit } from '@/lib/ratelimit';
import { findDownloadableMaterial } from '@/server/queries/materials';
import { MATERIAL_CONSENT_COOKIE } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestIdValue = requestId();
  const { id } = await params;

  const ip = getClientIp(request);
  const limited = await rateLimit('material-download', ip, 60, '1 h');
  if (!limited.success) return fail('RATE_LIMITED', 'Too many downloads', 429);

  try {
    const material = await findDownloadableMaterial(id);
    if (!material) return fail('NOT_FOUND', 'Material not found', 404);

    const target = material.fileUrl || material.externalUrl;
    if (!target) return fail('NOT_AVAILABLE', 'Material has no file', 409);

    // Lead gate: the client shows the modal, the server refuses without consent.
    if (material.requireContact && !request.cookies.get(MATERIAL_CONSENT_COOKIE)?.value) {
      return fail('LEAD_REQUIRED', 'Contact details required', 403);
    }

    const ipHash = hashIp(ip);
    // Counters must not delay the redirect; failures are logged, not surfaced.
    void Promise.all([
      prisma.material.update({ where: { id }, data: { downloadCount: { increment: 1 } } }),
      prisma.materialDownload.create({ data: { materialId: id, ipHash } }),
    ]).catch((error) => logError('api/materials/download:counter', requestIdValue, error));

    const absolute = target.startsWith('http') ? target : new URL(target, request.url).toString();
    return NextResponse.redirect(absolute, 302);
  } catch (error) {
    logError('api/materials/download', requestIdValue, error);
    return serverError(requestIdValue);
  }
}
