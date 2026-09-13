// Определения фреймворков AARRR и HEART — общие для всех индустрий.
// Индустрия (industries/*.json → frameworks) наполняет эти стадии своими
// метриками; названия, порядок и вопрос стадии живут здесь, чтобы шестнадцать
// файлов не расходились в формулировках одного и того же.
//
// Порядок AARRR — как во вкладке «Основы» (framework.js → FRAMEWORKS):
// Acquisition → Activation → Retention → Referral → Revenue.

export const AARRR_STAGES = [
  {
    key: 'acquisition',
    letter: 'A',
    name: { ru: 'Acquisition — привлечение', en: 'Acquisition' },
    question: {
      ru: 'Откуда приходят люди и сколько стоит их приход?',
      en: 'Where do people come from and what does their arrival cost?',
    },
  },
  {
    key: 'activation',
    letter: 'A',
    name: { ru: 'Activation — активация', en: 'Activation' },
    question: {
      ru: 'Дошли ли они до первой пользы — и как быстро?',
      en: 'Did they reach first value — and how fast?',
    },
  },
  {
    key: 'retention',
    letter: 'R',
    name: { ru: 'Retention — удержание', en: 'Retention' },
    question: {
      ru: 'Возвращаются ли они и складывается ли привычка?',
      en: 'Do they come back, and does a habit form?',
    },
  },
  {
    key: 'referral',
    letter: 'R',
    name: { ru: 'Referral — рекомендации', en: 'Referral' },
    question: {
      ru: 'Приводят ли они других — и сколько таких приходов?',
      en: 'Do they bring others — and how many such arrivals?',
    },
  },
  {
    key: 'revenue',
    letter: 'R',
    name: { ru: 'Revenue — доход', en: 'Revenue' },
    question: {
      ru: 'Сколько денег приносит удержанный пользователь?',
      en: 'How much money does a retained user bring?',
    },
  },
]

// HEART всегда раскладывается как Goal → Signal → Metric: цель формулируется
// словами, сигнал — это наблюдаемое поведение, метрика — число. Без первых двух
// шагов остаётся набор чисел без объяснения, зачем их считают.
export const HEART_DIMS = [
  {
    key: 'happiness',
    letter: 'H',
    name: { ru: 'Happiness — удовлетворённость', en: 'Happiness' },
    about: {
      ru: 'Субъективная оценка: что человек думает о продукте, когда его спрашивают.',
      en: 'The subjective side: what a person thinks about the product when asked.',
    },
  },
  {
    key: 'engagement',
    letter: 'E',
    name: { ru: 'Engagement — вовлечённость', en: 'Engagement' },
    about: {
      ru: 'Глубина взаимодействия активных: частота, длина, объём сделанного.',
      en: 'Depth of interaction among the active: frequency, length, volume of work done.',
    },
  },
  {
    key: 'adoption',
    letter: 'A',
    name: { ru: 'Adoption — освоение', en: 'Adoption' },
    about: {
      ru: 'Доходит ли новое до людей: сколько новых или существующих начали пользоваться.',
      en: 'Whether the new reaches people: how many new or existing users started using it.',
    },
  },
  {
    key: 'retention',
    letter: 'R',
    name: { ru: 'Retention — удержание', en: 'Retention' },
    about: {
      ru: 'Остаются ли пользователи с продуктом на горизонте, важном для этого бизнеса.',
      en: 'Whether users stay with the product over the horizon that matters to this business.',
    },
  },
  {
    key: 'task-success',
    letter: 'T',
    name: { ru: 'Task success — успешность сценария', en: 'Task success' },
    about: {
      ru: 'Получилось ли у человека сделать то, за чем он пришёл, и какой ценой.',
      en: 'Whether the person managed to do what they came for, and at what cost.',
    },
  },
]

export const AARRR_BY_KEY = Object.fromEntries(AARRR_STAGES.map((s) => [s.key, s]))
export const HEART_BY_KEY = Object.fromEntries(HEART_DIMS.map((d) => [d.key, d]))
