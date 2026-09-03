import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Prints a row count for every table — used as the Phase 2 acceptance check. */
async function main() {
  const entries: [string, Promise<number>][] = [
    ['SiteSetting', prisma.siteSetting.count()],
    ['NavItem', prisma.navItem.count()],
    ['HomeSection', prisma.homeSection.count()],
    ['Branch', prisma.branch.count()],
    ['HeroSlide', prisma.heroSlide.count()],
    ['Stat', prisma.stat.count()],
    ['Course', prisma.course.count()],
    ['Teacher', prisma.teacher.count()],
    ['SuccessStory', prisma.successStory.count()],
    ['Advantage', prisma.advantage.count()],
    ['Problem', prisma.problem.count()],
    ['Solution', prisma.solution.count()],
    ['Testimonial', prisma.testimonial.count()],
    ['FaqCategory', prisma.faqCategory.count()],
    ['Faq', prisma.faq.count()],
    ['Promotion', prisma.promotion.count()],
    ['MaterialGroup', prisma.materialGroup.count()],
    ['Material', prisma.material.count()],
    ['MaterialDownload', prisma.materialDownload.count()],
    ['Vacancy', prisma.vacancy.count()],
    ['HiringStep', prisma.hiringStep.count()],
    ['JobApplication', prisma.jobApplication.count()],
    ['Post', prisma.post.count()],
    ['TestCategory', prisma.testCategory.count()],
    ['TestQuestion', prisma.testQuestion.count()],
    ['TestOption', prisma.testOption.count()],
    ['TestLevelBand', prisma.testLevelBand.count()],
    ['TestAttempt', prisma.testAttempt.count()],
    ['Lead', prisma.lead.count()],
    ['LeadNote', prisma.leadNote.count()],
    ['ContactMessage', prisma.contactMessage.count()],
    ['MediaAsset', prisma.mediaAsset.count()],
    ['User', prisma.user.count()],
    ['AuditLog', prisma.auditLog.count()],
  ];

  const counts = await Promise.all(entries.map(([, promise]) => promise));
  const width = Math.max(...entries.map(([name]) => name.length));

  console.log('\n  Table row counts');
  console.log('  ' + '-'.repeat(width + 8));
  entries.forEach(([name], index) => {
    console.log(`  ${name.padEnd(width)}  ${String(counts[index]).padStart(4)}`);
  });
  console.log('  ' + '-'.repeat(width + 8) + '\n');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
