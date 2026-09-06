import { L } from './common';
import {
  LEARNING_STYLE,
  LEARNING_STYLE_BANDS,
  TEMPERAMENT,
  TEMPERAMENT_BANDS,
  type ProfileBand,
} from './profile-tests';

/** [prompt, options, index of the correct option, optional image] */
export type SeedChoiceQuestion = [string, string[], number] | [string, string[], number, string];

/** A written answer, graded against every spelling a marker would accept. */
export type SeedTextQuestion = {
  prompt: string;
  answers: string[];
  /** Attached in the admin for the picture questions. */
  image?: string;
};

/** A profile question: every option counts towards a profile key. */
export type SeedProfileQuestion = { prompt: string; options: [string, string][] };

export type SeedQuestion = SeedChoiceQuestion | SeedTextQuestion | SeedProfileQuestion;

export const isChoiceQuestion = (question: SeedQuestion): question is SeedChoiceQuestion =>
  Array.isArray(question);

export const isTextQuestion = (question: SeedQuestion): question is SeedTextQuestion =>
  !Array.isArray(question) && 'answers' in question;

export const isProfileQuestion = (question: SeedQuestion): question is SeedProfileQuestion =>
  !Array.isArray(question) && 'options' in question;

/**
 * The reading passage for Part 3. The runner shows one question per screen, so
 * the text travels with each of its questions rather than sitting on a page of
 * its own.
 */
const MOLLY = [
  "I am Molly. I'm fourteen. My hobbies are swimming, cooking and skiing. I have got a dog and a cat.",
  'We have five family members in our family including me. My mother is a model. She is 180 cm tall.',
  'My father is a pilot. He had to arrive from America yesterday, but his flight was canceled and he',
  'went to Turkey. My brother is an artist. He can draw well. My sister is a cute girl. She is playing now.',
  "I'm older than my sister, so I don't like playing dolls. I have a lot of dreams. I have never been",
  "abroad. I would like to go to Egypt, Japan and China. I'm going to learn Japanese next year.",
].join(' ');

const reading = (question: string, options: string[], correct: number): SeedChoiceQuestion => [
  `${MOLLY}\n\n${question}`,
  options,
  correct,
];

/**
 * The Kids paper, answered by choosing rather than writing. Part 2 keeps the
 * school's own three options per word; the other parts follow the same shape,
 * with distractors drawn from the passage so a guess is not free.
 */
export const KIDS_QUESTIONS: SeedQuestion[] = [
  // ---- Part 1: look at the picture, choose the word ----
  ['Look at the picture and choose the word.', ['Car', 'Bus', 'Bike'], 0, '/tests/kids/car.png'],
  ['Look at the picture and choose the word.', ['Run', 'Swim', 'Jump'], 1, '/tests/kids/swim.png'],
  [
    'Look at the picture and choose the word.',
    ['Basket', 'Box', 'Suitcase'],
    2,
    '/tests/kids/suitcase.png',
  ],
  [
    'Look at the picture and choose the word.',
    ['Newspaper', 'Book', 'Letter'],
    0,
    '/tests/kids/newspaper.png',
  ],
  [
    'Look at the picture and choose the word.',
    ['Hook', 'Bell', 'Anchor'],
    2,
    '/tests/kids/anchor.png',
  ],
  [
    'Look at the picture and choose the word.',
    ['Knee', 'Elbow', 'Shoulder'],
    1,
    '/tests/kids/elbow.png',
  ],

  // ---- Part 2: choose the translation (the school's own options) ----
  ['Sit', ['Вниз / pastga', "Сидеть / o'tirmoq", 'Вставать / turmoq'], 1],
  ['Cups', ['Кепка / kepka', 'Стакан / stakan', 'Чашка / chashka'], 2],
  ['Drop', ['Уронить / tushirib yubormoq', "Поднимать / ko'tarmoq", "Ставить / qo'ymoq"], 0],
  ['Meat', ['Встречать / uchrashmoq', "Мясо / go'sht", 'Мёд / asal'], 1],
  ['Audience', ['Зрители / tomoshabinlar', 'Музыка / musiqa', 'Аудио / ovoz'], 0],
  ['Steam', ['Команда / jamoa', "Украсть / o'g'irlamoq", "Пар / bug', par"], 2],

  // ---- Part 3: read the text, choose the answer ----
  reading("What's her name?", ['Molly', 'Sophie', 'Emma'], 0),
  reading('How old is she?', ['Twelve', 'Fourteen', 'Sixteen'], 1),
  reading(
    'What is her sister doing at the moment?',
    ['She is reading', 'She is sleeping', 'She is playing'],
    2,
  ),
  reading('What does her father do?', ['He is a pilot', 'He is an artist', 'He is a driver'], 0),
  reading(
    "What's her future plan?",
    [
      'She is going to learn Chinese',
      'She is going to learn Japanese',
      'She is going to visit Egypt',
    ],
    1,
  ),
  reading("What's her mother's job?", ['She is a teacher', 'She is a doctor', 'She is a model'], 2),
  reading(
    'What did her father do yesterday?',
    ['He went to Turkey', 'He went to America', 'He stayed at home'],
    0,
  ),
  reading('Does she have any pets?', ["No, she doesn't", 'Yes, she does', 'Only a bird'], 1),
  reading(
    'Which countries does she want to visit?',
    ['Turkey, America and Egypt', 'Japan, Korea and China', 'Egypt, Japan and China'],
    2,
  ),
  reading('How tall is her mother?', ['180 cm', '160 cm', '175 cm'], 0),
  reading(
    'What can her brother do?',
    ['He can sing well', 'He can draw well', 'He can swim well'],
    1,
  ),
  reading(
    'Which countries has Molly been to?',
    ['Egypt and Japan', 'Turkey', 'She has never been abroad'],
    2,
  ),
  reading('Who is younger? Molly or her sister?', ['Her sister', 'Molly', 'They are twins'], 0),
  reading('How many people are there in her family?', ['Four', 'Five', 'Six'], 1),
  reading(
    'What does Molly like doing?',
    ['Reading, singing and dancing', 'Playing dolls and drawing', 'Swimming, cooking and skiing'],
    2,
  ),

  // ---- Part 4: choose the sentence in the correct order ----
  [
    'Choose the correct order:\nloudly / singing / she / is',
    ['She is singing loudly.', 'She singing is loudly.', 'Singing she is loudly.'],
    0,
  ],
  [
    'Choose the correct order:\nbananas / I / like',
    ['Like I bananas.', 'I like bananas.', 'Bananas like I.'],
    1,
  ],
  [
    'Choose the correct order:\ndoes / do / evening / he / what / in / the',
    [
      'What he does do in the evening?',
      'Does what he do in the evening?',
      'What does he do in the evening?',
    ],
    2,
  ],
  [
    'Choose the correct order:\nalways / milk / my sister / drinks',
    [
      'My sister always drinks milk.',
      'My sister drinks always milk.',
      'Milk always drinks my sister.',
    ],
    0,
  ],
  [
    'Choose the correct order:\ndid / listen / not / to / I / music',
    ['I not did listen to music.', 'I did not listen to music.', 'Did I not listen music to.'],
    1,
  ],
  [
    'Choose the correct order:\nis / he / play / to / football / going',
    [
      'He is going play to football.',
      'He going is to play football.',
      'He is going to play football.',
    ],
    2,
  ],
  [
    'Choose the correct order:\nmy / sister / something / reading / interesting / was',
    [
      'My sister was reading something interesting.',
      'My sister reading was something interesting.',
      'Something interesting my sister reading was.',
    ],
    0,
  ],
  [
    'Choose the correct order:\nwill / in / car / the / I / not / put / it',
    [
      'I not will put it in the car.',
      'I will not put it in the car.',
      'I will put not it in the car.',
    ],
    1,
  ],
];

export const GENERAL_QUESTIONS: SeedQuestion[] = [
  [
    "Manager: Where's Mr Davidson?\nAssistant: Oh, he's _____ London today.",
    ['in', 'on', 'to', 'at'],
    0,
  ],
  [
    'Shop Assistant: Can I help you?\nCustomer: Yes, I\u2019d like to buy _____ trousers.',
    ['a', 'an', 'this', 'these'],
    3,
  ],
  ['My mother and father _____ both very tall.', ['is', "isn't", 'are', "aren't"], 2],
  [
    "Ayla: That's a nice table, Sophie! Is it new?\nSophie: Oh no, it's my _____ old table.",
    ['mother', 'mothers', "mother's", "mothers'"],
    2,
  ],
  [
    "Father: Are we ready to go?\nDaughter: No, Mum can't find _____ hat.",
    ['she', 'his', 'her', 'their'],
    2,
  ],
  [
    'A: _____ you like cats?\nB: No, I _____',
    ['Do / do', "Do / don't", "Does / don't", "Do / doesn't"],
    1,
  ],
  [
    "Mother: Where's that fish? It was on the table.\nDaughter: Oh no! The cat _____ it.",
    ['eat', 'eats', 'is eating', 'are eating'],
    2,
  ],
  [
    "Alicia: I'm going to the supermarket. Do you want anything?\nPeter: Can you get _____ milk, please?",
    ['a', 'any', 'some', 'every'],
    2,
  ],
  [
    'Amanda: I like your new sofa.\nFahima: Thanks. It\u2019s _____ comfortable than the other one we had.',
    ['the most', 'very', 'much', 'more'],
    3,
  ],
  [
    'Tom got the _____ marks in the class for his homework.',
    ['worse', 'worst', 'baddest', 'most bad'],
    1,
  ],
  [
    'Manisha: What did you do at the weekend?\nNicola: I _____ tennis with my friend on Saturday.',
    ['play', 'played', 'plays', 'playing'],
    1,
  ],
  ['The beach was very crowded _____ Monday.', ['in', 'on', 'at', 'to'], 1],
  [
    "Wife: Have we got any cheese in the fridge?\nHusband: No, we haven't. I'm _____ buy some this afternoon.",
    ['going', 'go to', 'go', 'going to'],
    3,
  ],
  ['Where _____ you last Tuesday? I tried to phone you.', ['were', 'was', 'are', 'is'], 0],
  [
    "Lucas: Do you play the piano, Natasha?\nNatasha: Well, I _____ play when I was younger, but I can't.",
    ['can', "can't", 'could', "couldn't"],
    2,
  ],
  [
    'Our teacher speaks English to us _____ so that we can understand her.',
    ['slow', 'slower', 'more slow', 'slowly'],
    3,
  ],
  [
    'I _____ the new Batman film yet. Is it any good?',
    ["haven't seen", "didn't see", "don't see", 'am not seen'],
    0,
  ],
  [
    'Sophie: How long _____ married?\nYing Yue: Two years. I met my husband in New York.',
    ['had you got', 'did you get', 'have you been', 'are you being'],
    2,
  ],
  [
    'Which train _____ for when I saw you on the platform on Sunday?',
    ['did you wait', 'were you waiting', 'have you waited', 'are you waiting'],
    1,
  ],
  [
    "You _____ hurry as we've still got twenty minutes before the film starts.",
    ["mustn't", "can't", 'may not', "needn't"],
    0,
  ],
  [
    "Juliana: Do you like Brazilian coffee?\nMiriodere: No I don't, because it's _____ strong.",
    ['too', 'such', 'much', 'enough'],
    0,
  ],
  [
    'Daughter: Mum, my computer is broken again. Can you buy me a new one?\nMother: Ok, I _____ buy you one tomorrow, but not now.',
    ['will', 'may', 'should', 'would'],
    0,
  ],
  [
    'My father has been a pilot _____ twenty years and he still loves his job.',
    ['since', 'for', 'until', 'by'],
    1,
  ],
  [
    "I really enjoy _____ new languages and I'd like to learn Italian soon.",
    ['to learn', 'learning', 'learn', 'learned'],
    1,
  ],
  [
    '_____ people know this but our school has a gym today.',
    ['any', 'A little', 'Few', 'A few'],
    3,
  ],
  ["That's the office _____ my dad works.", ['who', 'where', 'that', 'which'], 1],
  [
    'Wife: Advertising is a big business for musicians.\nHusband: Yes, musicians _____ a lot of money for writing short pieces of music.',
    ['pay', 'paid', 'are paid', 'are paying'],
    2,
  ],
  [
    "Could I possibly _____ some money for the bus fare home? I've lost my bag.",
    ['lend', 'owe', 'borrow', 'need'],
    2,
  ],
  [
    'The studio lights went out, while the footballer _____.',
    ['been interviewed', 'was interviewed', 'was being interviewed', 'was interviewing'],
    2,
  ],
  [
    "Natalia: My new smartphone doesn't seem to work.\nKatie: Oh dear! Perhaps you should take it _____ and ask for a refund.",
    ['up', 'out', 'away', 'back'],
    3,
  ],
  [
    "Shop Assistant: Excuse me, please. Could I get past?\nCustomer: Oh, I'm sorry. I'm getting in the way, _____ I?",
    ["don't", "aren't", "can't", "haven't"],
    1,
  ],
  [
    "Miriam: Are you coming to my party on Tuesday?\nBrian: I'm really sorry, but I _____ to take my daughter to the airport.",
    ['must', 'had', 'have', 'having'],
    2,
  ],
  [
    'Stephen: The concert was fantastic yesterday. You _____ come.\nYuuto: I know. I wanted to, but I had to work late.',
    ['must have', 'could have', 'ought have', 'should have'],
    3,
  ],
  [
    "Look out for a petrol station because I think we're going to run _____ of petrol soon.",
    ['down', 'out', 'off', 'through'],
    1,
  ],
  [
    "Laura: How was the meeting?\nRicardo: It finished late because Victor didn't arrive until 5 pm. He told me he _____ woken up late.",
    ['has', 'had been', 'have', 'had'],
    3,
  ],
  [
    'Son: I had a bit of a stomachache this morning.\nMother: Oh dear! You _____ eaten that chicken last night.',
    ["wouldn't have", "couldn't have", "mustn't have", "shouldn't have"],
    3,
  ],
  [
    "Liam: So, your Dad's got a laptop!\nCian: Yes, I bought it for him last year \u2013 until then he _____ a typewriter!",
    ['used', 'has used', 'has been using', 'had been using'],
    3,
  ],
  [
    "Isabella: The flight is fully booked, so I won't be able to go to Barbados next week.\nSafia: If you _____ the ticket sooner, you'd have found a seat.",
    ['had booked', 'were booking', 'booked', 'would have booked'],
    0,
  ],
  [
    "I think there isn't anyone at home. They _____ gone to the school.",
    ['will have', 'should have', 'might have', 'would have'],
    2,
  ],
  [
    'Sophie: Have they finished interviewing for the manager\u2019s position yet?\nRafi: No, but they _____ all the candidates by next Friday.',
    ["won't see", 'would see', "haven't seen", 'will have seen'],
    3,
  ],
  [
    'Andrew: I picked up some of that cat food you wanted.\nPedro: Oh good. Once _____ to these new cat biscuits, they won\u2019t want to go back to the other stuff.',
    ["we've switched", "we'll be switching", "we'll have switched", "we've been switched"],
    0,
  ],
  [
    'Assistant: What would you do if you _____ in my position?\nManager: Oh, I think I _____ continue.',
    ['was / will be', 'were / will', 'was / had been', 'were / would'],
    3,
  ],
  [
    'David: Did you see the headline this evening?\nNicola: Yes \u2013 the Prime Minister was _____ to resign today.',
    ['charged', 'argued', 'struggled', 'forced'],
    3,
  ],
  [
    'I _____ for arriving so late but I was caught up in a traffic jam in the town centre.',
    ['sorry', 'regret', 'apologize', 'afraid'],
    2,
  ],
  [
    "Daughter: Joanna has been really supportive. I'm so lucky to have her as a friend.\nMother: Yes. Just think \u2013 if you hadn't sat next to her in class at school, you _____ so close.",
    ["won't be", "wouldn't be", "wouldn't have been", "aren't"],
    2,
  ],
];

/** Profile bands match on their key, so the score range is unused. */
function profileBands(bands: ProfileBand[]) {
  return bands.map((band, index) => ({
    profileKey: band.key,
    minScore: 0,
    maxScore: 0,
    levelName: band.levelName,
    courseSlug: undefined,
    title: band.title,
    description: band.description,
    order: index + 1,
  }));
}

export const TEST_CATEGORIES = [
  {
    slug: 'level-kids',
    title: L('KIDS', 'KIDS', 'KIDS'),
    subtitle: L(
      '7–12 yoshdagi bolalar uchun daraja aniqlash testi',
      'Тест на определение уровня для детей 7–12 лет',
      'A placement test for children aged 7–12',
    ),
    icon: 'Baby',
    timeLimitSec: 1800,
    shuffle: false,
    allowBack: true,
    requireContact: true,
    order: 1,
    questions: KIDS_QUESTIONS,
    bands: [
      {
        minScore: 0,
        maxScore: 9,
        levelName: 'Level 01',
        courseSlug: 'kids-english',
        title: L('Level 01', 'Level 01', 'Level 01'),
        description: L(
          'Boshlang‘ich daraja. Harflar, sonlar va kundalik so‘zlardan boshlaymiz.',
          'Начальный уровень. Начнём с букв, цифр и повседневных слов.',
          'A starting level. We begin with letters, numbers and everyday words.',
        ),
        order: 1,
      },
      {
        minScore: 10,
        maxScore: 18,
        levelName: 'Level 02',
        courseSlug: 'kids-english',
        title: L('Level 02', 'Level 02', 'Level 02'),
        description: L(
          'Oddiy gaplarni tushunasiz. Grammatika asoslari ustida ishlaymiz.',
          'Вы понимаете простые предложения. Поработаем над основами грамматики.',
          'You understand simple sentences. We work on the basics of grammar.',
        ),
        order: 2,
      },
      {
        minScore: 19,
        maxScore: 25,
        levelName: 'Level 03',
        courseSlug: 'kids-english',
        title: L('Level 03', 'Level 03', 'Level 03'),
        description: L(
          'Yaxshi natija. Matn o‘qiy olasiz va gap tuza olasiz.',
          'Хороший результат. Вы читаете текст и строите предложения.',
          'A good result. You can read a text and build sentences.',
        ),
        order: 3,
      },
      {
        minScore: 26,
        maxScore: 35,
        levelName: 'Level 04',
        courseSlug: 'kids-english',
        title: L('Level 04', 'Level 04', 'Level 04'),
        description: L(
          'Ajoyib! Yuqori guruhda o‘qishingiz mumkin.',
          'Отлично! Вы можете заниматься в старшей группе.',
          'Excellent! You can join a higher group.',
        ),
        order: 4,
      },
    ],
  },
  {
    slug: 'level-general',
    title: L('GENERAL', 'GENERAL', 'GENERAL'),
    subtitle: L(
      'Kattalar uchun umumiy ingliz tili darajasini aniqlash testi',
      'Тест на определение общего уровня английского для взрослых',
      'A general English placement test for adults',
    ),
    icon: 'Users',
    timeLimitSec: 2400,
    shuffle: false,
    allowBack: true,
    requireContact: true,
    order: 2,
    questions: GENERAL_QUESTIONS,
    bands: [
      {
        minScore: 0,
        maxScore: 8,
        levelName: 'Beginner',
        courseSlug: 'general-english',
        title: L('Beginner (A1)', 'Beginner (A1)', 'Beginner (A1)'),
        description: L(
          'Noldan boshlaymiz — General English Beginner guruhi siz uchun.',
          'Начинаем с нуля — вам подойдёт группа General English Beginner.',
          'We start from zero — the General English Beginner group is for you.',
        ),
        order: 1,
      },
      {
        minScore: 9,
        maxScore: 18,
        levelName: 'Elementary',
        courseSlug: 'general-english',
        title: L('Elementary (A2)', 'Elementary (A2)', 'Elementary (A2)'),
        description: L(
          'Oddiy suhbatni tushunasiz. Elementary guruhida grammatikani mustahkamlaymiz.',
          'Вы понимаете простую речь. В группе Elementary укрепим грамматику.',
          'You follow simple conversation. The Elementary group will consolidate your grammar.',
        ),
        order: 2,
      },
      {
        minScore: 19,
        maxScore: 27,
        levelName: 'Pre-Intermediate',
        courseSlug: 'general-english',
        title: L('Pre-Intermediate (B1)', 'Pre-Intermediate (B1)', 'Pre-Intermediate (B1)'),
        description: L(
          'Kundalik mavzularda gapira olasiz. Endi ravonlik ustida ishlaymiz.',
          'Вы говорите на бытовые темы. Теперь работаем над беглостью.',
          'You can talk about everyday topics. Now we work on fluency.',
        ),
        order: 3,
      },
      {
        minScore: 28,
        maxScore: 36,
        levelName: 'Intermediate',
        courseSlug: 'general-english',
        title: L('Intermediate (B1+)', 'Intermediate (B1+)', 'Intermediate (B1+)'),
        description: L(
          'Yaxshi baza. IELTS ga tayyorgarlikni boshlashingiz mumkin.',
          'Хорошая база. Можно начинать подготовку к IELTS.',
          'A solid base — you are ready to start IELTS preparation.',
        ),
        order: 4,
      },
      {
        minScore: 37,
        maxScore: 45,
        levelName: 'Upper-Intermediate',
        courseSlug: 'ielts',
        title: L('Upper-Intermediate (B2)', 'Upper-Intermediate (B2)', 'Upper-Intermediate (B2)'),
        description: L(
          "Zo'r natija! IELTS 7+ guruhiga to'g'ridan-to'g'ri qo'shilishingiz mumkin.",
          'Отличный результат! Можно сразу в группу IELTS 7+.',
          'Excellent result! You can join the IELTS 7+ group straight away.',
        ),
        order: 5,
      },
    ],
  },
  {
    slug: 'learning-style',
    title: L(
      'Axborotni qabul qilish uslubi',
      'Стиль восприятия информации',
      'How you take in information',
    ),
    subtitle: L(
      'Qaysi yo‘l bilan osonroq o‘rganishingizni aniqlang — 10 ta savol',
      'Узнайте, каким способом вам легче учиться — 10 вопросов',
      'Find out how you learn most easily — 10 questions',
    ),
    icon: 'Eye',
    timeLimitSec: null,
    resultMode: 'PROFILE' as const,
    shuffle: false,
    allowBack: true,
    // The contact details were already taken by the placement paper this
    // follows, so the result appears straight away.
    requireContact: false,
    order: 3,
    questions: LEARNING_STYLE,
    bands: profileBands(LEARNING_STYLE_BANDS),
  },
  {
    slug: 'temperament',
    title: L('Temperament aniqlash testi', 'Определение темперамента', 'Temperament test'),
    subtitle: L(
      '12 yoshdan kattalar uchun — 10 ta savol',
      'Для тех, кому больше 12 лет — 10 вопросов',
      'For ages 12 and up — 10 questions',
    ),
    icon: 'Smile',
    timeLimitSec: null,
    resultMode: 'PROFILE' as const,
    shuffle: false,
    allowBack: true,
    requireContact: false,
    order: 4,
    questions: TEMPERAMENT,
    bands: profileBands(TEMPERAMENT_BANDS),
  },
];
