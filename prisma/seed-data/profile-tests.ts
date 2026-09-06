import { L } from './common';

/**
 * The two questionnaires the school runs after a placement paper. Neither has a
 * right answer: each option counts towards a profile, and the commonest profile
 * is the result.
 *
 * Options are keyed by their letter exactly as the printed papers score them —
 * "count how many A / B / C you chose". See the note on LEARNING_STYLE below for
 * where that literal reading and the wording of an option disagree.
 */
export type ProfileQuestion = {
  prompt: string;
  /** [option text, profile key] in the order the paper prints them. */
  options: [string, string][];
};

export type ProfileBand = {
  key: string;
  levelName: string;
  title: ReturnType<typeof L>;
  description: ReturnType<typeof L>;
};

/**
 * Axborotni qabul qilish uslubi testi — 10 questions, three options each.
 *
 * The paper scores it by letter: mostly A is visual, B auditory, C kinesthetic.
 * In questions 4, 5, 8 and 10 the options are not printed in that order — Q4's
 * A is "Ovoz (kimningdir ovozi)", which describes the auditory learner — so a
 * literal count and the wording disagree. The letters are kept, because that is
 * how the school marks the paper today, and each option carries its key in the
 * database so the mapping can be corrected in the admin without a migration.
 */
export const LEARNING_STYLE: ProfileQuestion[] = [
  {
    prompt: 'Biror ma’lumotni eslash uchun siz odatda:',
    options: [
      ['U yozilgan daftarni yoki sahifani ko‘z oldingizga keltirasiz.', 'A'],
      ['O‘sha paytda eshitilgan tovush yoki so‘zlarni eslaysiz.', 'B'],
      ['O‘sha vaziyatda nima qilganingizni eslaysiz.', 'C'],
    ],
  },
  {
    prompt: 'Sizga yoqimli voqeani eslatadigan narsa:',
    options: [
      ['Suratlar yoki videolar.', 'A'],
      ['O‘sha paytda chalinar edi deb eslaydigan qo‘shiq.', 'B'],
      ['O‘sha his-tuyg‘ularni yana bir bor boshdan kechirish.', 'C'],
    ],
  },
  {
    prompt: 'Film tomosha qilayotganda siz ko‘proq e’tibor berasiz:',
    options: [
      ['Tasvir sifati, chiroyli kadrlar.', 'A'],
      ['Musiqa va ovozlar, tarjima sifati.', 'B'],
      ['Aktyorlarning harakati va hissiyotiga.', 'C'],
    ],
  },
  {
    prompt: 'Siz uchun eng oson eslab qolish mumkin bo‘lgan narsa:',
    options: [
      ['Ovoz (kimningdir ovozi).', 'A'],
      ['Yuzlar (odamlarning qiyofasi).', 'B'],
      ['Sanalar yoki raqamlar.', 'C'],
    ],
  },
  {
    prompt: 'Maktabda siz ma’lumotni qanday eslab qolardingiz?',
    options: [
      ['Shpargalka yozib.', 'A'],
      ['Qayta-qayta ovoz chiqarib takrorlab.', 'B'],
      ['O‘qituvchini diqqat bilan tinglab.', 'C'],
    ],
  },
  {
    prompt: 'Kimnidir o‘ylaganingizda, siz odatda:',
    options: [
      ['Uning yuzini eslaysiz.', 'A'],
      ['Uning ovozini eslaysiz.', 'B'],
      ['Uning harakatlarini yoki yurish-turishini eslaysiz.', 'C'],
    ],
  },
  {
    prompt: 'Agar biror so‘zni eslay olmasangiz, birinchi esingizga keladigan narsa:',
    options: [
      ['So‘zning ma’nosi.', 'A'],
      ['Birinchi harfi.', 'B'],
      ['So‘z bilan bog‘liq assotsiatsiya.', 'C'],
    ],
  },
  {
    prompt: 'Lug‘atdan so‘zni izlayotganda siz odatda:',
    options: [
      ['Tezroq varaqlash uchun barmog‘ingizni namlaysiz.', 'A'],
      ['So‘zni og‘zingizda aytmasdan, harflariga qaraysiz.', 'B'],
      ['So‘zni baland ovozda talaffuz qilasiz.', 'C'],
    ],
  },
  {
    prompt: 'Ishlayotganingizda yoki o‘qiyotganingizda atrofdagi shovqin sizga:',
    options: [
      ['Umuman xalaqit bermaydi.', 'A'],
      ['Hatto yordam beradi, agar u yumshoq va ritmik bo‘lsa.', 'B'],
      ['Juda halal beradi, e’tiborim chalg‘iydi.', 'C'],
    ],
  },
  {
    prompt: 'Biror ma’lumotni (masalan, sana yoki qoida) eslash uchun siz:',
    options: [
      ['Uni yodlayotgan paytda nima qilganingizni eslaysiz.', 'A'],
      ['U yozilgan qog‘ozni yoki joyni ko‘z oldingizga keltirasiz.', 'B'],
      ['Yodlayotgan paytda aytgan so‘zlaringizni eslaysiz.', 'C'],
    ],
  },
];

export const LEARNING_STYLE_BANDS: ProfileBand[] = [
  {
    key: 'A',
    levelName: 'Vizual',
    title: L('Vizual (ko‘ruv orqali)', 'Визуал (через зрение)', 'Visual learner'),
    description: L(
      'Siz uchun rasm, yozuv, rang, shakl juda muhim. Ma’lumotni ko‘rish orqali eslab qolasiz. Qog‘oz, grafik, jadval va ranglar yordam beradi.',
      'Для вас важны картинки, записи, цвет и форма. Вы запоминаете информацию, когда видите её. Помогают бумага, графики, таблицы и цвета.',
      'Pictures, writing, colour and shape matter to you. You remember what you see, and paper, charts, tables and colour help.',
    ),
  },
  {
    key: 'B',
    levelName: 'Audial',
    title: L('Audial (eshitish orqali)', 'Аудиал (через слух)', 'Auditory learner'),
    description: L(
      'Siz uchun tovush, ohang, ritm va nutq muhim. Ma’lumotni eshitib, muhokama qilib yoki baland ovozda o‘qib yodlaysiz.',
      'Для вас важны звук, интонация, ритм и речь. Вы запоминаете, когда слышите, обсуждаете или читаете вслух.',
      'Sound, tone, rhythm and speech matter to you. You remember by listening, discussing or reading aloud.',
    ),
  },
  {
    key: 'C',
    levelName: 'Kinestetik',
    title: L(
      'Kinestetik (harakat va his orqali)',
      'Кинестетик (через движение)',
      'Kinesthetic learner',
    ),
    description: L(
      'Siz uchun tajriba, harakat, his-tuyg‘u muhim. Biror narsani bajarganingizda, ushlaganingizda, his qilganingizda eslab qolasiz.',
      'Для вас важны опыт, движение и чувства. Вы запоминаете, когда делаете, трогаете и чувствуете.',
      'Experience, movement and feeling matter to you. You remember by doing, holding and feeling.',
    ),
  },
];

/**
 * Temperament aniqlash testi — 10 questions, four options each, for ages 12 and
 * up. Here the letters and the wording agree throughout: a is choleric, b
 * sanguine, v phlegmatic, g melancholic.
 */
export const TEMPERAMENT: ProfileQuestion[] = [
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Men tez harakat qilaman, tinch turolmayman.', 'a'],
      ['Men quvnoqman, hamma bilan do‘st bo‘lishga intilaman.', 'b'],
      ['Men tinch va osoyishta yuraman.', 'v'],
      ['Men sokin, kam gapiradigan tinch odamman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Agar kimdir meni asabiy qilsa, darhol javob qaytaraman.', 'a'],
      ['Men ko‘p kulaman va hazilni yoqtiraman.', 'b'],
      ['Men o‘ylab, keyin gapiraman.', 'v'],
      ['Men o‘zimni sirli tutaman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Menga yangi mashg‘ulotlar, o‘yinlar yoqadi.', 'a'],
      ['Men do‘stlar bilan yangi narsalarni sinab ko‘rishni yoqtiraman.', 'b'],
      [
        'Men yangiliklardan ko‘ra odatlangan mashg‘ulotlar bilan shug‘ullanishni afzal ko‘raman.',
        'v',
      ],
      ['Men yangiliklarni darhol sinab ko‘rmayman va foydalanishdan cho‘chiyman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Men musobaqalarni yoqtiraman va g‘olib bo‘lishni xohlayman.', 'a'],
      ['Men jamoa bilan o‘ynashni yoqtiraman.', 'b'],
      ['Men jimgina o‘zimcha ishlashni yoqtiraman.', 'v'],
      ['Men ko‘p hollarda o‘ynashdan tashqaridan o‘yinni kuzatishni afzal ko‘raman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Menga biror ish buyurishsa ko‘p holda uni tezda qilishni xohlayman.', 'a'],
      ['Men har doim ish buyurishsa oxiriga yetkizmasligim mumkin, ba’zida chalg‘ib ketaman.', 'b'],
      ['Menga biror ish buyurilsa sekin bajaraman, lekin aniq ishlayman.', 'v'],
      ['Men harakat qilishdan oldin yaxshilab o‘ylab olaman va keyin bajaraman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Men kutishga toqatim yo‘q.', 'a'],
      ['Men kutish paytida o‘zimni nimadir bilan band qilaman.', 'b'],
      ['Men sabr bilan kutaman.', 'v'],
      ['Men kutish paytida asabiylashaman va jim qolaman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Agar biror narsa noto‘g‘ri bo‘lsa, men uni darhol o‘ziga ochiqchasiga aytaman.', 'a'],
      [
        'Men odamlarga ularning aybini ko‘rsam ham, buni tushuntirishda yumshoqroq gapirishni yoqtiraman.',
        'b',
      ],
      ['Men yaxshilab o‘ylab, qulay vaqtini topib aytaman.', 'v'],
      ['Men boshqalarni ranjitib qo‘yishdan qo‘rqaman, shuning uchun indamayman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Men har kuni yangi vazifalar bilan shug‘ullanishni, yangi narsa qilishni yoqtiraman.', 'a'],
      ['Men do‘stlar bilan birga ishlashni yaxshi ko‘raman.', 'b'],
      ['Men o‘zim ishlashni va mustaqillikni yoqtiraman.', 'v'],
      ['Men tinchlik va yolg‘izlikni afzal ko‘raman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Agar biror sohada yutqazsam, tezda asabiylashaman.', 'a'],
      ['Men yutqazsam hech xafa bo‘lmayman.', 'b'],
      ['Men yutqazsam kelasi safar revansh olishga urinaman.', 'v'],
      ['Men yutqazsam, biroz siqilaman, uzoq vaqt xafa yuraman.', 'g'],
    ],
  },
  {
    prompt: 'Sizga eng yaqin javobni tanlang.',
    options: [
      ['Men tez g‘azablanaman, lekin bo‘lgan ishni tezda unutaman.', 'a'],
      ['Men hushchaqchaq odamman, hamma bilan oson chiqishaman.', 'b'],
      ['Men sabrli, tinch, muvozanatli odamman.', 'v'],
      ['Mening ko‘nglim nozik, tez ranjiydigan odamman.', 'g'],
    ],
  },
];

export const TEMPERAMENT_BANDS: ProfileBand[] = [
  {
    key: 'a',
    levelName: 'Xolerik',
    title: L('Xolerik', 'Холерик', 'Choleric'),
    description: L(
      'Energetik, tezkor, kuchli liderlik sifatlari bor, lekin ba’zida sabrsiz. Stressda ham faol.',
      'Энергичный, быстрый, с сильными лидерскими качествами, но иногда нетерпеливый. Активен даже в стрессе.',
      'Energetic and quick, with strong leadership instincts but not much patience. Stays active under stress.',
    ),
  },
  {
    key: 'b',
    levelName: 'Sangvinik',
    title: L('Sangvinik', 'Сангвиник', 'Sanguine'),
    description: L(
      'Ijtimoiy, quvnoq, ijobiy. Tez moslashadi, yangi narsalardan zavqlanadi, lekin doimiylikda qiynaladi.',
      'Общительный, весёлый, позитивный. Быстро приспосабливается и любит новое, но с постоянством сложнее.',
      'Sociable, cheerful and positive. Adapts quickly and enjoys novelty, but finds routine harder.',
    ),
  },
  {
    key: 'v',
    levelName: 'Flegmatik',
    title: L('Flegmatik', 'Флегматик', 'Phlegmatic'),
    description: L(
      'Barqaror, o‘ylangan, tinch. Sekin, lekin ishonchli. Stressda sovuqqon.',
      'Устойчивый, обдуманный, спокойный. Медленно, но надёжно. В стрессе хладнокровен.',
      'Steady, considered and calm. Slow but reliable, and cool under stress.',
    ),
  },
  {
    key: 'g',
    levelName: 'Melanxolik',
    title: L('Melanxolik', 'Меланхолик', 'Melancholic'),
    description: L(
      'Sezgir, his-tuyg‘uli, o‘z ichki dunyosiga chuqur sho‘ng‘igan. Boshqalar hislarini kuchli sezadi.',
      'Чувствительный, эмоциональный, погружённый в свой внутренний мир. Тонко чувствует других.',
      'Sensitive and emotional, deeply inward. Feels other people’s moods keenly.',
    ),
  },
];
