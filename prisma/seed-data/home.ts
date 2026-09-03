import { L, PHOTO } from './common';

export const ADVANTAGES = [
  {
    title: L('IELTS 7+ KAFOLATI', 'ГАРАНТИЯ IELTS 7+', 'IELTS 7+ GUARANTEE'),
    description: L(
      "Kursni belgilangan ballsiz tugatgan o'quvchi keyingi kursda bepul o'qiydi.",
      'Если студент не набирает заявленный балл, следующий курс он проходит бесплатно.',
      'Students who miss the target band study the next course free of charge.',
    ),
    icon: 'ShieldCheck',
    order: 1,
  },
  {
    title: L('TEZ NATIJADORLIK', 'БЫСТРЫЙ РЕЗУЛЬТАТ', 'FAST RESULTS'),
    description: L(
      "Har 3 oyda daraja oshadi — natija oylik testlar bilan o'lchanadi.",
      'Уровень растёт каждые 3 месяца — результат измеряется ежемесячными тестами.',
      'A level every three months, measured by monthly progress tests.',
    ),
    icon: 'Rocket',
    order: 2,
  },
  {
    title: L('TALABCHAN USTOZLAR', 'ТРЕБОВАТЕЛЬНЫЕ ПРЕПОДАВАТЕЛИ', 'DEMANDING TEACHERS'),
    description: L(
      'Uy vazifasi har darsda tekshiriladi, davomat ota-onaga yuboriladi.',
      'Домашнее задание проверяется на каждом уроке, посещаемость отправляется родителям.',
      'Homework is checked every lesson and attendance is reported to parents.',
    ),
    icon: 'GraduationCap',
    order: 3,
  },
  {
    title: L('QIZIQARLI DARS USLUBI', 'ИНТЕРЕСНЫЙ ФОРМАТ ЗАНЯТИЙ', 'ENGAGING LESSONS'),
    description: L(
      "Rolli o'yinlar, debat va loyihalar — dars zerikarli o'tmaydi.",
      'Ролевые игры, дебаты и проекты — на занятиях не скучно.',
      'Role plays, debates and projects — lessons are never boring.',
    ),
    icon: 'Sparkles',
    order: 4,
  },
  {
    title: L("DO'STONA MUHIT", 'ДРУЖЕЛЮБНАЯ АТМОСФЕРА', 'FRIENDLY ATMOSPHERE'),
    description: L(
      "Xato qilishdan qo'rqmaydigan, bir-birini qo'llab-quvvatlaydigan guruhlar.",
      'Группы, где не боятся ошибаться и поддерживают друг друга.',
      'Groups where mistakes are safe and students support each other.',
    ),
    icon: 'HeartHandshake',
    order: 5,
  },
];

export const PROBLEMS = [
  {
    title: L("SO'Z YODLASH", 'ЗАУЧИВАНИЕ СЛОВ', 'MEMORISING WORDS'),
    description: L(
      "So'zlarni yodlaydi, lekin gapda ishlata olmaydi.",
      'Ребёнок заучивает слова, но не может использовать их в речи.',
      'They memorise words but cannot use them in a sentence.',
    ),
    icon: 'BookMarked',
    order: 1,
    solution: {
      skill: 'SPEAKING' as const,
      title: L('Kontekst orqali yodlash', 'Запоминание через контекст', 'Learning in context'),
      description: L(
        "Har bir so'z darhol gapda va dialogda ishlatiladi — 3 marta takrorlangach, u faol lug'atga o'tadi.",
        'Каждое слово сразу используется в предложении и диалоге — после трёх повторений оно переходит в активный словарь.',
        'Every word is used immediately in a sentence and a dialogue; after three repetitions it enters the active vocabulary.',
      ),
      imageUrl: PHOTO.classroom,
    },
  },
  {
    title: L("RAVON SO'ZLAY OLMASLIK", 'НЕ МОЖЕТ ГОВОРИТЬ СВОБОДНО', 'CANNOT SPEAK FLUENTLY'),
    description: L(
      "Gapirishga uringanda to'xtab qoladi va xato qilishdan qo'rqadi.",
      'Запинается при попытке говорить и боится ошибиться.',
      'They hesitate when speaking and are afraid of making mistakes.',
    ),
    icon: 'MessageSquare',
    order: 2,
    solution: {
      skill: 'SPEAKING' as const,
      title: L(
        'Kunlik Speaking amaliyoti',
        'Ежедневная практика Speaking',
        'Daily speaking practice',
      ),
      description: L(
        "Har darsning yarmi faqat gapirishga ajratiladi, qo'shimcha bepul Speaking Club ishlaydi.",
        'Половина каждого занятия отведена только на разговор, плюс работает бесплатный Speaking Club.',
        'Half of every lesson is speaking only, plus a free Speaking Club.',
      ),
      imageUrl: PHOTO.students,
    },
  },
  {
    title: L('ESHITIB ANGLAY OLMASLIK', 'НЕ ПОНИМАЕТ НА СЛУХ', 'CANNOT UNDERSTAND SPEECH'),
    description: L(
      "Ona tilida so'zlashuvchilar tez gapirsa, hech narsani tushunmaydi.",
      'Когда носители говорят быстро, ребёнок ничего не понимает.',
      'When native speakers talk at speed, they understand nothing.',
    ),
    icon: 'Headphones',
    order: 3,
    solution: {
      skill: 'LISTENING' as const,
      title: L(
        'Har kuni 15 daqiqa listening',
        'Ежедневные 15 минут listening',
        '15 minutes of listening a day',
      ),
      description: L(
        'Turli aksentlardagi audio materiallar va bosqichma-bosqich tezlashtiriladigan mashqlar.',
        'Аудиоматериалы с разными акцентами и упражнения с постепенным ускорением.',
        'Audio with a range of accents and drills that gradually speed up.',
      ),
    },
  },
  {
    title: L("O'QIB TUSHUNA OLMASLIK", 'НЕ ПОНИМАЕТ ПРОЧИТАННОЕ', 'CANNOT UNDERSTAND TEXTS'),
    description: L(
      "Matnni o'qiydi, lekin mazmunini aytib bera olmaydi.",
      'Читает текст, но не может пересказать его смысл.',
      'They read the text but cannot say what it was about.',
    ),
    icon: 'BookOpen',
    order: 4,
    solution: {
      skill: 'READING' as const,
      title: L('Skimming va scanning', 'Skimming и scanning', 'Skimming and scanning'),
      description: L(
        'Matn bilan ishlashning 5 ta texnikasi va har darsda qisqacha mazmun aytib berish.',
        'Пять техник работы с текстом и краткий пересказ на каждом занятии.',
        'Five text-handling techniques and a short retelling in every lesson.',
      ),
    },
  },
  {
    title: L('MATN TUZA OLMASLIK', 'НЕ УМЕЕТ ПИСАТЬ ТЕКСТЫ', 'CANNOT WRITE'),
    description: L(
      'Esse yoki xat yozishda tuzilmani bilmaydi.',
      'Не знает структуру эссе или письма.',
      'They do not know how to structure an essay or a letter.',
    ),
    icon: 'PenLine',
    order: 5,
    solution: {
      skill: 'WRITING' as const,
      title: L('Tuzilma bo‘yicha yozish', 'Письмо по структуре', 'Writing to a structure'),
      description: L(
        "Har bir esse turi uchun tayyor shablon, ustoz qo'lda tekshirib izoh yozadi.",
        'Готовый шаблон для каждого типа эссе, преподаватель проверяет вручную и пишет комментарии.',
        'A template for every essay type, hand-marked with written feedback.',
      ),
    },
  },
];

export const EXTRA_SOLUTION_NOTE = {
  skill: 'GRANT' as const,
};

export const TESTIMONIALS = [
  {
    authorName: 'Gulnora Alimova',
    authorRole: L('Ota-ona', 'Родитель', 'Parent'),
    content: L(
      'Qizim 4 oyda ingliz tilida erkin gapira boshladi. Ustozlar har hafta natija haqida yozib turishadi.',
      'Дочь через 4 месяца начала свободно говорить по-английски. Преподаватели каждую неделю пишут о результатах.',
      'My daughter started speaking English freely after four months. The teachers report on progress every week.',
    ),
    rating: 5,
    sourceLabel: 'Telegram',
    isFeatured: true,
    order: 1,
  },
  {
    authorName: 'Islom Nazarov',
    authorRole: L("O'quvchi", 'Студент', 'Student'),
    content: L(
      'IELTS kursida 6.0 dan 7.5 ga chiqdim. Mock testlar haqiqiy imtihondan qiyinroq edi.',
      'На курсе IELTS поднялся с 6.0 до 7.5. Mock-тесты были сложнее реального экзамена.',
      'I went from 6.0 to 7.5 on the IELTS course. The mock tests were harder than the real exam.',
    ),
    rating: 5,
    sourceLabel: 'Google',
    isFeatured: true,
    order: 2,
  },
  {
    authorName: 'Kamola Yusupova',
    authorRole: L('Ota-ona', 'Родитель', 'Parent'),
    content: L(
      "O'g'lim darsga boradigan kunni sanab kutadi. Bu men uchun eng katta natija.",
      'Сын считает дни до занятия. Для меня это главный результат.',
      'My son counts down the days to his lesson. That is the result I care about most.',
    ),
    rating: 5,
    sourceLabel: 'Instagram',
    order: 3,
  },
  {
    authorName: 'Rustam Xolmatov',
    authorRole: L("O'quvchi", 'Студент', 'Student'),
    content: L(
      "Korporativ dastur bo'yicha butun bo'limimiz o'qidi. Endi mijozlar bilan ingliz tilida yozishamiz.",
      'По корпоративной программе обучился весь наш отдел. Теперь переписываемся с клиентами на английском.',
      'Our whole department took the corporate programme. We now write to clients in English.',
    ),
    rating: 5,
    order: 4,
  },
  {
    authorName: 'Zilola Hamidova',
    authorRole: L('Ota-ona', 'Родитель', 'Parent'),
    content: L(
      'Guruhda 10 tagina bola bor, shuning uchun ustoz har biriga vaqt ajratadi.',
      'В группе всего 10 детей, поэтому преподаватель уделяет время каждому.',
      'There are only ten children in the group, so the teacher has time for each of them.',
    ),
    rating: 5,
    order: 5,
  },
  {
    authorName: 'Doniyor Ergashev',
    authorRole: L("O'quvchi", 'Студент', 'Student'),
    content: L(
      "Speaking Club bepul va har shanba ishlaydi — aynan shu narsa menga eng ko'p yordam berdi.",
      'Speaking Club бесплатный и работает каждую субботу — именно это помогло мне больше всего.',
      'The Speaking Club is free and runs every Saturday — that helped me the most.',
    ),
    rating: 5,
    sourceLabel: 'Telegram',
    order: 6,
  },
  {
    authorName: 'Mohira Sattorova',
    authorRole: L('Ota-ona', 'Родитель', 'Parent'),
    content: L(
      "Onlayn darslar ham xuddi oflayn kabi jiddiy o'tadi, dars yozuvlari yuboriladi.",
      'Онлайн-занятия проходят так же серьёзно, как офлайн, записи уроков присылают.',
      'Online lessons are as serious as in-person ones, and recordings are sent afterwards.',
    ),
    rating: 4,
    order: 7,
  },
  {
    authorName: 'Sherzod Qosimov',
    authorRole: L("O'quvchi", 'Студент', 'Student'),
    content: L(
      'Grant uchun 7.0 kerak edi — aynan shu ballni oldim va hujjat topshirdim.',
      'Для гранта нужен был 7.0 — именно его и получил, документы подал.',
      'I needed a 7.0 for my scholarship — that is exactly what I got.',
    ),
    rating: 5,
    sourceLabel: 'Google',
    order: 8,
  },
];

export const FAQ_CATEGORIES = [
  { key: 'general', name: L('Umumiy', 'Общие', 'General'), order: 1 },
  {
    key: 'payment',
    name: L("To'lov va chegirmalar", 'Оплата и скидки', 'Payment and discounts'),
    order: 2,
  },
];

export const FAQS = [
  {
    categoryKey: 'general',
    question: L(
      "Ingliz tilini noldan qancha muddatda o'rganish mumkin?",
      'За какой срок можно выучить английский с нуля?',
      'How long does it take to learn English from scratch?',
    ),
    answer: L(
      "Noldan Intermediate darajasigacha o'rtacha 9–12 oy ketadi: har bir daraja 3 oy davom etadi va haftada 3 marta dars bo'ladi.",
      'С нуля до уровня Intermediate в среднем уходит 9–12 месяцев: каждый уровень длится 3 месяца, занятия — 3 раза в неделю.',
      'From zero to Intermediate takes 9–12 months on average: each level runs for three months with three lessons a week.',
    ),
    order: 1,
  },
  {
    categoryKey: 'general',
    question: L(
      'Darslar qanday formatda o‘tiladi?',
      'В каком формате проходят занятия?',
      'What format do the lessons take?',
    ),
    answer: L(
      "Guruh darslari markazda, haftada 3 marta 90 daqiqadan. Online English yo'nalishi ZOOM orqali individual o'tkaziladi.",
      'Групповые занятия проходят в центре 3 раза в неделю по 90 минут. Направление Online English — индивидуально через ZOOM.',
      'Group lessons run at the centre three times a week for 90 minutes. Online English is one-to-one over ZOOM.',
    ),
    order: 2,
  },
  {
    categoryKey: 'general',
    question: L(
      "O'quv markazda kimlar dars beradi?",
      'Кто преподаёт в учебном центре?',
      'Who teaches at the centre?',
    ),
    answer: L(
      "Barcha ustozlarimiz IELTS 7.5+ yoki CELTA/TESOL sertifikatiga ega va ichki tayyorgarlik dasturidan o'tgan.",
      'Все наши преподаватели имеют IELTS 7.5+ или сертификат CELTA/TESOL и прошли внутреннюю программу подготовки.',
      'Every teacher holds IELTS 7.5+ or a CELTA/TESOL certificate and has completed our in-house training.',
    ),
    order: 3,
  },
  {
    categoryKey: 'general',
    question: L(
      'Darslarga qanday yozilish mumkin?',
      'Как записаться на занятия?',
      'How do I sign up for lessons?',
    ),
    answer: L(
      "Saytdagi istalgan «Birinchi darsga yozilish» tugmasini bosing yoki +998 71 205-03-33 raqamiga qo'ng'iroq qiling. Menejer 15 daqiqa ichida bog'lanadi.",
      'Нажмите любую кнопку «Записаться на первый урок» на сайте или позвоните по номеру +998 71 205-03-33. Менеджер свяжется в течение 15 минут.',
      'Press any "Book your first lesson" button on the site or call +998 71 205-03-33. A manager will call you back within 15 minutes.',
    ),
    order: 4,
  },
  {
    categoryKey: 'general',
    question: L('Sinov darsi bepulmi?', 'Пробный урок бесплатный?', 'Is the trial lesson free?'),
    answer: L(
      "Ha, birinchi sinov darsi mutlaqo bepul. Darsdan so'ng darajangiz aniqlanadi va mos guruh tavsiya etiladi.",
      'Да, первый пробный урок полностью бесплатный. После него мы определим ваш уровень и подберём группу.',
      'Yes, the first trial lesson is completely free. Afterwards we assess your level and recommend a group.',
    ),
    order: 5,
  },
  {
    categoryKey: 'payment',
    question: L(
      "To'lovni bo'lib to'lash mumkinmi?",
      'Можно ли оплатить частями?',
      'Can I pay in instalments?',
    ),
    answer: L(
      "Ha, oylik to'lov tizimi mavjud. Aka-uka yoki opa-singil birga o'qisa, 10% chegirma beriladi.",
      'Да, есть помесячная оплата. Для братьев и сестёр, которые учатся вместе, действует скидка 10%.',
      'Yes, monthly payment is available. Siblings studying together receive a 10% discount.',
    ),
    order: 6,
  },
];

const now = new Date();
const startsAt = new Date(now.getFullYear(), now.getMonth(), 1);
const endsAt = new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59);

export const PROMOTION = {
  title: L(
    'Yozgi aksiya: eng yaxshi o‘quvchilarga sovg‘alar',
    'Летняя акция: подарки лучшим студентам',
    'Summer campaign: prizes for the best students',
  ),
  description: L(
    "Aksiya davomida yozilgan barcha o'quvchilar orasida o'quv yili yakunida sovrinlar o'ynatiladi. Shart — darslarga 90% davomat va oylik testlarda 80%+ natija.",
    'Среди всех записавшихся во время акции в конце учебного года разыгрываются призы. Условие — посещаемость 90% и результат 80%+ на ежемесячных тестах.',
    'Everyone who enrols during the campaign enters the end-of-year prize draw. The conditions: 90% attendance and 80%+ on the monthly tests.',
  ),
  prizes: [
    { place: 1, label: L('Umra safari', 'Путёвка в Умру', 'Umrah trip'), icon: 'Trophy' },
    {
      place: 2,
      label: L('Sanatoriyga yo‘llanma', 'Путёвка в санаторий', 'Sanatorium stay'),
      icon: 'Medal',
    },
    { place: 3, label: L('Oilaviy sayohat', 'Семейное путешествие', 'Family trip'), icon: 'Gift' },
  ],
  ctaLabel: L('Aksiyada qatnashish', 'Участвовать в акции', 'Join the campaign'),
  ctaHref: '#lead',
  imageUrl: PHOTO.award,
  startsAt,
  endsAt,
  isActive: true,
  order: 1,
};
