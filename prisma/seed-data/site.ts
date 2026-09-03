import { L, PHOTO } from './common';

export const SETTINGS = {
  brandName: L('Renessans English School', 'Renessans English School', 'Renessans English School'),
  tagline: L(
    'Toshkentda chet tillari kurslari',
    'Курсы иностранных языков в Ташкенте',
    'Foreign language courses in Tashkent',
  ),
  primaryCtaLabel: L('Darajangizni aniqlang', 'Определите свой уровень', 'Find your level'),
  primaryCtaHref: '/choose-level',
  externalLmsLabel: 'CDI',
  externalLmsUrl: 'https://cdi.uz',
  phones: ['+998 71 205-03-33', '+998 71 205-53-33'],
  email: 'info@renessans-school.uz',
  socials: {
    telegram: 'https://t.me/renessans_school',
    instagram: 'https://instagram.com/renessans_school',
    youtube: 'https://youtube.com/@renessans_school',
  },
  tickerItems: [
    L('Renessans School', 'Renessans School', 'Renessans School'),
    L("Ishonchli ta'lim", 'Надёжное образование', 'Trusted education'),
    L('Malakali ustozlar', 'Опытные преподаватели', 'Qualified teachers'),
    L('Unutilmas darslar', 'Незабываемые уроки', 'Unforgettable lessons'),
  ],
  currency: 'UZS',
  madeByLabel: L('Sayt: Renessans IT', 'Сайт: Renessans IT', 'Site by Renessans IT'),
  madeByUrl: null,
  privacyPolicy: L(
    `<h2>Maxfiylik siyosati</h2><p>Ushbu sahifada Renessans English School (keyingi o'rinlarda — "Markaz") saytdan foydalanuvchilarning shaxsiy ma'lumotlarini qanday to'plashi, saqlashi va ishlatishi tushuntiriladi.</p><h3>Qanday ma'lumot to'planadi</h3><ul><li>Ism va telefon raqami — sinov darsiga yozilish arizalari orqali;</li><li>Daraja aniqlash testi natijalari;</li><li>Vakansiyaga ariza topshirganda: rezyume, tug'ilgan sana va aloqa ma'lumotlari;</li><li>Sayt statistikasi uchun anonim texnik ma'lumotlar (IP manzil xeshlangan holda saqlanadi).</li></ul><h3>Ma'lumotlardan foydalanish</h3><p>Ma'lumotlar faqat siz bilan bog'lanish, xizmatlar sifatini oshirish va o'quv jarayonini tashkil etish uchun ishlatiladi. Ma'lumotlar uchinchi shaxslarga sotilmaydi.</p><h3>Ma'lumotlarni o'chirish</h3><p>Istalgan vaqtda <a href="mailto:info@renessans-school.uz">info@renessans-school.uz</a> manziliga xat yozib, o'z ma'lumotlaringizni bazadan butunlay o'chirishni so'rashingiz mumkin.</p>`,
    `<h2>Политика конфиденциальности</h2><p>На этой странице описано, как Renessans English School (далее — «Центр») собирает, хранит и использует персональные данные пользователей сайта.</p><h3>Какие данные собираются</h3><ul><li>Имя и номер телефона — через заявки на пробный урок;</li><li>Результаты теста на определение уровня;</li><li>При отклике на вакансию: резюме, дата рождения и контактные данные;</li><li>Анонимные технические данные для статистики (IP-адрес хранится в виде хеша).</li></ul><h3>Использование данных</h3><p>Данные используются только для связи с вами, повышения качества услуг и организации учебного процесса. Данные не продаются третьим лицам.</p><h3>Удаление данных</h3><p>Вы можете в любой момент написать на <a href="mailto:info@renessans-school.uz">info@renessans-school.uz</a> и запросить полное удаление ваших данных из базы.</p>`,
    `<h2>Privacy policy</h2><p>This page explains how Renessans English School (the "Centre") collects, stores and uses the personal data of website visitors.</p><h3>What we collect</h3><ul><li>Name and phone number — through trial lesson requests;</li><li>Placement test results;</li><li>When applying for a job: CV, date of birth and contact details;</li><li>Anonymous technical data for analytics (the IP address is stored hashed).</li></ul><h3>How we use it</h3><p>Data is used only to contact you, to improve the quality of our services and to organise teaching. We never sell data to third parties.</p><h3>Deleting your data</h3><p>You can email <a href="mailto:info@renessans-school.uz">info@renessans-school.uz</a> at any time and ask for your data to be permanently removed.</p>`,
  ),
};

export const NAV_ITEMS = [
  { label: L('Kurslar', 'Курсы', 'Courses'), href: '/#services', group: 'header', order: 1 },
  {
    label: L('Ustozlar', 'Преподаватели', 'Teachers'),
    href: '/teachers',
    group: 'header',
    order: 2,
  },
  {
    label: L('Materiallar', 'Материалы', 'Materials'),
    href: '/materials',
    group: 'header',
    order: 3,
  },
  {
    label: L('Ota-onalar uchun', 'Родителям', 'For parents'),
    href: '/parents-solutions',
    group: 'header',
    order: 4,
  },
  {
    label: L('Vakansiyalar', 'Вакансии', 'Careers'),
    href: '/join-team',
    group: 'header',
    order: 5,
  },
  { label: L('Yangiliklar', 'Новости', 'News'), href: '/blog', group: 'header', order: 6 },
  { label: L('Aloqa', 'Контакты', 'Contact'), href: '/contact', group: 'header', order: 7 },

  { label: L('Kurslar', 'Курсы', 'Courses'), href: '/#services', group: 'footer-1', order: 1 },
  {
    label: L('Ustozlar', 'Преподаватели', 'Teachers'),
    href: '/teachers',
    group: 'footer-1',
    order: 2,
  },
  {
    label: L('Darajangizni aniqlang', 'Определите уровень', 'Find your level'),
    href: '/choose-level',
    group: 'footer-1',
    order: 3,
  },
  {
    label: L('Ota-onalar uchun', 'Родителям', 'For parents'),
    href: '/parents-solutions',
    group: 'footer-1',
    order: 4,
  },

  {
    label: L('Materiallar', 'Материалы', 'Materials'),
    href: '/materials',
    group: 'footer-2',
    order: 1,
  },
  { label: L('Yangiliklar', 'Новости', 'News'), href: '/blog', group: 'footer-2', order: 2 },
  {
    label: L('Vakansiyalar', 'Вакансии', 'Careers'),
    href: '/join-team',
    group: 'footer-2',
    order: 3,
  },
  { label: L('Aloqa', 'Контакты', 'Contact'), href: '/contact', group: 'footer-2', order: 4 },
];

export const HOME_SECTIONS = [
  { key: 'hero', order: 1 },
  { key: 'ticker', order: 2 },
  { key: 'stats', order: 3 },
  {
    key: 'about',
    order: 4,
    eyebrow: L('Biz haqimizda', 'О нас', 'About us'),
    title: L(
      "Ingliz tilini o'rgatishni yaxshi ko'radigan jamoa",
      'Команда, которая любит учить английскому',
      'A team that loves teaching English',
    ),
    subtitle: L(
      "2019-yildan buyon Toshkentda 2 500 dan ortiq o'quvchiga ingliz tilini o'rgatdik.",
      'С 2019 года мы обучили английскому более 2 500 студентов в Ташкенте.',
      'Since 2019 we have taught English to more than 2,500 students in Tashkent.',
    ),
    body: L(
      "<p>Renessans English School — bu natijaga yo'naltirilgan o'quv markaz. Har bir guruhda 12 tadan ortiq bo'lmagan o'quvchi bo'ladi, shuning uchun ustoz har bir o'quvchiga yetarlicha vaqt ajratadi.</p><p>Darslar Oxford va Macmillan nashriyotlari darsliklari asosida, haftada 3 marta o'tkaziladi. Har oy oraliq test topshiriladi va natija ota-onaga yuboriladi.</p>",
      '<p>Renessans English School — учебный центр, ориентированный на результат. В группе не более 12 студентов, поэтому преподаватель уделяет внимание каждому.</p><p>Занятия проходят по учебникам издательств Oxford и Macmillan три раза в неделю. Каждый месяц студенты сдают промежуточный тест, а результат отправляется родителям.</p>',
      '<p>Renessans English School is a results-driven language centre. Groups never exceed 12 students, so every learner gets the teacher&rsquo;s attention.</p><p>Lessons follow Oxford and Macmillan coursebooks and run three times a week. Every month students sit a progress test and the result is sent to their parents.</p>',
    ),
    imageUrl: PHOTO.campus,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    key: 'teachers',
    order: 5,
    eyebrow: L('Ustozlar', 'Преподаватели', 'Teachers'),
    title: L(
      "Sertifikatlangan ustozlar va o'quvchilar natijalari",
      'Сертифицированные преподаватели и результаты студентов',
      'Certified teachers and student results',
    ),
    subtitle: L(
      'Har bir ustoz IELTS 7.5+ yoki CELTA/TESOL sertifikatiga ega.',
      'Каждый преподаватель имеет IELTS 7.5+ или сертификат CELTA/TESOL.',
      'Every teacher holds IELTS 7.5+ or a CELTA/TESOL certificate.',
    ),
  },
  {
    key: 'advantages',
    order: 6,
    eyebrow: L('Afzalliklar', 'Преимущества', 'Advantages'),
    title: L(
      'Nega aynan bizni tanlashadi?',
      'Почему выбирают именно нас?',
      'Why students choose us',
    ),
  },
  {
    key: 'problems',
    order: 7,
    eyebrow: L('Muammolar', 'Проблемы', 'Problems'),
    title: L(
      'Sizning ham farzandingizda shunday muammolar bormi?',
      'У вашего ребёнка тоже есть такие проблемы?',
      'Does your child have these problems too?',
    ),
    subtitle: L(
      "Har bir muammoning yechimi bor — biz uni birinchi darsdayoq ko'rsatamiz.",
      'У каждой проблемы есть решение — мы покажем его уже на первом уроке.',
      'Every problem has a solution — we show it in the very first lesson.',
    ),
    ctaLabel: L('Yechimlarni ko‘rish', 'Посмотреть решения', 'See the solutions'),
    ctaHref: '/parents-solutions',
  },
  { key: 'promotions', order: 8 },
  {
    key: 'careers',
    order: 9,
    eyebrow: L('Karyera', 'Карьера', 'Careers'),
    title: L(
      "Jamoamizning bir bo'lagiga aylaning!",
      'Станьте частью нашей команды!',
      'Become a part of our team!',
    ),
    subtitle: L(
      'Ustoz, administrator yoki dizayner — bizda oching vakansiyalar bor.',
      'Преподаватель, администратор или дизайнер — у нас есть открытые вакансии.',
      'Teacher, administrator or designer — we have open positions.',
    ),
    ctaLabel: L('Vakansiyalar', 'Вакансии', 'Open positions'),
    ctaHref: '/join-team',
    imageUrl: PHOTO.team,
  },
  {
    key: 'courses',
    order: 10,
    eyebrow: L('Xizmatlar', 'Услуги', 'Services'),
    title: L('Kurslarimiz', 'Наши курсы', 'Our courses'),
    subtitle: L(
      'Yoshingiz va maqsadingizga mos dasturni tanlang.',
      'Выберите программу под ваш возраст и цель.',
      'Choose the programme that matches your age and goal.',
    ),
  },
  {
    key: 'testimonials',
    order: 11,
    eyebrow: L('Fikrlar', 'Отзывы', 'Reviews'),
    title: L('Mijozlar fikri!', 'Отзывы клиентов!', 'What our clients say'),
  },
  {
    key: 'materials',
    order: 12,
    eyebrow: L('Materiallar', 'Материалы', 'Materials'),
    title: L('Bepul o‘quv materiallari', 'Бесплатные учебные материалы', 'Free study materials'),
    subtitle: L(
      "Darsliklar, audio mashqlar, video darslar va foto lug'atlar.",
      'Учебники, аудио-упражнения, видеоуроки и фотословари.',
      'Coursebooks, audio drills, video lessons and picture dictionaries.',
    ),
  },
  {
    key: 'faq',
    order: 13,
    eyebrow: L('FAQ', 'FAQ', 'FAQ'),
    title: L(
      "Ko'p so'raladigan savollar",
      'Часто задаваемые вопросы',
      'Frequently asked questions',
    ),
  },
  {
    key: 'contact',
    order: 14,
    eyebrow: L('Aloqa', 'Контакты', 'Contact'),
    title: L('Biz bilan bog‘laning', 'Свяжитесь с нами', 'Get in touch'),
    subtitle: L(
      "Filialga keling yoki qo'ng'iroq qiling — sinov darsiga yozib qo'yamiz.",
      'Приходите в филиал или позвоните — запишем на пробный урок.',
      'Visit a branch or call us — we will book your trial lesson.',
    ),
  },
];

export const BRANCHES = [
  {
    name: L('Chilonzor filiali', 'Филиал Чиланзар', 'Chilonzor branch'),
    address: L(
      "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi, 12-uy",
      'г. Ташкент, Чиланзарский район, проспект Бунёдкор, 12',
      '12 Bunyodkor Avenue, Chilonzor district, Tashkent',
    ),
    phones: ['+998 71 205-03-33'],
    workingHours: L(
      'Dushanba – Shanba: 08:00 – 20:00',
      'Понедельник – Суббота: 08:00 – 20:00',
      'Monday – Saturday: 08:00 – 20:00',
    ),
    mapEmbedUrl:
      'https://yandex.uz/map-widget/v1/?ll=69.204%2C41.285&z=15&text=Toshkent%20Chilonzor',
    mapLinkUrl: 'https://yandex.uz/maps/10335/tashkent/?ll=69.204%2C41.285&z=15',
    lat: 41.285,
    lng: 69.204,
    imageUrl: PHOTO.classroom,
    order: 1,
  },
  {
    name: L('Yunusobod filiali', 'Филиал Юнусабад', 'Yunusobod branch'),
    address: L(
      "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 108-uy",
      'г. Ташкент, Юнусабадский район, проспект Амира Темура, 108',
      '108 Amir Temur Avenue, Yunusobod district, Tashkent',
    ),
    phones: ['+998 71 205-53-33'],
    workingHours: L(
      'Dushanba – Shanba: 09:00 – 21:00',
      'Понедельник – Суббота: 09:00 – 21:00',
      'Monday – Saturday: 09:00 – 21:00',
    ),
    mapEmbedUrl:
      'https://yandex.uz/map-widget/v1/?ll=69.289%2C41.351&z=15&text=Toshkent%20Yunusobod',
    mapLinkUrl: 'https://yandex.uz/maps/10335/tashkent/?ll=69.289%2C41.351&z=15',
    lat: 41.351,
    lng: 69.289,
    imageUrl: PHOTO.students,
    order: 2,
  },
];

export const HERO_SLIDES = [
  {
    headline: L(
      'Kafolatlangan <mark>IELTS 7+</mark> yoki pulingiz qaytariladi',
      'Гарантированный <mark>IELTS 7+</mark> или возврат денег',
      'Guaranteed <mark>IELTS 7+</mark> or your money back',
    ),
    subtitle: L(
      "2 500 dan ortiq o'quvchi maqsadiga erishdi. Birinchi dars — bepul.",
      'Более 2 500 студентов достигли своей цели. Первый урок — бесплатно.',
      'More than 2,500 students have reached their goal. The first lesson is free.',
    ),
    ctaLabel: L('Birinchi darsga yozilish', 'Записаться на первый урок', 'Book your first lesson'),
    ctaHref: '#lead',
    imageUrl: PHOTO.students,
    imageAlt: L(
      "Renessans English School o'quvchilari darsda",
      'Студенты Renessans English School на уроке',
      'Renessans English School students in class',
    ),
    order: 1,
  },
  {
    headline: L(
      'Farzandingiz ingliz tilida <mark>erkin gapirsin</mark>',
      'Пусть ваш ребёнок <mark>свободно говорит</mark> по-английски',
      'Let your child <mark>speak freely</mark> in English',
    ),
    subtitle: L(
      "Kids English: 7–12 yosh, o'yin asosidagi metodika, guruhda 10 tadan ko'p emas.",
      'Kids English: 7–12 лет, игровая методика, не более 10 детей в группе.',
      'Kids English: ages 7–12, game-based methodology, no more than 10 per group.',
    ),
    ctaLabel: L('Kids English haqida', 'О курсе Kids English', 'About Kids English'),
    ctaHref: '/courses/kids-english',
    imageUrl: PHOTO.kids,
    imageAlt: L(
      'Kids English guruhidagi bolalar',
      'Дети в группе Kids English',
      'Children in the Kids English group',
    ),
    order: 2,
  },
];

export const STATS = [
  {
    value: '6+',
    label: L('yillik tajriba', 'лет опыта', 'years of experience'),
    icon: 'CalendarDays',
    order: 1,
  },
  {
    value: '2 500+',
    label: L("mamnun o'quvchilar", 'довольных студентов', 'happy students'),
    icon: 'Users',
    order: 2,
  },
  {
    value: '200+',
    label: L('ijobiy IELTS natijalari', 'высоких результатов IELTS', 'strong IELTS results'),
    icon: 'Trophy',
    order: 3,
  },
  {
    value: '40+',
    label: L('xodimlar soni', 'сотрудников', 'staff members'),
    icon: 'GraduationCap',
    order: 4,
  },
];
