import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { BRANCHES, HERO_SLIDES, HOME_SECTIONS, NAV_ITEMS, SETTINGS, STATS } from './seed-data/site';
import { COURSES, SUCCESS_STORIES, TEACHERS } from './seed-data/courses';
import {
  ADVANTAGES,
  FAQS,
  FAQ_CATEGORIES,
  PROBLEMS,
  PROMOTION,
  TESTIMONIALS,
} from './seed-data/home';
import { MATERIALS, MATERIAL_GROUPS } from './seed-data/materials';
import { HIRING_STEPS, POSTS, VACANCIES } from './seed-data/careers';
import { TEST_CATEGORIES } from './seed-data/tests';

const prisma = new PrismaClient();

/** Localized values are plain `{ uz, ru, en }` objects — safe to hand to Prisma as Json. */
const json = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

async function seedSettings() {
  await prisma.siteSetting.upsert({
    where: { id: 'singleton' },
    create: {
      id: 'singleton',
      brandName: json(SETTINGS.brandName),
      tagline: json(SETTINGS.tagline),
      primaryCtaLabel: json(SETTINGS.primaryCtaLabel),
      primaryCtaHref: SETTINGS.primaryCtaHref,
      externalLmsLabel: SETTINGS.externalLmsLabel,
      externalLmsUrl: SETTINGS.externalLmsUrl,
      phones: SETTINGS.phones,
      email: SETTINGS.email,
      socials: json(SETTINGS.socials),
      tickerItems: json(SETTINGS.tickerItems),
      currency: SETTINGS.currency,
      madeByLabel: json(SETTINGS.madeByLabel),
      madeByUrl: SETTINGS.madeByUrl,
      privacyPolicy: json(SETTINGS.privacyPolicy),
    },
    update: {
      brandName: json(SETTINGS.brandName),
      tagline: json(SETTINGS.tagline),
      primaryCtaLabel: json(SETTINGS.primaryCtaLabel),
      primaryCtaHref: SETTINGS.primaryCtaHref,
      externalLmsLabel: SETTINGS.externalLmsLabel,
      externalLmsUrl: SETTINGS.externalLmsUrl,
      phones: SETTINGS.phones,
      email: SETTINGS.email,
      socials: json(SETTINGS.socials),
      tickerItems: json(SETTINGS.tickerItems),
      currency: SETTINGS.currency,
      madeByLabel: json(SETTINGS.madeByLabel),
      madeByUrl: SETTINGS.madeByUrl,
      privacyPolicy: json(SETTINGS.privacyPolicy),
    },
  });

  await prisma.navItem.deleteMany();
  await prisma.navItem.createMany({
    data: NAV_ITEMS.map((item) => ({
      label: json(item.label),
      href: item.href,
      group: item.group,
      order: item.order,
    })),
  });

  for (const section of HOME_SECTIONS) {
    const payload = {
      order: section.order,
      eyebrow: section.eyebrow ? json(section.eyebrow) : Prisma.DbNull,
      title: section.title ? json(section.title) : Prisma.DbNull,
      subtitle: section.subtitle ? json(section.subtitle) : Prisma.DbNull,
      body: section.body ? json(section.body) : Prisma.DbNull,
      imageUrl: section.imageUrl ?? null,
      videoUrl: section.videoUrl ?? null,
      ctaLabel: section.ctaLabel ? json(section.ctaLabel) : Prisma.DbNull,
      ctaHref: section.ctaHref ?? null,
    };
    await prisma.homeSection.upsert({
      where: { key: section.key },
      create: { key: section.key, ...payload },
      update: payload,
    });
  }

  await prisma.branch.deleteMany();
  await prisma.branch.createMany({
    data: BRANCHES.map((branch) => ({
      name: json(branch.name),
      address: json(branch.address),
      phones: branch.phones,
      workingHours: json(branch.workingHours),
      mapEmbedUrl: branch.mapEmbedUrl,
      mapLinkUrl: branch.mapLinkUrl,
      lat: branch.lat,
      lng: branch.lng,
      imageUrl: branch.imageUrl,
      order: branch.order,
    })),
  });

  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: HERO_SLIDES.map((slide) => ({
      headline: json(slide.headline),
      subtitle: json(slide.subtitle),
      ctaLabel: json(slide.ctaLabel),
      ctaHref: slide.ctaHref,
      imageUrl: slide.imageUrl,
      imageAlt: json(slide.imageAlt),
      order: slide.order,
    })),
  });

  await prisma.stat.deleteMany();
  await prisma.stat.createMany({
    data: STATS.map((stat) => ({
      value: stat.value,
      label: json(stat.label),
      icon: stat.icon,
      order: stat.order,
    })),
  });
}

async function seedCourses() {
  for (const course of COURSES) {
    const payload = {
      title: json(course.title),
      shortDesc: json(course.shortDesc),
      description: course.description ? json(course.description) : Prisma.DbNull,
      level: course.level ? json(course.level) : Prisma.DbNull,
      durationLabel: json(course.durationLabel),
      price: new Prisma.Decimal(course.price),
      priceNote: course.priceNote ? json(course.priceNote) : Prisma.DbNull,
      publisher: course.publisher ?? null,
      coverUrl: course.coverUrl ?? null,
      curriculum: course.curriculum ? json(course.curriculum) : Prisma.DbNull,
      includes: course.includes ? json(course.includes) : Prisma.DbNull,
      schedule: course.schedule ? json(course.schedule) : Prisma.DbNull,
      isFeatured: course.isFeatured ?? false,
      order: course.order,
      isPublished: true,
      deletedAt: null,
    };
    await prisma.course.upsert({
      where: { slug: course.slug },
      create: { slug: course.slug, ...payload },
      update: payload,
    });
  }

  for (const teacher of TEACHERS) {
    const payload = {
      fullName: teacher.fullName,
      position: json(teacher.position),
      bio: teacher.bio ? json(teacher.bio) : Prisma.DbNull,
      photoUrl: teacher.photoUrl,
      ieltsScore: teacher.ieltsScore,
      certificates: teacher.certificates,
      experience: teacher.experience,
      order: teacher.order,
      isPublished: true,
      courses: { set: teacher.courseSlugs.map((slug) => ({ slug })) },
    };
    await prisma.teacher.upsert({
      where: { slug: teacher.slug },
      create: {
        slug: teacher.slug,
        ...payload,
        courses: { connect: teacher.courseSlugs.map((slug) => ({ slug })) },
      },
      update: payload,
    });
  }

  await prisma.successStory.deleteMany();
  await prisma.successStory.createMany({
    data: SUCCESS_STORIES.map((story) => ({
      studentName: story.studentName,
      overallBand: story.overallBand,
      scores: json(story.scores),
      quote: json(story.quote),
      imageUrl: story.imageUrl ?? null,
      order: story.order,
    })),
  });
}

async function seedHomeContent() {
  await prisma.advantage.deleteMany();
  await prisma.advantage.createMany({
    data: ADVANTAGES.map((item) => ({
      title: json(item.title),
      description: json(item.description),
      icon: item.icon,
      order: item.order,
    })),
  });

  await prisma.solution.deleteMany();
  await prisma.problem.deleteMany();
  for (const problem of PROBLEMS) {
    await prisma.problem.create({
      data: {
        title: json(problem.title),
        description: json(problem.description),
        icon: problem.icon,
        order: problem.order,
        solution: {
          create: {
            skill: problem.solution.skill,
            title: json(problem.solution.title),
            description: json(problem.solution.description),
            imageUrl: problem.solution.imageUrl ?? null,
          },
        },
      },
    });
  }

  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: TESTIMONIALS.map((item) => ({
      authorName: item.authorName,
      authorRole: json(item.authorRole),
      content: json(item.content),
      rating: item.rating,
      sourceLabel: item.sourceLabel ?? null,
      isFeatured: item.isFeatured ?? false,
      order: item.order,
    })),
  });

  await prisma.faq.deleteMany();
  await prisma.faqCategory.deleteMany();
  const faqCategoryIds = new Map<string, string>();
  for (const category of FAQ_CATEGORIES) {
    const created = await prisma.faqCategory.create({
      data: { name: json(category.name), order: category.order },
    });
    faqCategoryIds.set(category.key, created.id);
  }
  await prisma.faq.createMany({
    data: FAQS.map((item) => ({
      categoryId: faqCategoryIds.get(item.categoryKey) ?? null,
      question: json(item.question),
      answer: json(item.answer),
      order: item.order,
    })),
  });

  await prisma.promotion.deleteMany();
  await prisma.promotion.create({
    data: {
      title: json(PROMOTION.title),
      description: json(PROMOTION.description),
      prizes: json(PROMOTION.prizes),
      ctaLabel: json(PROMOTION.ctaLabel),
      ctaHref: PROMOTION.ctaHref,
      imageUrl: PROMOTION.imageUrl,
      startsAt: PROMOTION.startsAt,
      endsAt: PROMOTION.endsAt,
      isActive: PROMOTION.isActive,
      order: PROMOTION.order,
    },
  });
}

async function seedMaterials() {
  await prisma.materialDownload.deleteMany();
  await prisma.material.deleteMany();
  await prisma.materialGroup.deleteMany();

  const groupIds = new Map<string, string>();
  for (const group of MATERIAL_GROUPS) {
    const created = await prisma.materialGroup.create({
      data: { name: json(group.name), type: group.type, order: group.order },
    });
    groupIds.set(group.key, created.id);
  }

  await prisma.material.createMany({
    data: MATERIALS.map((material) => ({
      title: json(material.title),
      description: material.description ? json(material.description) : Prisma.DbNull,
      type: material.type,
      level: material.level,
      groupId: groupIds.get(material.groupKey) ?? null,
      fileUrl: material.fileUrl ?? null,
      externalUrl: material.externalUrl ?? null,
      fileSize: material.fileSize ?? null,
      meta: material.meta ? json(material.meta) : Prisma.DbNull,
      tags: material.tags,
      requireContact: material.requireContact ?? false,
      downloadCount: material.downloadCount ?? 0,
      order: material.order,
    })),
  });
}

async function seedCareers() {
  for (const vacancy of VACANCIES) {
    const payload = {
      title: json(vacancy.title),
      shortDesc: json(vacancy.shortDesc),
      description: vacancy.description ? json(vacancy.description) : Prisma.DbNull,
      responsibilities: vacancy.responsibilities ? json(vacancy.responsibilities) : Prisma.DbNull,
      requirements: vacancy.requirements ? json(vacancy.requirements) : Prisma.DbNull,
      conditions: vacancy.conditions ? json(vacancy.conditions) : Prisma.DbNull,
      department: vacancy.department ? json(vacancy.department) : Prisma.DbNull,
      employmentType: vacancy.employmentType ? json(vacancy.employmentType) : Prisma.DbNull,
      salaryFrom: vacancy.salaryFrom ? new Prisma.Decimal(vacancy.salaryFrom) : null,
      salaryTo: vacancy.salaryTo ? new Prisma.Decimal(vacancy.salaryTo) : null,
      showSalary: vacancy.showSalary ?? false,
      isOpen: true,
      order: vacancy.order,
    };
    await prisma.vacancy.upsert({
      where: { slug: vacancy.slug },
      create: { slug: vacancy.slug, ...payload },
      update: payload,
    });
  }

  await prisma.hiringStep.deleteMany();
  await prisma.hiringStep.createMany({
    data: HIRING_STEPS.map((step) => ({
      title: json(step.title),
      description: json(step.description),
      order: step.order,
    })),
  });

  for (const post of POSTS) {
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - post.publishedAtDaysAgo);
    const payload = {
      title: json(post.title),
      excerpt: json(post.excerpt),
      body: json(post.body),
      coverUrl: post.coverUrl,
      tags: post.tags,
      readingMinutes: post.readingMinutes,
      isPublished: post.isPublished,
      publishedAt,
    };
    await prisma.post.upsert({
      where: { slug: post.slug },
      create: { slug: post.slug, ...payload },
      update: payload,
    });
  }
}

async function seedTests() {
  for (const category of TEST_CATEGORIES) {
    const payload = {
      title: json(category.title),
      subtitle: json(category.subtitle),
      icon: category.icon,
      timeLimitSec: category.timeLimitSec,
      shuffle: category.shuffle,
      allowBack: category.allowBack,
      requireContact: category.requireContact,
      isPublished: true,
      order: category.order,
    };
    const saved = await prisma.testCategory.upsert({
      where: { slug: category.slug },
      create: { slug: category.slug, ...payload },
      update: payload,
    });

    // Questions and bands are rebuilt from scratch; attempts are left untouched.
    await prisma.testQuestion.deleteMany({ where: { categoryId: saved.id } });
    await prisma.testLevelBand.deleteMany({ where: { categoryId: saved.id } });

    for (const [index, [prompt, options, correct]] of category.questions.entries()) {
      await prisma.testQuestion.create({
        data: {
          categoryId: saved.id,
          prompt,
          order: index + 1,
          difficulty: Math.min(5, Math.floor(index / 9) + 1),
          options: {
            create: options.map((text, optionIndex) => ({
              text,
              isCorrect: optionIndex === correct,
              order: optionIndex + 1,
            })),
          },
        },
      });
    }

    for (const band of category.bands) {
      const course = await prisma.course.findUnique({ where: { slug: band.courseSlug } });
      await prisma.testLevelBand.create({
        data: {
          categoryId: saved.id,
          minScore: band.minScore,
          maxScore: band.maxScore,
          levelName: band.levelName,
          title: json(band.title),
          description: json(band.description),
          courseId: course?.id ?? null,
          order: band.order,
        },
      });
    }
  }
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@school.uz';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: 'Super Admin',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
    update: { role: 'SUPER_ADMIN', isActive: true },
  });

  return email;
}

async function printCounts() {
  const [
    settings,
    navItems,
    homeSections,
    branches,
    heroSlides,
    stats,
    courses,
    teachers,
    successStories,
    advantages,
    problems,
    solutions,
    testimonials,
    faqCategories,
    faqs,
    promotions,
    materialGroups,
    materials,
    vacancies,
    hiringSteps,
    posts,
    testCategories,
    testQuestions,
    testOptions,
    testBands,
    users,
  ] = await Promise.all([
    prisma.siteSetting.count(),
    prisma.navItem.count(),
    prisma.homeSection.count(),
    prisma.branch.count(),
    prisma.heroSlide.count(),
    prisma.stat.count(),
    prisma.course.count(),
    prisma.teacher.count(),
    prisma.successStory.count(),
    prisma.advantage.count(),
    prisma.problem.count(),
    prisma.solution.count(),
    prisma.testimonial.count(),
    prisma.faqCategory.count(),
    prisma.faq.count(),
    prisma.promotion.count(),
    prisma.materialGroup.count(),
    prisma.material.count(),
    prisma.vacancy.count(),
    prisma.hiringStep.count(),
    prisma.post.count(),
    prisma.testCategory.count(),
    prisma.testQuestion.count(),
    prisma.testOption.count(),
    prisma.testLevelBand.count(),
    prisma.user.count(),
  ]);

  const rows: [string, number][] = [
    ['SiteSetting', settings],
    ['NavItem', navItems],
    ['HomeSection', homeSections],
    ['Branch', branches],
    ['HeroSlide', heroSlides],
    ['Stat', stats],
    ['Course', courses],
    ['Teacher', teachers],
    ['SuccessStory', successStories],
    ['Advantage', advantages],
    ['Problem', problems],
    ['Solution', solutions],
    ['Testimonial', testimonials],
    ['FaqCategory', faqCategories],
    ['Faq', faqs],
    ['Promotion', promotions],
    ['MaterialGroup', materialGroups],
    ['Material', materials],
    ['Vacancy', vacancies],
    ['HiringStep', hiringSteps],
    ['Post', posts],
    ['TestCategory', testCategories],
    ['TestQuestion', testQuestions],
    ['TestOption', testOptions],
    ['TestLevelBand', testBands],
    ['User', users],
  ];

  const width = Math.max(...rows.map(([name]) => name.length));
  console.log('\n  Seeded rows');
  console.log('  ' + '-'.repeat(width + 8));
  for (const [name, count] of rows) {
    console.log(`  ${name.padEnd(width)}  ${String(count).padStart(4)}`);
  }
  console.log('  ' + '-'.repeat(width + 8));
}

async function main() {
  console.log('Seeding database...');
  await seedSettings();
  await seedCourses();
  await seedHomeContent();
  await seedMaterials();
  await seedCareers();
  await seedTests();
  const adminEmail = await seedAdminUser();
  await printCounts();
  console.log(`\n  Admin login: ${adminEmail} (password from SEED_ADMIN_PASSWORD)\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
