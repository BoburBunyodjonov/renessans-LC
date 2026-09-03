import { L, PHOTO, PORTRAIT } from './common';

export const COURSES = [
  {
    slug: 'kids-english',
    title: L('KIDS ENGLISH', 'KIDS ENGLISH', 'KIDS ENGLISH'),
    shortDesc: L(
      "1–4 darajadan iborat bo'lib, Buyuk Britaniyaning MACMILLAN nashriyoti darsliklaridan foydalanib o'tiladi.",
      'Состоит из 4 уровней и ведётся по учебникам британского издательства MACMILLAN.',
      'Four levels taught with coursebooks from the British publisher MACMILLAN.',
    ),
    description: L(
      "<p>Kids English — 7–12 yoshdagi bolalar uchun mo'ljallangan kurs. Darslar o'yin, qo'shiq va harakatli mashqlar orqali o'tadi, shuning uchun bola tilni yodlab emas, ishlatib o'rganadi.</p><p>Har bir daraja 3 oy davom etadi va oxirida ota-onalar uchun ochiq dars o'tkaziladi.</p>",
      '<p>Kids English — курс для детей 7–12 лет. Занятия проходят через игры, песни и подвижные упражнения, поэтому ребёнок не зубрит язык, а использует его.</p><p>Каждый уровень длится 3 месяца и завершается открытым уроком для родителей.</p>',
      '<p>Kids English is designed for children aged 7–12. Lessons run through games, songs and movement, so children use the language instead of memorising it.</p><p>Each level lasts three months and ends with an open lesson for parents.</p>',
    ),
    level: L('1–4 daraja', '1–4 уровень', 'Levels 1–4'),
    durationLabel: L('3 oy', '3 месяца', '3 months'),
    price: 850000,
    priceNote: L('1 daraja uchun', 'за один уровень', 'per level'),
    publisher: 'MACMILLAN',
    coverUrl: PHOTO.kids,
    curriculum: [
      {
        title: L('1-daraja: Starter', '1 уровень: Starter', 'Level 1: Starter'),
        items: [
          L('Alifbo va tovushlar', 'Алфавит и звуки', 'Alphabet and sounds'),
          L('Ranglar, sonlar, oila', 'Цвета, числа, семья', 'Colours, numbers, family'),
          L('Oddiy savol-javob', 'Простые вопросы и ответы', 'Simple questions and answers'),
        ],
      },
      {
        title: L('2-daraja: Movers', '2 уровень: Movers', 'Level 2: Movers'),
        items: [
          L('Present Simple', 'Present Simple', 'Present Simple'),
          L(
            'Kundalik rejim haqida gapirish',
            'Рассказ о распорядке дня',
            'Talking about daily routine',
          ),
          L('Qisqa matnlarni o‘qish', 'Чтение коротких текстов', 'Reading short texts'),
        ],
      },
      {
        title: L('3–4-daraja: Flyers', '3–4 уровень: Flyers', 'Levels 3–4: Flyers'),
        items: [
          L('O‘tgan zamon', 'Прошедшее время', 'Past tenses'),
          L('Hikoya aytib berish', 'Рассказ истории', 'Telling a story'),
          L(
            'Cambridge YLE ga tayyorgarlik',
            'Подготовка к Cambridge YLE',
            'Cambridge YLE preparation',
          ),
        ],
      },
    ],
    includes: [
      L(
        'MACMILLAN darsligi va ish daftari',
        'Учебник и рабочая тетрадь MACMILLAN',
        'MACMILLAN coursebook and workbook',
      ),
      L('Haftasiga 3 ta dars', '3 занятия в неделю', '3 lessons a week'),
      L('Guruhda 10 tagacha bola', 'До 10 детей в группе', 'Up to 10 children per group'),
      L('Oylik natija hisoboti', 'Ежемесячный отчёт о результатах', 'Monthly progress report'),
    ],
    schedule: [
      L('Dush/Chor/Juma 10:00 – 11:30', 'Пн/Ср/Пт 10:00 – 11:30', 'Mon/Wed/Fri 10:00 – 11:30'),
      L('Sesh/Pay/Shan 15:00 – 16:30', 'Вт/Чт/Сб 15:00 – 16:30', 'Tue/Thu/Sat 15:00 – 16:30'),
    ],
    isFeatured: true,
    order: 1,
  },
  {
    slug: 'general-english',
    title: L('GENERAL ENGLISH', 'GENERAL ENGLISH', 'GENERAL ENGLISH'),
    shortDesc: L(
      "Beginner – Upper-Intermediate darajalarini o'z ichiga olib, OXFORD nashriyoti darsliklaridan foydalanib o'tiladi.",
      'Охватывает уровни Beginner – Upper-Intermediate по учебникам издательства OXFORD.',
      'Covers Beginner to Upper-Intermediate using OXFORD coursebooks.',
    ),
    description: L(
      "<p>General English — noldan boshlab erkin suhbatgacha olib boradigan asosiy dastur. Har bir darsning yarmi Speaking mashqlariga ajratiladi.</p><p>Har oy oxirida test topshiriladi; 70% dan past natija olgan o'quvchi uchun bepul qo'shimcha dars tashkil etiladi.</p>",
      '<p>General English — основная программа, которая ведёт от нуля до свободного разговора. Половина каждого занятия отводится на Speaking.</p><p>В конце месяца студенты сдают тест; при результате ниже 70% организуется бесплатное дополнительное занятие.</p>',
      '<p>General English is the core programme that takes you from zero to confident conversation. Half of every lesson is devoted to speaking practice.</p><p>Students sit a test at the end of each month; anyone scoring below 70% gets a free catch-up lesson.</p>',
    ),
    level: L(
      'Beginner – Upper-Intermediate',
      'Beginner – Upper-Intermediate',
      'Beginner – Upper-Intermediate',
    ),
    durationLabel: L('3 oy', '3 месяца', '3 months'),
    price: 850000,
    priceNote: L('1 daraja uchun', 'за один уровень', 'per level'),
    publisher: 'OXFORD',
    coverUrl: PHOTO.classroom,
    curriculum: [
      {
        title: L('Beginner – Elementary', 'Beginner – Elementary', 'Beginner – Elementary'),
        items: [
          L('Asosiy grammatika', 'Базовая грамматика', 'Core grammar'),
          L('1 200 ta so‘z', '1 200 слов', '1,200 words'),
          L('Kundalik mavzular', 'Повседневные темы', 'Everyday topics'),
        ],
      },
      {
        title: L(
          'Pre-Intermediate – Intermediate',
          'Pre-Intermediate – Intermediate',
          'Pre-Intermediate – Intermediate',
        ),
        items: [
          L('Barcha zamonlar', 'Все времена', 'All tenses'),
          L('Munozara va bahs', 'Дискуссия и спор', 'Discussion and debate'),
          L('Xat va email yozish', 'Письма и email', 'Letters and emails'),
        ],
      },
      {
        title: L('Upper-Intermediate', 'Upper-Intermediate', 'Upper-Intermediate'),
        items: [
          L('Akademik lug‘at', 'Академическая лексика', 'Academic vocabulary'),
          L('Taqdimot ko‘nikmalari', 'Навыки презентации', 'Presentation skills'),
          L('IELTS ga o‘tish', 'Переход к IELTS', 'Bridge to IELTS'),
        ],
      },
    ],
    includes: [
      L('OXFORD darsligi', 'Учебник OXFORD', 'OXFORD coursebook'),
      L('Haftasiga 3 ta dars', '3 занятия в неделю', '3 lessons a week'),
      L('Bepul Speaking Club', 'Бесплатный Speaking Club', 'Free Speaking Club'),
      L('Oylik oraliq test', 'Ежемесячный промежуточный тест', 'Monthly progress test'),
    ],
    schedule: [
      L('Dush/Chor/Juma 08:00 – 09:30', 'Пн/Ср/Пт 08:00 – 09:30', 'Mon/Wed/Fri 08:00 – 09:30'),
      L('Sesh/Pay/Shan 18:00 – 19:30', 'Вт/Чт/Сб 18:00 – 19:30', 'Tue/Thu/Sat 18:00 – 19:30'),
    ],
    isFeatured: true,
    order: 2,
  },
  {
    slug: 'ielts',
    title: L('IELTS', 'IELTS', 'IELTS'),
    shortDesc: L(
      '350 dan ortiq haqiqiy test materiallari yordamida tayyorlangan, IELTS 7+ kafolatlovchi maxsus dastur, bepul mock test.',
      'Специальная программа с гарантией IELTS 7+, более 350 реальных тестовых материалов и бесплатный mock-тест.',
      'A dedicated IELTS 7+ programme built on 350+ authentic test materials, with a free mock test.',
    ),
    description: L(
      "<p>IELTS kursi 4 ta modul bo'yicha alohida strategiyalarni o'z ichiga oladi. Har hafta bitta to'liq mock test topshiriladi va Writing ishlaringiz ustoz tomonidan qo'lda tekshiriladi.</p><p>Kursni 7+ ball bilan tugatolmagan o'quvchi keyingi kursda bepul o'qiydi.</p>",
      '<p>Курс IELTS включает отдельные стратегии для всех четырёх модулей. Каждую неделю — полноценный mock-тест, а работы Writing проверяет преподаватель вручную.</p><p>Если студент не набирает 7+, следующий курс он проходит бесплатно.</p>',
      '<p>The IELTS course covers dedicated strategies for all four modules. Every week includes a full mock test, and writing tasks are marked by hand.</p><p>Students who do not reach a 7+ band study the next course free of charge.</p>',
    ),
    level: L('Intermediate va undan yuqori', 'Intermediate и выше', 'Intermediate and above'),
    durationLabel: L('3 oy', '3 месяца', '3 months'),
    price: 950000,
    priceNote: L('oyiga', 'в месяц', 'per month'),
    publisher: 'CAMBRIDGE',
    coverUrl: PHOTO.ielts,
    curriculum: [
      {
        title: L('Listening & Reading', 'Listening & Reading', 'Listening & Reading'),
        items: [
          L(
            'Savol turlari bo‘yicha strategiya',
            'Стратегии по типам вопросов',
            'Strategies by question type',
          ),
          L('Vaqtni boshqarish', 'Тайм-менеджмент', 'Time management'),
          L('Haftalik mock', 'Еженедельный mock', 'Weekly mock'),
        ],
      },
      {
        title: L('Writing', 'Writing', 'Writing'),
        items: [
          L('Task 1: grafik tahlili', 'Task 1: анализ графиков', 'Task 1: describing data'),
          L('Task 2: esse tuzilmasi', 'Task 2: структура эссе', 'Task 2: essay structure'),
          L(
            'Qo‘lda tekshiruv va feedback',
            'Ручная проверка и обратная связь',
            'Hand-marked feedback',
          ),
        ],
      },
      {
        title: L('Speaking', 'Speaking', 'Speaking'),
        items: [
          L('Part 1–3 amaliyoti', 'Практика Part 1–3', 'Part 1–3 practice'),
          L('Talaffuz ustida ishlash', 'Работа над произношением', 'Pronunciation work'),
          L('Video yozib tahlil qilish', 'Видеозапись и разбор', 'Recorded video analysis'),
        ],
      },
    ],
    includes: [
      L(
        '350+ haqiqiy test materiali',
        '350+ реальных тестовых материалов',
        '350+ authentic test materials',
      ),
      L('Bepul mock test', 'Бесплатный mock-тест', 'Free mock test'),
      L('Writing qo‘lda tekshiriladi', 'Ручная проверка Writing', 'Hand-marked writing'),
      L('IELTS 7+ kafolati', 'Гарантия IELTS 7+', 'IELTS 7+ guarantee'),
    ],
    schedule: [
      L('Dush/Chor/Juma 19:00 – 21:00', 'Пн/Ср/Пт 19:00 – 21:00', 'Mon/Wed/Fri 19:00 – 21:00'),
      L('Shanba mock test 10:00', 'Суббота mock-тест 10:00', 'Saturday mock test at 10:00'),
    ],
    isFeatured: true,
    order: 3,
  },
  {
    slug: 'corporate-english',
    title: L('KORPORATIV ENGLISH', 'КОРПОРАТИВНЫЙ ENGLISH', 'CORPORATE ENGLISH'),
    shortDesc: L(
      "Xodimlarning biznes ingliz tilini jamoaviy o'rganishlari uchun mo'ljallangan B2B o'quv dasturi.",
      'B2B-программа для корпоративного обучения сотрудников деловому английскому.',
      'A B2B programme for teams learning business English together.',
    ),
    description: L(
      "<p>Dastur kompaniya ehtiyojidan kelib chiqib tuziladi: muzokara, taqdimot, elektron xat yozish yoki sohaviy terminologiya. Darslar sizning ofisingizda yoki markazda o'tkaziladi.</p>",
      '<p>Программа составляется под задачи компании: переговоры, презентации, деловая переписка или отраслевая терминология. Занятия проходят в вашем офисе или в центре.</p>',
      '<p>The syllabus is built around the company&rsquo;s needs: negotiations, presentations, business writing or industry terminology. Lessons run at your office or at the centre.</p>',
    ),
    level: L('Pre-Intermediate va yuqori', 'Pre-Intermediate и выше', 'Pre-Intermediate and above'),
    durationLabel: L('8 oy', '8 месяцев', '8 months'),
    price: 1000000,
    priceNote: L('1 xodim uchun oyiga', 'на сотрудника в месяц', 'per employee per month'),
    publisher: 'OXFORD',
    coverUrl: PHOTO.corporate,
    curriculum: [
      {
        title: L('Business communication', 'Business communication', 'Business communication'),
        items: [
          L('Email va hisobot', 'Email и отчёты', 'Emails and reports'),
          L('Telefon muzokaralari', 'Телефонные переговоры', 'Phone negotiations'),
          L('Majlis olib borish', 'Ведение совещаний', 'Running meetings'),
        ],
      },
      {
        title: L('Sohaviy modul', 'Отраслевой модуль', 'Industry module'),
        items: [
          L('Kompaniya terminologiyasi', 'Терминология компании', 'Company terminology'),
          L('Mijoz bilan muloqot', 'Общение с клиентом', 'Client communication'),
          L('Taqdimot amaliyoti', 'Практика презентаций', 'Presentation practice'),
        ],
      },
    ],
    includes: [
      L('Ehtiyojni tahlil qilish (audit)', 'Аудит потребностей', 'Needs analysis audit'),
      L(
        'Ofisda yoki markazda darslar',
        'Занятия в офисе или в центре',
        'Lessons at your office or ours',
      ),
      L('Choraklik hisobot', 'Ежеквартальный отчёт', 'Quarterly progress report'),
    ],
    schedule: [L('Kelishuv asosida', 'По договорённости', 'By arrangement')],
    order: 4,
  },
  {
    slug: 'online-english',
    title: L('ONLINE ENGLISH', 'ONLINE ENGLISH', 'ONLINE ENGLISH'),
    shortDesc: L(
      "Ingliz tilini masofadan ZOOM platformasi orqali o'rganish kursi.",
      'Курс изучения английского языка дистанционно через платформу ZOOM.',
      'Learn English remotely over ZOOM.',
    ),
    description: L(
      '<p>Individual online darslar — jadval siz uchun qulay vaqtga moslanadi. Har bir darsdan keyin yozib olingan video va uy vazifasi yuboriladi.</p>',
      '<p>Индивидуальные онлайн-занятия — расписание подстраивается под вас. После каждого урока вы получаете запись и домашнее задание.</p>',
      '<p>One-to-one online lessons with a schedule built around you. After every lesson you receive the recording and homework.</p>',
    ),
    level: L('Barcha darajalar', 'Все уровни', 'All levels'),
    durationLabel: L('Individual', 'Индивидуально', 'Individual'),
    price: 1500000,
    priceNote: L('oyiga, 8 ta dars', 'в месяц, 8 занятий', 'per month, 8 lessons'),
    coverUrl: PHOTO.online,
    includes: [
      L('Individual jadval', 'Индивидуальное расписание', 'Individual schedule'),
      L('Dars yozuvlari', 'Записи занятий', 'Lesson recordings'),
      L('Shaxsiy o‘quv rejasi', 'Персональный учебный план', 'Personal study plan'),
    ],
    schedule: [L('Kelishuv asosida', 'По договорённости', 'By arrangement')],
    order: 5,
  },
];

export const TEACHERS = [
  {
    slug: 'malika-yusupova',
    fullName: 'Malika Yusupova',
    position: L('IELTS ustozi', 'Преподаватель IELTS', 'IELTS teacher'),
    bio: L(
      "7 yillik tajriba, 300 dan ortiq o'quvchini IELTS 7+ ga tayyorlagan.",
      'Опыт 7 лет, подготовила более 300 студентов к IELTS 7+.',
      'Seven years of experience; has prepared 300+ students for IELTS 7+.',
    ),
    photoUrl: PORTRAIT('1544005313-94ddf0286df2'),
    ieltsScore: '8.5',
    certificates: ['IELTS 8.5', 'CELTA', 'TESOL'],
    experience: 7,
    courseSlugs: ['ielts', 'general-english'],
    order: 1,
  },
  {
    slug: 'jasur-rahimov',
    fullName: 'Jasur Rahimov',
    position: L(
      'General English ustozi',
      'Преподаватель General English',
      'General English teacher',
    ),
    bio: L(
      'Speaking Club asoschisi, darslarni suhbat asosida olib boradi.',
      'Основатель Speaking Club, ведёт занятия в разговорном формате.',
      'Founder of our Speaking Club; runs conversation-led lessons.',
    ),
    photoUrl: PORTRAIT('1500648767791-00dcc994a43e'),
    ieltsScore: '8.0',
    certificates: ['IELTS 8.0', 'TESOL'],
    experience: 5,
    courseSlugs: ['general-english', 'corporate-english'],
    order: 2,
  },
  {
    slug: 'nilufar-qodirova',
    fullName: 'Nilufar Qodirova',
    position: L('Kids English ustozi', 'Преподаватель Kids English', 'Kids English teacher'),
    bio: L(
      "Bolalar psixologiyasi bo'yicha mutaxassis, o'yin metodikasi muallifi.",
      'Специалист по детской психологии, автор игровой методики.',
      'A child-psychology specialist and the author of our game-based method.',
    ),
    photoUrl: PORTRAIT('1573497019940-1c28c88b4f3e'),
    ieltsScore: '7.5',
    certificates: ['CELTA', 'Young Learners'],
    experience: 6,
    courseSlugs: ['kids-english'],
    order: 3,
  },
  {
    slug: 'sardor-eshonov',
    fullName: 'Sardor Eshonov',
    position: L('Akademik direktor', 'Академический директор', 'Academic director'),
    bio: L(
      "O'quv dasturlari va ustozlar tayyorgarligi uchun mas'ul.",
      'Отвечает за учебные программы и подготовку преподавателей.',
      'Responsible for the syllabus and teacher training.',
    ),
    photoUrl: PORTRAIT('1519085360753-af0119f7cbe7'),
    ieltsScore: '8.5',
    certificates: ['DELTA', 'IELTS 8.5'],
    experience: 10,
    courseSlugs: ['ielts', 'corporate-english'],
    order: 4,
  },
  {
    slug: 'dilnoza-karimova',
    fullName: 'Dilnoza Karimova',
    position: L('Online English ustozi', 'Преподаватель Online English', 'Online English teacher'),
    bio: L(
      'Masofaviy darslar va individual dasturlar bo‘yicha mutaxassis.',
      'Специалист по дистанционным занятиям и индивидуальным программам.',
      'Specialist in remote lessons and individual programmes.',
    ),
    photoUrl: PORTRAIT('1487412720507-e7ab37603c6f'),
    ieltsScore: '7.5',
    certificates: ['TESOL', 'Online Teaching'],
    experience: 4,
    courseSlugs: ['online-english', 'general-english'],
    order: 5,
  },
  {
    slug: 'bekzod-tursunov',
    fullName: 'Bekzod Tursunov',
    position: L('Writing bo‘yicha ustoz', 'Преподаватель Writing', 'Writing teacher'),
    bio: L(
      "IELTS Writing va akademik yozuv bo'yicha ixtisoslashgan.",
      'Специализируется на IELTS Writing и академическом письме.',
      'Specialises in IELTS Writing and academic writing.',
    ),
    photoUrl: PORTRAIT('1506794778202-cad84cf45f1d'),
    ieltsScore: '8.0',
    certificates: ['IELTS 8.0', 'CELTA'],
    experience: 5,
    courseSlugs: ['ielts'],
    order: 6,
  },
];

export const SUCCESS_STORIES = [
  {
    studentName: 'Aziza Rustamova',
    overallBand: '8.0',
    scores: { listening: '9.0', reading: '8.5', writing: '7.0', speaking: '7.5' },
    quote: L(
      '6 oy ichida 5.5 dan 8.0 ga chiqdim.',
      'За 6 месяцев поднялась с 5.5 до 8.0.',
      'I went from 5.5 to 8.0 in six months.',
    ),
    imageUrl: PHOTO.award,
    order: 1,
  },
  {
    studentName: 'Otabek Yo‘ldoshev',
    overallBand: '7.5',
    scores: { listening: '8.0', reading: '8.0', writing: '7.0', speaking: '7.0' },
    quote: L(
      'Grant uchun kerakli ballni oldim.',
      'Набрал балл, необходимый для гранта.',
      'I got exactly the band I needed for my scholarship.',
    ),
    order: 2,
  },
  {
    studentName: 'Shahnoza Ismoilova',
    overallBand: '7.0',
    scores: { listening: '7.5', reading: '7.0', writing: '6.5', speaking: '7.0' },
    quote: L(
      'Writing bo‘yicha qo‘lda tekshiruv juda yordam berdi.',
      'Очень помогла ручная проверка Writing.',
      'The hand-marked writing feedback made the difference.',
    ),
    order: 3,
  },
];
