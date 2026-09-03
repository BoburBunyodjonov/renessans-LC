import { PrismaClient } from '@prisma/client';

/** One client for the whole e2e run — specs assert against the real database. */
export const prisma = new PrismaClient();

/** A phone number no other test will collide with. */
export function uniquePhone(): { masked: string; e164: string } {
  const digits = String(Math.floor(100000 + Math.random() * 899999)).slice(0, 6);
  const local = `9${digits}12`.slice(0, 9);
  return {
    masked: `+998 (${local.slice(0, 2)}) ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`,
    e164: `+998${local}`,
  };
}

export async function cleanupLead(e164: string) {
  const leads = await prisma.lead.findMany({ where: { phone: e164 }, select: { id: true } });
  const ids = leads.map((lead) => lead.id);
  if (ids.length === 0) return;

  await prisma.testAttempt.deleteMany({ where: { leadId: { in: ids } } });
  await prisma.leadNote.deleteMany({ where: { leadId: { in: ids } } });
  await prisma.lead.deleteMany({ where: { id: { in: ids } } });
}
