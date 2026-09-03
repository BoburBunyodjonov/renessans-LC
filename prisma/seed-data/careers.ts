import { L } from './common';

export const VACANCIES = [
  {
    slug: 'administrator',
    title: L('Administrator', 'Администратор', 'Administrator'),
    shortDesc: L(
      "Qabulxonada mijozlarni kutib olish, qo'ng'iroqlar va guruhlarni shakllantirish.",
      'Приём клиентов на ресепшене, звонки и формирование групп.',
      'Front-desk reception, calls and group formation.',
    ),
    description: L(
      '<p>Administrator markazning yuzi hisoblanadi: kelgan ota-onalar bilan ishlaydi, sinov darslarini rejalashtiradi va CRM tizimini yuritadi.</p>',
      '<p>Администратор — лицо центра: работает с родителями, планирует пробные уроки и ведёт CRM.</p>',
      '<p>The administrator is the face of the centre: works with parents, schedules trial lessons and keeps the CRM up to date.</p>',
    ),
    responsibilities: [
      L(
        "Kirish qo'ng'iroqlariga javob berish",
        'Отвечать на входящие звонки',
        'Answer incoming calls',
      ),
      L('Sinov darslarini rejalashtirish', 'Планировать пробные уроки', 'Schedule trial lessons'),
      L("CRM da ma'lumotlarni yuritish", 'Вести данные в CRM', 'Keep records in the CRM'),
    ],
    requirements: [
      L(
        "O'zbek va rus tillarini bilish",
        'Знание узбекского и русского языков',
        'Uzbek and Russian',
      ),
      L('Kompyuter savodxonligi', 'Компьютерная грамотность', 'Computer literacy'),
      L('Muloqotga ochiqlik', 'Коммуникабельность', 'Strong communication skills'),
    ],
    conditions: [
      L('5/2 ish grafigi', 'График 5/2', 'A 5/2 schedule'),
      L('Bepul ingliz tili kurslari', 'Бесплатные курсы английского', 'Free English lessons'),
    ],
    department: L('Qabulxona', 'Ресепшн', 'Front office'),
    employmentType: L("To'liq stavka", 'Полная ставка', 'Full time'),
    salaryFrom: 4000000,
    salaryTo: 6000000,
    showSalary: true,
    order: 1,
  },
  {
    slug: 'academic-support',
    title: L('Academic Support', 'Academic Support', 'Academic Support'),
    shortDesc: L(
      "O'quvchilarning davomati, natijalari va ota-onalar bilan aloqani nazorat qilish.",
      'Контроль посещаемости, результатов студентов и связь с родителями.',
      'Owns attendance, student results and parent communication.',
    ),
    description: L(
      '<p>Academic Support har bir guruh natijasini kuzatib boradi va zaif o‘quvchilar uchun qo‘shimcha darslar tashkil etadi.</p>',
      '<p>Academic Support отслеживает результаты каждой группы и организует дополнительные занятия для отстающих.</p>',
      '<p>Academic Support tracks every group&rsquo;s results and arranges catch-up lessons for students who fall behind.</p>',
    ),
    responsibilities: [
      L('Oylik testlarni tashkil etish', 'Организация ежемесячных тестов', 'Run the monthly tests'),
      L('Ota-onalarga hisobot yuborish', 'Отправка отчётов родителям', 'Send reports to parents'),
    ],
    requirements: [
      L('Ingliz tili B2+', 'Английский B2+', 'English at B2+'),
      L(
        'Excel/Google Sheets bilan ishlash',
        'Работа с Excel/Google Sheets',
        'Excel / Google Sheets',
      ),
    ],
    conditions: [L('Ofis ish rejimi', 'Офисный режим работы', 'Office-based role')],
    department: L("O'quv bo'limi", 'Учебный отдел', 'Academic department'),
    employmentType: L("To'liq stavka", 'Полная ставка', 'Full time'),
    salaryFrom: 5000000,
    salaryTo: 8000000,
    showSalary: true,
    order: 2,
  },
  {
    slug: 'esl-ielts-instructor',
    title: L('ESL / IELTS instruktor', 'ESL / IELTS инструктор', 'ESL / IELTS instructor'),
    shortDesc: L(
      'General English yoki IELTS guruhlarida dars berish.',
      'Преподавание в группах General English или IELTS.',
      'Teaching General English or IELTS groups.',
    ),
    description: L(
      '<p>Ustozlarimiz haftada 18–24 soat dars beradi, qolgan vaqt metodik tayyorgarlik va o‘qituvchilar treningiga ajratiladi.</p>',
      '<p>Наши преподаватели ведут 18–24 часа в неделю, остальное время — методическая подготовка и тренинги.</p>',
      '<p>Teachers deliver 18–24 hours a week; the rest of the time is lesson preparation and training.</p>',
    ),
    responsibilities: [
      L(
        'Dars o‘tish va uy vazifasini tekshirish',
        'Проводить занятия и проверять домашние задания',
        'Teach lessons and mark homework',
      ),
      L(
        'Oylik test natijalarini tahlil qilish',
        'Анализировать результаты тестов',
        'Analyse monthly test results',
      ),
    ],
    requirements: [
      L('IELTS 7.5+ yoki CELTA/TESOL', 'IELTS 7.5+ или CELTA/TESOL', 'IELTS 7.5+ or CELTA/TESOL'),
      L('Kamida 1 yillik tajriba', 'Опыт от 1 года', 'At least one year of experience'),
    ],
    conditions: [
      L('Soatbay yuqori to‘lov', 'Высокая почасовая оплата', 'Competitive hourly rate'),
      L('Bepul metodik treninglar', 'Бесплатные методические тренинги', 'Free teacher training'),
    ],
    department: L("O'quv bo'limi", 'Учебный отдел', 'Academic department'),
    employmentType: L(
      'To‘liq yoki yarim stavka',
      'Полная или частичная занятость',
      'Full or part time',
    ),
    salaryFrom: 8000000,
    salaryTo: 15000000,
    showSalary: true,
    order: 3,
  },
  {
    slug: 'graphic-designer',
    title: L('Grafik dizayner', 'Графический дизайнер', 'Graphic designer'),
    shortDesc: L(
      'Ijtimoiy tarmoqlar uchun banner, video va bosma materiallar tayyorlash.',
      'Подготовка баннеров, видео и печатных материалов для соцсетей.',
      'Producing banners, video and print materials for social media.',
    ),
    responsibilities: [
      L(
        'Haftalik kontent-plan bo‘yicha dizayn',
        'Дизайн по недельному контент-плану',
        'Design to the weekly content plan',
      ),
      L('Reels va Stories montaji', 'Монтаж Reels и Stories', 'Edit Reels and Stories'),
    ],
    requirements: [
      L('Figma va Adobe paketi', 'Figma и пакет Adobe', 'Figma and the Adobe suite'),
      L('Portfolio taqdim etish', 'Наличие портфолио', 'A portfolio'),
    ],
    conditions: [L('Gibrid ish rejimi', 'Гибридный формат работы', 'Hybrid working')],
    department: L('Marketing', 'Маркетинг', 'Marketing'),
    employmentType: L("To'liq stavka", 'Полная ставка', 'Full time'),
    order: 4,
  },
  {
    slug: 'cashier',
    title: L('Kassir', 'Кассир', 'Cashier'),
    shortDesc: L(
      "To'lovlarni qabul qilish va moliyaviy hisobotlarni yuritish.",
      'Приём платежей и ведение финансовой отчётности.',
      'Taking payments and keeping financial records.',
    ),
    responsibilities: [
      L(
        'Naqd va plastik to‘lovlarni qabul qilish',
        'Приём наличных и карточных платежей',
        'Accept cash and card payments',
      ),
      L('Kunlik hisobot tayyorlash', 'Подготовка ежедневного отчёта', 'Prepare the daily report'),
    ],
    requirements: [
      L('1C yoki shunga o‘xshash tizim', '1С или аналогичная система', '1C or a similar system'),
      L('Diqqat va mas’uliyat', 'Внимательность и ответственность', 'Accuracy and reliability'),
    ],
    conditions: [L('5/2 ish grafigi', 'График 5/2', 'A 5/2 schedule')],
    department: L('Moliya', 'Финансы', 'Finance'),
    employmentType: L("To'liq stavka", 'Полная ставка', 'Full time'),
    order: 5,
  },
  {
    slug: 'ambassador',
    title: L('Ambassador', 'Амбассадор', 'Ambassador'),
    shortDesc: L(
      "Markazni universitet va maktablarda tanishtirish, tavsiya orqali o'quvchi jalb qilish.",
      'Представление центра в вузах и школах, привлечение студентов по рекомендации.',
      'Representing the centre at universities and schools and bringing in students by referral.',
    ),
    responsibilities: [
      L(
        'Tanishtiruv uchrashuvlari o‘tkazish',
        'Проводить презентации',
        'Run introductory sessions',
      ),
      L(
        'Ijtimoiy tarmoqlarda kontent tayyorlash',
        'Готовить контент для соцсетей',
        'Create social media content',
      ),
    ],
    requirements: [
      L('Talaba yoki bitiruvchi', 'Студент или выпускник', 'A student or recent graduate'),
      L(
        'Faol ijtimoiy tarmoq profili',
        'Активный профиль в соцсетях',
        'An active social media profile',
      ),
    ],
    conditions: [
      L('Har bir o‘quvchi uchun bonus', 'Бонус за каждого студента', 'A bonus for every student'),
      L('Erkin jadval', 'Свободный график', 'Flexible hours'),
    ],
    department: L('Marketing', 'Маркетинг', 'Marketing'),
    employmentType: L('Yarim stavka', 'Частичная занятость', 'Part time'),
    order: 6,
  },
];

export const HIRING_STEPS = [
  {
    title: L('Ariza topshirish', 'Подача заявки', 'Send an application'),
    description: L(
      "Sayt orqali anketani to'ldiring va rezyumeni yuklang.",
      'Заполните анкету на сайте и приложите резюме.',
      'Fill in the form on the site and attach your CV.',
    ),
    order: 1,
  },
  {
    title: L('Telefon suhbati', 'Телефонное интервью', 'Phone screening'),
    description: L(
      "HR mutaxassisi 2 ish kuni ichida qo'ng'iroq qiladi.",
      'HR-специалист позвонит в течение 2 рабочих дней.',
      'An HR specialist calls you within two working days.',
    ),
    order: 2,
  },
  {
    title: L('Sinov darsi / vazifa', 'Пробный урок / тестовое задание', 'Demo lesson or test task'),
    description: L(
      'Ustozlar uchun — 20 daqiqalik demo dars, boshqa lavozimlar uchun amaliy vazifa.',
      'Для преподавателей — демо-урок 20 минут, для других позиций — практическое задание.',
      'Teachers give a 20-minute demo lesson; other roles complete a practical task.',
    ),
    order: 3,
  },
  {
    title: L('Rahbariyat bilan suhbat', 'Интервью с руководством', 'Interview with management'),
    description: L(
      "Akademik direktor yoki bo'lim rahbari bilan yakuniy suhbat.",
      'Финальное собеседование с академическим директором или руководителем отдела.',
      'A final interview with the academic director or department head.',
    ),
    order: 4,
  },
  {
    title: L('Ishga qabul', 'Приём на работу', 'Offer and onboarding'),
    description: L(
      'Shartnoma imzolanadi va 1 haftalik moslashuv dasturi boshlanadi.',
      'Подписывается договор и начинается недельная адаптация.',
      'We sign the contract and start a one-week onboarding programme.',
    ),
    order: 5,
  },
];

export const POSTS = [
  {
    slug: 'ielts-7-uchun-3-oylik-reja',
    title: L(
      'IELTS 7.0 uchun 3 oylik tayyorgarlik rejasi',
      'План подготовки к IELTS 7.0 за 3 месяца',
      'A three-month plan for IELTS 7.0',
    ),
    excerpt: L(
      "Har hafta nima qilish kerakligi bo'yicha aniq jadval.",
      'Чёткий график: что делать каждую неделю.',
      'A week-by-week schedule of exactly what to do.',
    ),
    body: L(
      "<p>IELTS 7.0 — bu erishib bo'lmaydigan ball emas. Quyida markazimiz o'quvchilari uchun tuzilgan 12 haftalik rejani keltiramiz.</p><h2>1–4-hafta: baza</h2><p>Har kuni 30 daqiqa listening, haftada 2 ta Writing Task 1.</p><h2>5–8-hafta: strategiya</h2><p>Savol turlari bo'yicha ishlash, har hafta 1 ta to'liq mock test.</p><h2>9–12-hafta: sayqal</h2><p>Speaking Part 2 uchun 30 ta mavzu va Writing Task 2 bo'yicha qo'lda tekshiruv.</p>",
      '<p>IELTS 7.0 — вполне достижимый балл. Ниже — 12-недельный план, составленный для студентов нашего центра.</p><h2>1–4 неделя: база</h2><p>Ежедневно 30 минут listening, дважды в неделю Writing Task 1.</p><h2>5–8 неделя: стратегия</h2><p>Работа по типам вопросов, один полный mock-тест в неделю.</p><h2>9–12 неделя: шлифовка</h2><p>30 тем для Speaking Part 2 и ручная проверка Writing Task 2.</p>',
      '<p>IELTS 7.0 is a realistic target. Here is the 12-week plan we use with our own students.</p><h2>Weeks 1–4: foundations</h2><p>Thirty minutes of listening a day and two Writing Task 1 pieces a week.</p><h2>Weeks 5–8: strategy</h2><p>Work by question type and one full mock test each week.</p><h2>Weeks 9–12: polish</h2><p>Thirty Speaking Part 2 topics and hand-marked Writing Task 2 essays.</p>',
    ),
    coverUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80',
    tags: ['ielts', 'plan'],
    readingMinutes: 6,
    isPublished: true,
    publishedAtDaysAgo: 12,
  },
  {
    slug: 'bolani-ingliz-tiliga-qiziqtirish',
    title: L(
      'Bolani ingliz tiliga qanday qiziqtirish mumkin?',
      'Как заинтересовать ребёнка английским?',
      'How to get a child interested in English',
    ),
    excerpt: L(
      'Majburlashsiz ishlaydigan 7 ta usul.',
      'Семь способов, которые работают без принуждения.',
      'Seven approaches that work without pressure.',
    ),
    body: L(
      "<p>Bolalar majburlashdan emas, qiziqishdan o'rganadi. Quyidagi usullar amalda sinovdan o'tgan.</p><ul><li>Multfilmlarni ingliz tilida, subtitrsiz ko'rish;</li><li>Kuniga 10 daqiqa qo'shiq aytish;</li><li>Uy jihozlariga inglizcha stikerlar yopishtirish;</li><li>Haftada bir marta «faqat ingliz tili» kechasi.</li></ul>",
      '<p>Дети учатся из интереса, а не из-под палки. Эти способы проверены на практике.</p><ul><li>Мультфильмы на английском без субтитров;</li><li>10 минут песен в день;</li><li>Английские стикеры на предметах в доме;</li><li>Раз в неделю вечер «только по-английски».</li></ul>',
      '<p>Children learn from curiosity, not pressure. These approaches are tested in our classrooms.</p><ul><li>Cartoons in English without subtitles;</li><li>Ten minutes of singing a day;</li><li>English labels on objects around the house;</li><li>One "English only" evening a week.</li></ul>',
    ),
    coverUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
    tags: ['kids', 'parents'],
    readingMinutes: 4,
    isPublished: true,
    publishedAtDaysAgo: 26,
  },
  {
    slug: 'speaking-club-yangi-mavsum',
    title: L(
      'Speaking Club: yangi mavsum boshlandi',
      'Speaking Club: стартовал новый сезон',
      'Speaking Club: the new season has started',
    ),
    excerpt: L(
      'Har shanba, bepul, barcha darajalar uchun.',
      'Каждую субботу, бесплатно, для всех уровней.',
      'Every Saturday, free, all levels welcome.',
    ),
    body: L(
      "<p>Speaking Club — markazimiz o'quvchilari va bitiruvchilari uchun bepul suhbat klubi. Har shanba soat 16:00 da Chilonzor filialida.</p>",
      '<p>Speaking Club — бесплатный разговорный клуб для студентов и выпускников центра. Каждую субботу в 16:00 в филиале Чиланзар.</p>',
      '<p>The Speaking Club is a free conversation club for our students and alumni. Every Saturday at 16:00 at the Chilonzor branch.</p>',
    ),
    coverUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80',
    tags: ['speaking', 'events'],
    readingMinutes: 2,
    isPublished: true,
    publishedAtDaysAgo: 3,
  },
];
