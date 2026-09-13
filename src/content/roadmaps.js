// Роудмапы профессий в данных.
//
// Зачем раздел: на сайте 63 урока, деревья метрик и глоссарий. Человеку,
// который только выбирает профессию, всё это выглядит как склад. Роудмап
// отвечает на другой вопрос: кем можно стать и что учить в каком порядке.
// Уроки при этом становятся его шагами.
//
// Правила контента:
// — Никаких зарплатных вилок и обещаний «выучи за три месяца». И то и другое
//   зависит от рынка и от человека, а прибитое число врёт молча. Сроки стоят
//   диапазоном и помечены как ориентир.
// — Каждый этап заканчивается проверкой: артефактом, который можно показать.
//   Список навыков без критерия закрытия превращается в бесконечный этап.
// — Ловушка этапа: ошибка, на которой люди застревают именно здесь.
// — Ссылки ведут на материалы этого сайта.
//
// Треков три, и это осознанно. Продуктовая аналитика раньше стояла отдельным
// треком, но на рынке это не отдельная профессия, а специализация внутри
// аналитики: эксперименты и юнит-экономика начинаются на middle и приходят
// к человеку, который уже год считает метрики. Отдельный трек создавал
// впечатление, что на входе нужно выбрать одно из двух.
//
// Двуязычность как в остальном контенте: строка либо одна на обе локали,
// либо { ru, en } — резолвится через loc() из lib/i18n.js.

// Оси карты навыков. Это инструменты и области знаний, а не свойства
// характера: по оси «SQL» человек может оценить себя, по оси «аналитическое
// мышление» не может.
//
// Тот же словарь работает названиями направлений в плане занятий: одна ось —
// одно направление, иначе карта и план говорят о разном.
export const skillAxes = [
  { id: 'sql', t: { ru: 'SQL', en: 'SQL' } },
  { id: 'python', t: { ru: 'Python и pandas', en: 'Python and pandas' } },
  { id: 'eng', t: { ru: 'Инженерия данных', en: 'Data engineering' } },
  { id: 'bi', t: { ru: 'BI', en: 'BI' } },
  { id: 'stats', t: { ru: 'Базовая статистика', en: 'Core statistics' } },
  { id: 'advstats', t: { ru: 'Продвинутая статистика', en: 'Advanced statistics' } },
  { id: 'ab', t: { ru: 'A/B-тесты', en: 'A/B testing' } },
  { id: 'ml', t: { ru: 'Машинное обучение', en: 'Machine learning' } },
  { id: 'metrics', t: { ru: 'Метрики и домен', en: 'Metrics and domain' } },
]

// Уровень по четырёхбалльной шкале: 0 — в работе не нужен, 1 — достаточно
// понимать разговор, 2 — пользуетесь под задачу, 3 — уверенно, 4 — основной
// инструмент. Это наша калибровка по описаниям вакансий и по тому, чем эти
// роли занимаются на деле. Это не замер рынка, и спорить с ней нормально.
export const skillLevels = {
  analyst: { sql: 4, python: 3, eng: 1, bi: 4, stats: 4, advstats: 4, ab: 3, ml: 1, metrics: 4 },
  de: { sql: 4, python: 4, eng: 4, bi: 1, stats: 1, advstats: 1, ab: 0, ml: 1, metrics: 2 },
  ds: { sql: 3, python: 4, eng: 2, bi: 1, stats: 4, advstats: 4, ab: 2, ml: 4, metrics: 2 },
}

// Цвет трека. Один на всю страницу: карта навыков, легенда и подпись роли
// должны читаться как одно и то же, иначе карта превращается в ребус.
export const roleColor = {
  analyst: '#0a6c97',
  de: '#9c4f6d',
  ds: '#2f7d63',
}

export const skillScale = {
  ru: ['не нужен', 'понимать разговор', 'под задачу', 'уверенно', 'основной инструмент'],
  en: ['not needed', 'follow the conversation', 'when a task needs it', 'confident', 'main tool'],
}

// Общий фундамент вынесен из профессий отдельно: первые месяцы у всех трёх
// треков совпадают почти полностью, и дублировать их в каждом роудмапе значит
// три раза чинить одно и то же место.
export const foundation = {
  title: { ru: 'Общий фундамент', en: 'The shared foundation' },
  lead: {
    ru: 'Первые месяцы на всех трёх треках выглядят почти одинаково. Пока вы проходите этот блок, специализацию выбирать не нужно: он пригодится на любом из них.',
    en: 'The first months look nearly the same on all three tracks. While you are working through this block you do not need to pick a specialisation: it will be useful on any of them.',
  },
  blocks: [
    {
      title: { ru: 'SQL', en: 'SQL' },
      items: [
        { t: { ru: 'Выборки, фильтрация, агрегация, группировки', en: 'Selects, filtering, aggregation, grouping' } },
        { t: { ru: 'Соединения таблиц всех видов и их последствия для числа строк', en: 'Every kind of join and what it does to the row count' } },
        { t: { ru: 'Подзапросы и CTE', en: 'Subqueries and CTEs' } },
        { t: { ru: 'Оконные функции', en: 'Window functions' } },
        { t: { ru: 'Даты, интервалы, типы и приведение типов', en: 'Dates, intervals, types and casting' } },
        { t: { ru: 'Чтение и разбор чужих запросов', en: 'Reading and unpicking someone else’s queries' } },
      ],
    },
    {
      title: { ru: 'Python', en: 'Python' },
      items: [
        { t: { ru: 'Синтаксис, структуры данных, функции', en: 'Syntax, data structures, functions' } },
        { t: { ru: 'Модули, окружения, установка пакетов', en: 'Modules, environments, installing packages' } },
        { t: { ru: 'Чтение данных из файлов, API и баз', en: 'Reading data from files, APIs and databases' } },
        { t: { ru: 'Git и работа с репозиторием', en: 'Git and working with a repository' } },
      ],
    },
    {
      title: { ru: 'Библиотеки анализа и визуализации', en: 'Analysis and visualisation libraries' },
      items: [
        { t: { ru: 'pandas: загрузка, merge, groupby, сводные таблицы', en: 'pandas: loading, merge, groupby, pivots' } },
        { t: { ru: 'NumPy: массивы и векторизованные вычисления', en: 'NumPy: arrays and vectorised computation' } },
        { t: { ru: 'Matplotlib и Seaborn для разведочного анализа', en: 'Matplotlib and Seaborn for exploratory analysis' } },
        { t: { ru: 'Jupyter как среда разведки данных', en: 'Jupyter as the environment for exploring data' } },
      ],
    },
    {
      title: { ru: 'Электронные таблицы', en: 'Spreadsheets' },
      items: [
        { t: { ru: 'Сводные таблицы и срезы', en: 'Pivot tables and slicers' } },
        { t: { ru: 'Power Query для регулярной обработки', en: 'Power Query for recurring processing' } },
        { t: { ru: 'Функции поиска и формулы массива', en: 'Lookup functions and array formulas' } },
      ],
    },
    {
      title: { ru: 'Устройство данных', en: 'How data is arranged' },
      items: [
        { t: { ru: 'Гранулярность, ключи и связи между таблицами', en: 'Granularity, keys and relations between tables' } },
        { t: { ru: 'Нормализация и денормализация', en: 'Normalisation and denormalisation' } },
        { t: { ru: 'Справочники, версии и изменения задним числом', en: 'Reference data, versions and retroactive changes' } },
        { t: { ru: 'События и агрегаты, часовые пояса и границы периодов', en: 'Events and aggregates, time zones and period boundaries' } },
      ],
    },
    {
      title: { ru: 'Описательная статистика', en: 'Descriptive statistics' },
      items: [
        { t: { ru: 'Меры центра и разброса', en: 'Measures of centre and spread' } },
        { t: { ru: 'Перцентили и квантили', en: 'Percentiles and quantiles' } },
        { t: { ru: 'Формы распределений и асимметрия', en: 'Distribution shapes and skew' } },
        { t: { ru: 'Выбросы и работа с ними', en: 'Outliers and what to do with them' } },
        { t: { ru: 'Доли, отношения и корректная база сравнения', en: 'Shares, ratios and a correct comparison base' } },
      ],
    },
    {
      title: { ru: 'Подача результата', en: 'Presenting the result' },
      items: [
        { t: { ru: 'Выбор типа графика под вопрос', en: 'Choosing a chart type for the question' } },
        { t: { ru: 'Оговорки и границы применимости вывода', en: 'Caveats and the limits of a conclusion' } },
        { t: { ru: 'Письменное и устное объяснение числа', en: 'Explaining a number in writing and out loud' } },
      ],
    },
  ],
  check: {
    ru: 'Возьмите открытый датасет на тему, которая вам интересна, и за вечер найдите в нём пять фактов. К каждому нужен запрос, которым вы его посчитали. Если это получается, фундамент закрыт.',
    en: 'Take an open dataset on a topic you care about and find five facts in it in one evening. Each fact needs the query you computed it with. If that works out, the foundation is closed.',
  },
}

// Профессии. Порядок не случаен: аналитика — самая частая точка входа,
// две другие чаще всего вырастают из неё.
export const roadmaps = [
  {
    id: 'analyst',
    title: { ru: 'Аналитика', en: 'Analytics' },
    tagline: {
      ru: 'Отвечает числами на вопросы бизнеса и продукта: что произошло, почему и что делать дальше',
      en: 'Answers business and product questions with numbers: what happened, why, and what to do next',
    },
    // Как трек называют в вакансиях и в разговоре. Нужны поиску: человек ищет
    // «дата инженер» или ETL, а трек называется «Инженерия данных» — без
    // синонимов запрос не находит ничего. В обеих локалях держим и русские,
    // и английские написания: по-русски вакансию чаще зовут английским словом.
    aliases: {
      ru: ['Data Analyst', 'DA', 'дата-аналитик', 'аналитик данных', 'продуктовый аналитик', 'Product Analyst', 'BI-аналитик'],
      en: ['Data Analyst', 'DA', 'Product Analyst', 'product analytics', 'BI analyst'],
    },
    entry: { ru: 'Самая частая точка входа в данные', en: 'The most common way into data' },
    who: {
      ru: 'Аналитик стоит между вопросом вроде «почему упала выручка» и ответом, на который можно опереться при решении. Примерно половина работы уходит на то, чтобы достать данные и убедиться, что они означают именно то, что вы думаете. Вторая половина — объяснить посчитанное тем, кто будет принимать решение. Ближе к middle к этому добавляются эксперименты: A/B-тесты, юнит-экономика и разговор о том, что делать с продуктом дальше.',
      en: 'An analyst stands between a question like "why did revenue drop" and an answer someone can lean on when deciding. About half the work goes into getting the data and making sure it means what you think it means. The other half is explaining the result to the people who will decide. Closer to middle, experiments join in: A/B tests, unit economics and the conversation about what to do with the product next.',
    },
    day: {
      ru: [
        'Запросы и выгрузки под вопросы команды',
        'Регулярная отчётность и дашборды',
        'Разбор аномалий: это поломка данных или так и есть',
        'Дизайн и разбор A/B-тестов',
        'Исследования под конкретное решение: метрики фич, воронки, когорты',
      ],
      en: [
        'Queries and extracts for the team’s questions',
        'Recurring reporting and dashboards',
        'Investigating anomalies: is the data broken or is this real',
        'Designing and reading A/B tests',
        'Research behind a specific decision: feature metrics, funnels, cohorts',
      ],
    },
    // Стек разложен по этапам работы: плоский список инструментов не объясняет,
    // зачем каждый нужен, и читается как требования вакансии.
    tools: [
      { stage: { ru: 'Достать', en: 'Get it' }, items: ['SQL', 'Excel / Sheets', 'Amplitude / Mixpanel'] },
      { stage: { ru: 'Посчитать', en: 'Crunch it' }, items: ['Python / pandas', 'Git', 'Платформа A/B-тестов'] },
      { stage: { ru: 'Показать', en: 'Show it' }, items: ['BI: Metabase, Superset, DataLens, Tableau'] },
    ],
    where: {
      often: {
        ru: 'Банки и финтех, IT, e-commerce и маркетплейсы, ритейл и FMCG, телеком, консалтинг, реклама, MedTech',
        en: 'Banks and fintech, IT, e-commerce and marketplaces, retail and FMCG, telecom, consulting, advertising, medtech',
      },
      rare: {
        ru: 'Реже нанимают в госсекторе, ЖКХ, энергетике, тяжёлой промышленности, сельском хозяйстве, HoReCa, культуре и НКО. Данные и задачи там есть, но выделенных вакансий мало, а основным инструментом чаще всего остаётся Excel.',
        en: 'Hiring is rarer in the public sector, utilities, energy, heavy industry, agriculture, hospitality, culture and non-profits. The data and the questions are there, but dedicated roles are few and the main tool is usually Excel.',
      },
    },
    // Антипортрет вместо списка добродетелей: «нужна коммуникабельность»
    // проверить нельзя, а «вы регулярно ошибаетесь в цифрах» можно.
    notForYou: {
      ru: [
        'Вы регулярно ошибаетесь в цифрах, и это вас не беспокоит. На отчёты опираются при решениях, поэтому ошибка обходится компании дороже, чем кажется.',
        'Вам не хочется разбираться в чужом бизнесе и интересны только методы. Без понимания домена цифру можно истолковать как угодно.',
        'Вам тяжело объяснять словами то, что вы посчитали. На объяснение уходит примерно половина рабочего времени.',
        'Вам нужен определённый ответ. Заметная часть тестов заканчивается формулировкой «разницы не видно», и это тоже результат.',
      ],
      en: [
        'You make regular slips in numbers and it does not bother you. Reports get used for decisions, so an error costs the company more than it looks.',
        'You do not want to learn someone else’s business and only the methods interest you. Without the domain, a number can be read any way at all.',
        'Explaining what you computed is hard work you would rather skip. The explaining takes about half of the working time.',
        'You need a definite answer. A noticeable share of tests ends with "no visible difference", and that is a result too.',
      ],
    },
    stages: [
      {
        id: 'foundation',
        title: { ru: 'Фундамент', en: 'Foundation' },
        pace: { ru: 'ориентир: 2–4 месяца', en: 'rough guide: 2–4 months' },
        goal: { ru: 'Достать данные и правильно посчитать простую сводку', en: 'Get the data and compute a simple summary correctly' },
        sharedFoundation: true,
        extra: [
          { t: { ru: 'Из чего складывается выручка знакомого вам продукта, на уровне формулы', en: 'What the revenue of a product you know is made of, at the level of a formula' } },
          { t: { ru: 'Как устроена аналитика событий: что такое событие, свойство и сессия', en: 'How event analytics works: what an event, a property and a session are' } },
        ],
        trap: {
          ru: 'Учить SQL по синтаксису на тренажёрах, не касаясь настоящих данных. Синтаксис занимает неделю, а месяцы уходят на понимание, что означают конкретные таблицы.',
          en: 'Learning SQL as syntax on trainer sites without touching real data. The syntax takes a week; the months go into understanding what specific tables mean.',
        },
      },
      {
        id: 'junior',
        title: { ru: 'Junior: считать надёжно', en: 'Junior: count reliably' },
        pace: { ru: 'ориентир: первые 6–12 месяцев работы', en: 'rough guide: the first 6–12 months on the job' },
        goal: { ru: 'Ваша цифра совпадает с цифрой коллеги, а расхождение вы объясняете за десять минут', en: 'Your number matches a colleague’s, and you can explain any gap in ten minutes' },
        // Из чего состоит день именно на этом грейде. Роль целиком описывает
        // «Из чего состоит неделя» в шапке, но junior и senior проводят день
        // по-разному, а человек выбирает не роль вообще, а первый год работы.
        // Доли — ориентир по типичным вакансиям, не норматив.
        dayMix: {
          ru: [
            'Около 70% времени занимают дашборды и графики по метрикам, которые определил кто-то до вас',
            'Около 25% приходится на SQL: выгрузки под вопросы команды',
            'Остальное это Python, и он нужен не в каждой команде',
          ],
          en: [
            'Around 70% of the time goes into dashboards and charts for metrics someone defined before you',
            'Around 25% goes into SQL: extracts for the team’s questions',
            'The rest is Python, and it is not needed on every team',
          ],
        },
        blocks: [
          {
            title: { ru: 'SQL на рабочем уровне', en: 'SQL at working level' },
            items: [
              { t: { ru: 'Оконные функции в реальных задачах: ранги, сдвиги, накопительные суммы', en: 'Window functions on real tasks: ranks, offsets, running totals' } },
              { t: { ru: 'Сборка выгрузки из нескольких источников с разной гранулярностью', en: 'Assembling an extract from several sources with different granularity' } },
              { t: { ru: 'Самопроверка выгрузки: дубли, полнота, сверка с независимым источником', en: 'Self-checking an extract: duplicates, completeness, reconciliation against another source' } },
            ],
          },
          {
            title: { ru: 'Библиотеки анализа', en: 'Analysis libraries' },
            items: [
              { t: { ru: 'pandas на рабочих объёмах: профилирование, чистка, преобразование', en: 'pandas at working volumes: profiling, cleaning, reshaping' } },
              { t: { ru: 'SciPy и NumPy для расчётов и распределений', en: 'SciPy and NumPy for computation and distributions' } },
              { t: { ru: 'Seaborn и Matplotlib для разведочного анализа', en: 'Seaborn and Matplotlib for exploratory analysis' } },
            ],
          },
          {
            title: { ru: 'Теория вероятностей', en: 'Probability theory' },
            items: [
              { t: { ru: 'Случайная величина, математическое ожидание, дисперсия', en: 'Random variables, expectation, variance' } },
              { t: { ru: 'Дискретные распределения: Бернулли, биномиальное, Пуассон', en: 'Discrete distributions: Bernoulli, binomial, Poisson' } },
              { t: { ru: 'Непрерывные распределения: нормальное, экспоненциальное, степенное', en: 'Continuous distributions: normal, exponential, power law' } },
              { t: { ru: 'Условная вероятность и формула Байеса', en: 'Conditional probability and Bayes’ rule' } },
            ],
          },
          {
            title: { ru: 'Статистика: выборки и оценки', en: 'Statistics: samples and estimates' },
            items: [
              { t: { ru: 'Выборочное распределение и стандартная ошибка', en: 'The sampling distribution and standard error' } },
              { t: { ru: 'Центральная предельная теорема', en: 'The central limit theorem' } },
              { t: { ru: 'Доверительные интервалы', en: 'Confidence intervals' } },
              { t: { ru: 'Бутстреп и ресэмплинг', en: 'Bootstrap and resampling' } },
            ],
          },
          {
            title: { ru: 'BI и визуализация', en: 'BI and visualisation' },
            items: [
              { t: { ru: 'Один инструмент вглубь: Tableau, Power BI, Metabase, Superset или DataLens', en: 'One tool in depth: Tableau, Power BI, Metabase, Superset or DataLens' } },
              { t: { ru: 'Модель данных внутри BI: связи, меры, вычисляемые поля', en: 'The data model inside BI: relations, measures, calculated fields' } },
              { t: { ru: 'Дашборд под решение: состав, фильтры, значения по умолчанию', en: 'A dashboard for a decision: what goes on it, filters, defaults' } },
              { t: { ru: 'Обновление, права доступа и надёжность отчёта', en: 'Refresh, access rights and the reliability of a report' } },
            ],
          },
          {
            title: { ru: 'Метрики и продуктовое мышление', en: 'Metrics and product thinking' },
            items: [
              { t: { ru: 'Определения метрик и корректный знаменатель', en: 'Metric definitions and the correct denominator' } },
              { t: { ru: 'Дерево метрик: главная, драйверы, контр-метрики', en: 'The metric tree: headline, drivers, guardrails' } },
              { t: { ru: 'Воронки и конверсии', en: 'Funnels and conversion' } },
              { t: { ru: 'Когорты и удержание', en: 'Cohorts and retention' } },
              { t: { ru: 'Юнит-экономика: CAC, LTV, ARPU, окупаемость', en: 'Unit economics: CAC, LTV, ARPU, payback' } },
              { t: { ru: 'Домен: как устроен бизнес, который вы считаете', en: 'The domain: how the business you count actually works' } },
            ],
          },
        ],
        check: {
          ru: 'Метрика, которую вы посчитали, сошлась с расчётом коллеги из другой команды. А когда не сошлась, вы нашли причину сами и раньше, чем её заметили другие.',
          en: 'A metric you computed matched a colleague’s number from another team. And when it did not match, you found the reason yourself, before anyone else noticed.',
        },
        trap: {
          ru: 'Отвечать на вопрос буквально. За вопросом «сколько пользователей в марте» почти всегда стоит решение, и если о нём не спросить, ответ придётся переделывать.',
          en: 'Answering literally. Behind "how many users did we have in March" there is almost always a decision, and if you do not ask about it, the answer gets redone.',
        },
      },
      {
        id: 'middle',
        title: { ru: 'Middle: выводы, которым доверяют', en: 'Middle: conclusions people trust' },
        pace: { ru: 'ориентир: 1–3 года', en: 'rough guide: 1–3 years' },
        goal: { ru: 'Отличать «выросло» от «выросло не случайно» и доводить эксперимент до решения', en: 'Telling "it grew" from "it did not grow by chance", and taking an experiment through to a decision' },
        dayMix: {
          ru: [
            'Почти весь день занимают задачи, ответ на которые нужен сегодня',
            'Дашборд собирается целиком: витрина, метрики, автообновление, документация',
            'Дизайн тестов: гипотеза, метрики и размер выборки до запуска',
            'Разбор аномалий и чужих тестов, где чаще всего и находится подглядывание',
          ],
          en: [
            'Most of the day goes into questions that need an answer today',
            'A dashboard built end to end: the mart, the metrics, the refresh, the documentation',
            'Test design: the hypothesis, the metrics and the sample size before the launch',
            'Investigating anomalies and other people’s tests, where the peeking usually turns up',
          ],
        },
        blocks: [
          {
            title: { ru: 'Статистический вывод', en: 'Statistical inference' },
            items: [
              { t: { ru: 'Проверка гипотез, ошибки первого и второго рода', en: 'Hypothesis testing, type I and type II errors' } },
              { t: { ru: 'Выбор критерия: t-тест, тесты долей, Манна–Уитни, хи-квадрат', en: 'Choosing a test: t-test, proportion tests, Mann–Whitney, chi-square' } },
              { t: { ru: 'Мощность, размер эффекта и расчёт выборки', en: 'Power, effect size and sample size calculation' } },
              { t: { ru: 'Множественные сравнения и поправки', en: 'Multiple comparisons and corrections' } },
              { t: { ru: 'Дисперсионный анализ для сравнения нескольких групп', en: 'Analysis of variance for comparing several groups' } },
            ],
          },
          {
            title: { ru: 'A/B-тесты: классика', en: 'A/B testing: the classics' },
            items: [
              { t: { ru: 'Дизайн теста: гипотеза, метрики, единица рандомизации', en: 'Test design: hypothesis, metrics, unit of randomisation' } },
              { t: { ru: 'Расчёт длительности и остановка по плану', en: 'Computing duration and stopping to plan' } },
              { t: { ru: 'A/A-тест и валидация системы сплитования', en: 'A/A tests and validating the splitting system' } },
              { t: { ru: 'Чтение результата и решение по нему', en: 'Reading the result and the decision that follows' } },
              { t: { ru: 'Типовые поломки: подглядывание, перекос групп, эффект новизны', en: 'Typical breakages: peeking, group imbalance, novelty effects' } },
            ],
          },
          {
            title: { ru: 'Регрессия и связи', en: 'Regression and relationships' },
            items: [
              { t: { ru: 'Корреляции и их пределы', en: 'Correlation and its limits' } },
              { t: { ru: 'Линейная и множественная регрессия', en: 'Linear and multiple regression' } },
              { t: { ru: 'Логистическая регрессия', en: 'Logistic regression' } },
              { t: { ru: 'Диагностика модели и анализ остатков', en: 'Model diagnostics and residual analysis' } },
              { t: { ru: 'Конфаундеры, коллайдеры и контроль переменных', en: 'Confounders, colliders and controlling for variables' } },
            ],
          },
          {
            title: { ru: 'Экономика продукта', en: 'Product economics' },
            items: [
              { t: { ru: 'Юнит-экономика на уровне отчёта о прибылях и убытках', en: 'Unit economics at the level of a profit and loss statement' } },
              { t: { ru: 'Модели LTV и прогноз выручки когорты', en: 'LTV models and forecasting cohort revenue' } },
              { t: { ru: 'Сегментация пользователей и клиентов', en: 'Segmenting users and customers' } },
              { t: { ru: 'Планирование и бюджетирование по метрикам', en: 'Planning and budgeting against metrics' } },
            ],
          },
          {
            title: { ru: 'Аналитическая инженерия', en: 'Analytics engineering' },
            items: [
              { t: { ru: 'Оптимизация запросов и чтение плана выполнения', en: 'Query optimisation and reading an execution plan' } },
              { t: { ru: 'Слои хранилища и своя витрина', en: 'Warehouse layers and building your own mart' } },
              { t: { ru: 'dbt: трансформации как код, тесты, документация', en: 'dbt: transformations as code, tests, documentation' } },
              { t: { ru: 'Оркестрация регулярных расчётов', en: 'Orchestrating recurring computations' } },
              { t: { ru: 'Качество данных: тесты, свежесть, разбор расхождений', en: 'Data quality: tests, freshness, chasing down discrepancies' } },
            ],
          },
          {
            title: { ru: 'Интерпретация и типовые ловушки', en: 'Interpretation and typical traps' },
            items: [
              { t: { ru: 'Парадокс Симпсона и агрегирование', en: 'Simpson’s paradox and aggregation' } },
              { t: { ru: 'Смещение отбора и ошибка выжившего', en: 'Selection bias and survivorship bias' } },
              { t: { ru: 'Регрессия к среднему', en: 'Regression to the mean' } },
              { t: { ru: 'Закон Гудхарта и метрики как цели', en: 'Goodhart’s law and metrics as targets' } },
            ],
          },
        ],
        check: {
          ru: 'Вы провели тест, где ключевая метрика выросла, а guardrail просел, и команда не стала раскатывать фичу, потому что вы вовремя показали цену.',
          en: 'You ran a test where the primary metric rose and a guardrail dropped, and the team did not ship, because you showed the price in time.',
        },
        trap: {
          ru: 'Считать p < 0,05 пропуском в продакшн. Значимость говорит только, что эффект вряд ли нулевой, и ничего не говорит о его размере. Решение принимают по размеру.',
          en: 'Treating p < 0.05 as a shipping permit. Significance only says the effect is probably not zero and says nothing about its size. Decisions are made on size.',
        },
      },
      {
        id: 'senior',
        title: { ru: 'Senior: влияние на решения', en: 'Senior: influence on decisions' },
        pace: { ru: 'ориентир: 3+ года', en: 'rough guide: 3+ years' },
        goal: { ru: 'Отвечать на вопросы, где эксперимент невозможен, и участвовать в приоритетах до принятия решения', en: 'Answering questions where an experiment is impossible, and taking part in priorities before decisions are made' },
        dayMix: {
          ru: [
            'Около 60% времени уходит на задачу целиком, от источника данных до дашборда и решения',
            'Около 20% занимают постановка задач команде, ревью чужих расчётов и менторство',
            'Ещё около 20% это разговоры с заказчиками о том, что им нужно на самом деле',
          ],
          en: [
            'Around 60% of the time goes into the whole task, from the source data to the dashboard and the decision',
            'Around 20% goes into assigning work, reviewing other people’s numbers and mentoring',
            'Another 20% is talking to stakeholders about what they actually need',
          ],
        },
        blocks: [
          {
            title: { ru: 'A/B-тесты: продвинутые', en: 'A/B testing: advanced' },
            items: [
              { t: { ru: 'Снижение дисперсии: CUPED, стратификация, ковариаты', en: 'Variance reduction: CUPED, stratification, covariates' } },
              { t: { ru: 'Последовательные тесты и правила ранней остановки', en: 'Sequential testing and early stopping rules' } },
              { t: { ru: 'Байесовский подход к экспериментам', en: 'The Bayesian approach to experiments' } },
              { t: { ru: 'Кластерные и switchback-эксперименты', en: 'Cluster and switchback experiments' } },
              { t: { ru: 'Сетевые эффекты и интерференция между группами', en: 'Network effects and interference between groups' } },
              { t: { ru: 'Гетерогенные эффекты и оценка CATE', en: 'Heterogeneous effects and estimating CATE' } },
            ],
          },
          {
            title: { ru: 'Причинный вывод', en: 'Causal inference' },
            items: [
              { t: { ru: 'Разность разностей и допущение параллельных трендов', en: 'Difference-in-differences and the parallel trends assumption' } },
              { t: { ru: 'Синтетический контроль и географические тесты', en: 'Synthetic control and geo experiments' } },
              { t: { ru: 'Прерванный временной ряд', en: 'Interrupted time series' } },
              { t: { ru: 'Мэтчинг и propensity score', en: 'Matching and propensity scores' } },
              { t: { ru: 'Инструментальные переменные и разрывный дизайн', en: 'Instrumental variables and regression discontinuity' } },
            ],
          },
          {
            title: { ru: 'Прогнозирование и временные ряды', en: 'Forecasting and time series' },
            items: [
              { t: { ru: 'Тренд, сезонность, декомпозиция ряда', en: 'Trend, seasonality, decomposing a series' } },
              { t: { ru: 'Сглаживание и модели семейства ARIMA', en: 'Smoothing and the ARIMA family' } },
              { t: { ru: 'Бэктест и валидация по времени', en: 'Backtesting and time-based validation' } },
              { t: { ru: 'Прогноз как основа планирования компании', en: 'The forecast as the basis of company planning' } },
            ],
          },
          {
            title: { ru: 'Аналитическое мышление и влияние', en: 'Analytical thinking and influence' },
            items: [
              { t: { ru: 'Постановка задачи от решения, а не от данных', en: 'Framing a task from the decision rather than the data' } },
              { t: { ru: 'Приоритизация по ожидаемому эффекту', en: 'Prioritising by expected effect' } },
              { t: { ru: 'Стоимость ошибки и работа с неопределённостью', en: 'The cost of being wrong and handling uncertainty' } },
              { t: { ru: 'Коммуникация с руководством: вывод, риски, рекомендация', en: 'Communicating with leadership: conclusion, risks, recommendation' } },
            ],
          },
          {
            title: { ru: 'Методология и стандарты', en: 'Methodology and standards' },
            items: [
              { t: { ru: 'Единые определения метрик и словарь на несколько команд', en: 'Shared metric definitions and a dictionary across teams' } },
              { t: { ru: 'Ревью чужих расчётов и дизайнов экспериментов', en: 'Reviewing other people’s numbers and experiment designs' } },
              { t: { ru: 'Воспроизводимость и документирование анализа', en: 'Reproducibility and documenting an analysis' } },
              { t: { ru: 'Культура экспериментов и обучение команды', en: 'Experiment culture and training the team' } },
            ],
          },
        ],
        check: {
          ru: 'К вам приходят до того, как решение принято, а не после, чтобы подтвердить его цифрами.',
          en: 'People come to you before the decision is made, not afterwards to back it up with numbers.',
        },
        trap: {
          ru: 'Быть сервисом при команде. Аналитик, который только выполняет заявки, не добирается до вопросов, где его вклад был бы больше всего.',
          en: 'Being a service desk for the team. An analyst who only fills requests never reaches the questions where their contribution would be largest.',
        },
      },
    ],
  },

  {
    id: 'de',
    title: { ru: 'Инженерия данных', en: 'Data engineering' },
    tagline: {
      ru: 'Отвечает за то, чтобы данные приезжали вовремя, целиком и в понятном виде',
      en: 'Owns the fact that data arrives on time, in full and in a shape people can read',
    },
    aliases: {
      ru: ['Data Engineer', 'DE', 'дата-инженер', 'инженер данных', 'ETL', 'ELT', 'DWH', 'Analytics Engineer'],
      en: ['Data Engineer', 'DE', 'ETL', 'ELT', 'DWH', 'Analytics Engineer'],
    },
    entry: { ru: 'Вход через разработку или из аналитики', en: 'Entry via software engineering or from analytics' },
    who: {
      ru: 'Инженер данных отвечает за пайплайны: данные из источников попадают в хранилище, а оттуда в витрины, которыми пользуются все остальные. Эту работу замечают в основном тогда, когда что-то ломается, поэтому здесь ценят надёжность и предсказуемость больше, чем изобретательность. Ближе к middle к пайплайнам добавляется модель данных: как разложить таблицы, чтобы через год в них можно было разобраться.',
      en: 'A data engineer owns the pipelines: data goes from the sources into the warehouse, and from there into the marts everyone else uses. The work gets noticed mainly when something breaks, so reliability and predictability count for more than cleverness here. Closer to middle, data modelling joins the pipelines: how to lay out the tables so that they still make sense a year later.',
    },
    day: {
      ru: [
        'Пайплайны загрузки и трансформации',
        'Разбор упавшего DAG в семь утра',
        'Модель данных под новые витрины',
        'Тесты качества и мониторинг свежести',
      ],
      en: [
        'Ingestion and transformation pipelines',
        'Debugging a failed DAG at 7 a.m.',
        'Data modelling for new marts',
        'Quality tests and freshness monitoring',
      ],
    },
    tools: [
      { stage: { ru: 'Забрать', en: 'Ingest' }, items: ['SQL (глубоко)', 'Kafka', 'Spark'] },
      { stage: { ru: 'Преобразовать', en: 'Transform' }, items: ['Python', 'dbt', 'Airflow / Dagster'] },
      { stage: { ru: 'Довезти', en: 'Ship it' }, items: ['Docker, Git, CI'] },
    ],
    where: {
      often: {
        ru: 'Везде, где решения принимают на данных: финтех, IT, e-commerce, ритейл, телеком, MedTech, EdTech, digital-сервисы',
        en: 'Anywhere decisions run on data: fintech, IT, e-commerce, retail, telecom, medtech, edtech, digital services',
      },
      rare: {
        ru: 'Реже там, где данные помещаются в одну базу. Пайплайны в такой компании строит аналитик или разработчик между делом, и отдельной роли не появляется.',
        en: 'Rarer where the data fits in a single database. In such a company an analyst or a developer builds the pipelines on the side, and no separate role appears.',
      },
    },
    notForYou: {
      ru: [
        'Вас раздражают рутина и дежурство. Загрузка, упавшая ночью, разбирается ночью.',
        'Вам важно, чтобы работу было видно. Хорошую инженерию данных замечают редко, сломанную замечают всегда.',
        'Вам не хочется писать код по инженерным стандартам. Тесты, ревью и ветки здесь обязательны.',
      ],
      en: [
        'Routine and on-call duty irritate you. A load that fails at night gets fixed at night.',
        'You want your work to be visible. Good data engineering is rarely noticed; broken data engineering always is.',
        'You would rather not write code to engineering standards. Tests, reviews and branches are mandatory here.',
      ],
    },
    stages: [
      {
        id: 'foundation',
        title: { ru: 'Фундамент', en: 'Foundation' },
        pace: { ru: 'ориентир: 3–6 месяцев', en: 'rough guide: 3–6 months' },
        goal: { ru: 'Общая база плюс инженерная гигиена', en: 'The shared base plus engineering hygiene' },
        sharedFoundation: true,
        extra: [
          { t: { ru: 'Python как язык разработки, а не блокнота: функции, модули, тесты', en: 'Python as a development language rather than a notebook: functions, modules, tests' } },
          { t: { ru: 'Linux и командная строка на уровне «разобраться, почему упало»', en: 'Linux and the shell at the level of "figure out why it failed"' } },
          { t: { ru: 'Git всерьёз: ветки, ревью, конфликты', en: 'Git for real: branches, reviews, conflicts' } },
          { t: { ru: 'Как устроена база: индексы, план запроса, почему запрос медленный', en: 'How a database works: indexes, query plans, why a query is slow' } },
        ],
        trap: {
          ru: 'Учить список инструментов вместо принципов. Airflow меняется на Dagster за неделю, а идемпотентность и модель данных переносятся куда угодно.',
          en: 'Learning a tool list instead of principles. Airflow swaps for Dagster in a week; idempotency and data modelling transfer anywhere.',
        },
      },
      {
        id: 'junior',
        title: { ru: 'Junior: пайплайны', en: 'Junior: pipelines' },
        pace: { ru: 'ориентир: 6–12 месяцев', en: 'rough guide: 6–12 months' },
        goal: { ru: 'Данные приезжают каждый день сами, а когда не приезжают, вы узнаёте об этом первым', en: 'Data arrives every day on its own, and when it does not, you find out first' },
        dayMix: {
          ru: [
            'Пайплайны: новые загрузки и починка упавших',
            'Запросы к источникам и проверка, что данные приехали полностью',
            'Дежурство: разбор сбоев по алертам',
          ],
          en: [
            'Pipelines: new loads and fixing broken ones',
            'Queries to sources and checking the data arrived in full',
            'On-call: working through failures from alerts',
          ],
        },
        blocks: [
          {
            title: { ru: 'SQL и базы данных вглубь', en: 'SQL and databases in depth' },
            items: [
              { t: { ru: 'Оконные функции и сложные агрегации', en: 'Window functions and complex aggregations' } },
              { t: { ru: 'План выполнения запроса, индексы, статистика оптимизатора', en: 'Query plans, indexes, optimiser statistics' } },
              { t: { ru: 'Транзакции, изоляция, блокировки', en: 'Transactions, isolation, locks' } },
              { t: { ru: 'OLTP и OLAP: разные движки под разные нагрузки', en: 'OLTP and OLAP: different engines for different workloads' } },
              { t: { ru: 'Колоночные СУБД: ClickHouse, Vertica, облачные хранилища', en: 'Columnar databases: ClickHouse, Vertica, cloud warehouses' } },
            ],
          },
          {
            title: { ru: 'Python для инженерии', en: 'Python for engineering' },
            items: [
              { t: { ru: 'Модули, пакеты, зависимости, виртуальные окружения', en: 'Modules, packages, dependencies, virtual environments' } },
              { t: { ru: 'Тесты и типизация', en: 'Tests and typing' } },
              { t: { ru: 'Работа с API, файлами и потоками данных', en: 'Working with APIs, files and data streams' } },
              { t: { ru: 'Логирование и обработка ошибок', en: 'Logging and error handling' } },
            ],
          },
          {
            title: { ru: 'ETL и ELT', en: 'ETL and ELT' },
            items: [
              { t: { ru: 'Источники: базы, API, файлы, очереди', en: 'Sources: databases, APIs, files, queues' } },
              { t: { ru: 'Инкрементальная загрузка и захват изменений (CDC)', en: 'Incremental loads and change data capture' } },
              { t: { ru: 'Идемпотентность и безопасный перезапуск', en: 'Idempotency and safe reruns' } },
              { t: { ru: 'Бэкфилл и пересчёт истории', en: 'Backfilling and recomputing history' } },
            ],
          },
          {
            title: { ru: 'Оркестрация', en: 'Orchestration' },
            items: [
              { t: { ru: 'Airflow: DAG, расписание, сенсоры, зависимости', en: 'Airflow: DAGs, schedules, sensors, dependencies' } },
              { t: { ru: 'Ретраи, таймауты, алерты', en: 'Retries, timeouts, alerts' } },
              { t: { ru: 'Мониторинг и разбор упавших задач', en: 'Monitoring and debugging failed tasks' } },
              { t: { ru: 'Альтернативы: Dagster, Prefect и чем они отличаются', en: 'Alternatives: Dagster, Prefect and how they differ' } },
            ],
          },
          {
            title: { ru: 'Хранение и форматы', en: 'Storage and formats' },
            items: [
              { t: { ru: 'Parquet и колоночное хранение', en: 'Parquet and columnar storage' } },
              { t: { ru: 'Партиционирование и выбор ключа партиции', en: 'Partitioning and choosing a partition key' } },
              { t: { ru: 'Сжатие и стоимость хранения', en: 'Compression and storage cost' } },
              { t: { ru: 'Объектные хранилища S3-совместимого типа', en: 'S3-compatible object storage' } },
              { t: { ru: 'Эволюция схемы данных', en: 'Schema evolution' } },
            ],
          },
          {
            title: { ru: 'Инженерная среда', en: 'The engineering environment' },
            items: [
              { t: { ru: 'Linux и командная строка', en: 'Linux and the shell' } },
              { t: { ru: 'Git-процесс: ветки, ревью, конфликты', en: 'The Git process: branches, reviews, conflicts' } },
              { t: { ru: 'Docker и запуск сервисов в контейнерах', en: 'Docker and running services in containers' } },
              { t: { ru: 'CI и автоматический прогон тестов', en: 'CI and running tests automatically' } },
            ],
          },
        ],
        check: {
          ru: 'Ваш пайплайн отработал месяц без ручного вмешательства, а о сбое вы узнали из алерта, а не из сообщения аналитика.',
          en: 'Your pipeline ran for a month without manual intervention, and you heard about a failure from an alert rather than from an analyst’s message.',
        },
        trap: {
          ru: 'Пайплайн, который нельзя перезапустить. Первый же сбой превращает его в ручную работу и задвоенные данные.',
          en: 'A pipeline you cannot rerun. The first failure turns it into manual labour and duplicated rows.',
        },
      },
      {
        id: 'middle',
        title: { ru: 'Middle: модель данных и качество', en: 'Middle: data modelling and quality' },
        pace: { ru: 'ориентир: 1–3 года', en: 'rough guide: 1–3 years' },
        goal: { ru: 'Витриной пользуются, не спрашивая, что означает вот эта колонка', en: 'People use your mart without asking what a particular column means' },
        dayMix: {
          ru: [
            'Модель данных: слои, витрины, трансформации как код',
            'Качество: тесты, свежесть, контракты с источниками',
            'Оптимизация: где запрос стоит слишком дорого и почему',
          ],
          en: [
            'Data modelling: layers, marts, transformations as code',
            'Quality: tests, freshness, contracts with sources',
            'Optimisation: where a query costs too much, and why',
          ],
        },
        blocks: [
          {
            title: { ru: 'Моделирование данных', en: 'Data modelling' },
            items: [
              { t: { ru: 'Слои хранилища: сырой, промежуточный, витрины', en: 'Warehouse layers: raw, staging, marts' } },
              { t: { ru: 'Звезда и снежинка, факты и измерения', en: 'Star and snowflake, facts and dimensions' } },
              { t: { ru: 'Медленно меняющиеся измерения и историчность', en: 'Slowly changing dimensions and keeping history' } },
              { t: { ru: 'Суррогатные ключи и дедупликация', en: 'Surrogate keys and deduplication' } },
              { t: { ru: 'Data Vault и когда он оправдан', en: 'Data Vault and when it is justified' } },
            ],
          },
          {
            title: { ru: 'Трансформации как код', en: 'Transformations as code' },
            items: [
              { t: { ru: 'dbt: модели, зависимости, тесты, документация', en: 'dbt: models, dependencies, tests, documentation' } },
              { t: { ru: 'Инкрементальные модели и стратегии материализации', en: 'Incremental models and materialisation strategies' } },
              { t: { ru: 'Макросы и переиспользование логики', en: 'Macros and reusing logic' } },
              { t: { ru: 'Окружения, код-ревью и CI для данных', en: 'Environments, code review and CI for data' } },
            ],
          },
          {
            title: { ru: 'Качество данных', en: 'Data quality' },
            items: [
              { t: { ru: 'Тесты целостности, уникальности и диапазонов', en: 'Integrity, uniqueness and range tests' } },
              { t: { ru: 'Свежесть, полнота и SLA на обновление', en: 'Freshness, completeness and refresh SLAs' } },
              { t: { ru: 'Контракты данных с источниками', en: 'Data contracts with sources' } },
              { t: { ru: 'Мониторинг аномалий и распределений', en: 'Monitoring anomalies and distributions' } },
              { t: { ru: 'Инструменты: dbt tests, Great Expectations, Soda', en: 'Tools: dbt tests, Great Expectations, Soda' } },
            ],
          },
          {
            title: { ru: 'Хранилища и производительность', en: 'Warehouses and performance' },
            items: [
              { t: { ru: 'Облачные хранилища: Snowflake, BigQuery, Redshift', en: 'Cloud warehouses: Snowflake, BigQuery, Redshift' } },
              { t: { ru: 'Партиции, кластеризация, материализованные представления', en: 'Partitions, clustering, materialised views' } },
              { t: { ru: 'Профилирование и оптимизация тяжёлых расчётов', en: 'Profiling and optimising heavy computations' } },
              { t: { ru: 'Стоимость вычислений и управление ей', en: 'Compute cost and keeping it under control' } },
            ],
          },
          {
            title: { ru: 'Облако', en: 'The cloud' },
            items: [
              { t: { ru: 'Один провайдер вглубь: хранилище, вычисления, сеть, права', en: 'One provider in depth: storage, compute, networking, permissions' } },
              { t: { ru: 'Инфраструктура как код на базовом уровне', en: 'Infrastructure as code at a basic level' } },
              { t: { ru: 'Управляемые сервисы против своих: что выбирать и почему', en: 'Managed services versus self-hosted: what to pick and why' } },
            ],
          },
          {
            title: { ru: 'Доступы и приватность', en: 'Access and privacy' },
            items: [
              { t: { ru: 'Ролевая модель доступа к таблицам и колонкам', en: 'Role-based access to tables and columns' } },
              { t: { ru: 'Персональные данные: маскирование, сроки хранения, удаление', en: 'Personal data: masking, retention, deletion' } },
              { t: { ru: 'Аудит обращений к данным', en: 'Auditing access to data' } },
            ],
          },
        ],
        check: {
          ru: 'Новый аналитик находит нужную таблицу и разбирается в ней без вас, по документации и названиям полей.',
          en: 'A new analyst finds the right table and figures it out without you, from the docs and the column names.',
        },
        trap: {
          ru: 'Витрина под конкретный дашборд. Через год их сорок, все немного разные, и ни одна не является источником правды.',
          en: 'A mart built for one dashboard. A year later there are forty, all slightly different, and none is the source of truth.',
        },
      },
      {
        id: 'senior',
        title: { ru: 'Senior: платформа', en: 'Senior: the platform' },
        pace: { ru: 'ориентир: 3+ года', en: 'rough guide: 3+ years' },
        goal: { ru: 'Строить систему, в которой пайплайны делают другие команды', en: 'Building the system in which other teams make the pipelines' },
        dayMix: {
          ru: [
            'Архитектура платформы и стандарты, по которым строят другие',
            'SLA на данные, доступы, персональные данные, бюджет хранилища',
            'Архитектурные вопросы вместо потока заявок',
          ],
          en: [
            'Platform architecture and the standards others build by',
            'Data SLAs, access control, personal data, warehouse budget',
            'Architecture questions instead of a queue of tickets',
          ],
        },
        blocks: [
          {
            title: { ru: 'Потоки и большие объёмы', en: 'Streams and large volumes' },
            items: [
              { t: { ru: 'Kafka: топики, партиции, гарантии доставки', en: 'Kafka: topics, partitions, delivery guarantees' } },
              { t: { ru: 'Spark и PySpark, перекос данных и настройка кластера', en: 'Spark and PySpark, data skew and cluster tuning' } },
              { t: { ru: 'Потоковая обработка: Flink, Spark Structured Streaming', en: 'Stream processing: Flink, Spark Structured Streaming' } },
              { t: { ru: 'Реальное время: когда оно нужно и сколько стоит', en: 'Real time: when it is needed and what it costs' } },
            ],
          },
          {
            title: { ru: 'Архитектура платформы', en: 'Platform architecture' },
            items: [
              { t: { ru: 'Выбор хранилища и его пределы под нагрузку компании', en: 'Choosing a warehouse and its limits under the company’s load' } },
              { t: { ru: 'Lakehouse: Iceberg, Delta Lake, Hudi', en: 'Lakehouse: Iceberg, Delta Lake, Hudi' } },
              { t: { ru: 'Владение данными между командами и data mesh', en: 'Data ownership across teams and data mesh' } },
              { t: { ru: 'Миграции хранилища без остановки отчётности', en: 'Warehouse migrations without stopping reporting' } },
            ],
          },
          {
            title: { ru: 'Надёжность и эксплуатация', en: 'Reliability and operations' },
            items: [
              { t: { ru: 'SLA и SLO на данные', en: 'Data SLAs and SLOs' } },
              { t: { ru: 'Отказоустойчивость и восстановление', en: 'Fault tolerance and recovery' } },
              { t: { ru: 'Планирование мощности и запас на рост', en: 'Capacity planning and headroom for growth' } },
              { t: { ru: 'Наблюдаемость платформы и постмортемы', en: 'Platform observability and postmortems' } },
            ],
          },
          {
            title: { ru: 'Стандарты и каталог данных', en: 'Standards and the data catalogue' },
            items: [
              { t: { ru: 'Шаблоны пайплайнов и витрин для других команд', en: 'Pipeline and mart templates for other teams' } },
              { t: { ru: 'Ревью моделей данных и архитектурных решений', en: 'Reviewing data models and architecture decisions' } },
              { t: { ru: 'Каталог данных и происхождение данных', en: 'A data catalogue and data lineage' } },
              { t: { ru: 'Обучение аналитиков работать с платформой самостоятельно', en: 'Teaching analysts to work with the platform on their own' } },
            ],
          },
          {
            title: { ru: 'Экономика платформы', en: 'Platform economics' },
            items: [
              { t: { ru: 'Бюджет хранилища и оптимизация расходов', en: 'The warehouse budget and optimising spend' } },
              { t: { ru: 'Своё решение против покупного', en: 'Build versus buy' } },
              { t: { ru: 'Регуляторные требования к данным', en: 'Regulatory requirements for data' } },
            ],
          },
        ],
        check: {
          ru: 'Аналитики строят витрины сами по вашим шаблонам и правилам, а вы разбираете архитектурные вопросы, а не заявки.',
          en: 'Analysts build marts themselves using your templates and rules, and you handle architecture questions rather than tickets.',
        },
        trap: {
          ru: 'Строить платформу под масштаб, которого нет. Kafka в компании с миллионом строк в день ничего не ускоряет и только добавляет стоимость поддержки.',
          en: 'Building a platform for scale you do not have. Kafka in a company with a million rows a day speeds nothing up and only adds maintenance cost.',
        },
      },
    ],
  },

  {
    id: 'ds',
    title: { ru: 'Data Scientist / ML', en: 'Data Scientist / ML' },
    tagline: {
      ru: 'Строит модели, которые предсказывают, и отвечает за их качество после запуска',
      en: 'Builds models that predict, and owns their quality after launch',
    },
    aliases: {
      ru: ['Data Scientist', 'DS', 'дата-сайентист', 'ML-инженер', 'машинное обучение'],
      en: ['Data Scientist', 'DS', 'ML engineer', 'machine learning'],
    },
    entry: { ru: 'Самый длинный вход: нужна математика', en: 'The longest entry: maths required' },
    who: {
      ru: 'Data Scientist берёт задачи, где ответ не получить запросом к базе: предсказать спрос на следующий месяц, оценить риск невозврата кредита, разбить пользователей на группы по поведению. Большая часть времени уходит на подготовку данных и на проверку того, что модель действительно предсказывает, а не подгоняет ответ. На выбор архитектуры остаётся заметно меньше. После запуска работа не заканчивается: данные со временем меняются, качество падает, и модель приходится переобучать.',
      en: 'A data scientist takes on problems where a database query cannot give the answer: forecasting next month’s demand, scoring the risk of a default, grouping users by behaviour. Most of the time goes into preparing the data and into checking that the model really predicts rather than fits the answer. Much less is left for picking an architecture. The work does not end at launch: the data shifts over time, quality drops, and the model has to be retrained.',
    },
    day: {
      ru: [
        'Подготовка и разметка данных',
        'Признаки, обучение и валидация моделей',
        'Разбор, почему качество упало',
        'Запуск модели в продакшн и мониторинг',
      ],
      en: [
        'Preparing and labelling data',
        'Features, training and validation',
        'Investigating why quality dropped',
        'Shipping the model to production and monitoring it',
      ],
    },
    tools: [
      { stage: { ru: 'Достать', en: 'Get it' }, items: ['SQL', 'pandas / numpy'] },
      { stage: { ru: 'Обучить', en: 'Train it' }, items: ['Python', 'scikit-learn, CatBoost / LightGBM', 'PyTorch'] },
      { stage: { ru: 'Довезти', en: 'Ship it' }, items: ['MLflow', 'Docker, Git'] },
    ],
    where: {
      often: {
        ru: 'Крупные маркетплейсы и банки, стриминги и рекомендательные сервисы, MedTech, промышленность (предсказание отказов), биоинформатика',
        en: 'Large marketplaces and banks, streaming and recommender services, medtech, manufacturing (failure prediction), bioinformatics',
      },
      rare: {
        ru: 'Реже там, где выигрыш модели не покрывает её стоимость. Плюс десять процентов выручки у крупного маркетплейса окупают и разработку, и поддержку, а те же десять процентов у небольшого бизнеса не окупают ничего.',
        en: 'Rarer where the model’s gain does not cover its cost. Ten percent more revenue at a large marketplace pays for both the build and the upkeep, while the same ten percent at a smaller business pays for nothing.',
      },
    },
    notForYou: {
      ru: [
        'Вам нужен видимый результат каждую неделю. Здесь месяц может уйти на данные и валидацию, и ни одна модель за это время не заработает.',
        'Математика вызывает у вас сопротивление. Без вероятности и линейной алгебры дальше первых моделей продвинуться не получится.',
        'Вам хочется строить модели и не отвечать за то, что с ними будет через полгода.',
      ],
      en: [
        'You need visible progress every week. Here a month can go into data and validation without a single working model.',
        'Maths provokes resistance in you. Without probability and linear algebra you stall right after the first models.',
        'You want to build models without owning what happens to them six months later.',
      ],
    },
    stages: [
      {
        id: 'foundation',
        title: { ru: 'Фундамент', en: 'Foundation' },
        pace: { ru: 'ориентир: 4–8 месяцев', en: 'rough guide: 4–8 months' },
        goal: { ru: 'Общая база плюс вероятность и линейная алгебра', en: 'The shared base plus probability and linear algebra' },
        sharedFoundation: true,
        extra: [
          { t: { ru: 'Основы вероятности: события, И, ИЛИ, независимость', en: 'Probability basics: events, AND, OR, independence' } },
          { t: { ru: 'Случайная величина, ожидание и дисперсия', en: 'Random variables, expectation and variance' } },
          { t: { ru: 'Дискретные распределения: Бернулли, биномиальное, Пуассон', en: 'Discrete distributions: Bernoulli, binomial, Poisson' } },
          { t: { ru: 'Непрерывные распределения и нормальное', en: 'Continuous distributions and the normal' } },
          { t: { ru: 'Условная вероятность и формула Байеса', en: 'Conditional probability and Bayes’ rule' } },
          { t: { ru: 'Линейная алгебра (векторы, матрицы) и производные на уровне понимания, что делает градиентный спуск', en: 'Linear algebra (vectors, matrices) and derivatives, enough to understand what gradient descent does' } },
        ],
        trap: {
          ru: 'Начинать с нейросетей. Без вероятности и валидации нейросеть выдаёт числа, качество которых вы не сможете ни подтвердить, ни объяснить.',
          en: 'Starting with neural networks. Without probability and validation a network produces numbers whose quality you can neither confirm nor explain.',
        },
      },
      {
        id: 'junior',
        title: { ru: 'Junior: классическое ML', en: 'Junior: classical ML' },
        pace: { ru: 'ориентир: 6–12 месяцев', en: 'rough guide: 6–12 months' },
        goal: { ru: 'Обучить модель и честно измерить, насколько она хороша', en: 'Training a model and honestly measuring how good it is' },
        dayMix: {
          ru: [
            'Больше половины дня занимают данные: сбор, разметка, признаки',
            'Обучение и валидация моделей на уже поставленной задаче',
            'Разбор, почему на отложенной выборке качество ниже, чем на валидации',
          ],
          en: [
            'More than half the day goes into data: collection, labelling, features',
            'Training and validating models on a task someone else framed',
            'Working out why hold-out quality differs from validation',
          ],
        },
        blocks: [
          {
            title: { ru: 'Математика', en: 'Mathematics' },
            items: [
              { t: { ru: 'Линейная алгебра: векторы, матрицы, разложения', en: 'Linear algebra: vectors, matrices, decompositions' } },
              { t: { ru: 'Производные, градиент, основы оптимизации', en: 'Derivatives, gradients, the basics of optimisation' } },
              { t: { ru: 'Теория вероятностей и распределения', en: 'Probability theory and distributions' } },
              { t: { ru: 'Условная вероятность и байесовский подход', en: 'Conditional probability and the Bayesian approach' } },
            ],
          },
          {
            title: { ru: 'Статистика', en: 'Statistics' },
            items: [
              { t: { ru: 'Оценки, стандартная ошибка, доверительные интервалы', en: 'Estimates, standard error, confidence intervals' } },
              { t: { ru: 'Проверка гипотез и ошибки двух родов', en: 'Hypothesis testing and the two kinds of error' } },
              { t: { ru: 'Бутстреп и ресэмплинг', en: 'Bootstrap and resampling' } },
              { t: { ru: 'Регрессионный анализ и его допущения', en: 'Regression analysis and its assumptions' } },
            ],
          },
          {
            title: { ru: 'Классическое машинное обучение', en: 'Classical machine learning' },
            items: [
              { t: { ru: 'Линейная и логистическая регрессия', en: 'Linear and logistic regression' } },
              { t: { ru: 'Деревья решений, случайный лес, градиентный бустинг', en: 'Decision trees, random forest, gradient boosting' } },
              { t: { ru: 'Метод ближайших соседей и наивный Байес', en: 'k-nearest neighbours and naive Bayes' } },
              { t: { ru: 'Кластеризация и снижение размерности', en: 'Clustering and dimensionality reduction' } },
              { t: { ru: 'Регуляризация и подбор гиперпараметров', en: 'Regularisation and hyperparameter tuning' } },
            ],
          },
          {
            title: { ru: 'Оценка качества моделей', en: 'Model evaluation' },
            items: [
              { t: { ru: 'Разбиение выборки и кросс-валидация', en: 'Splitting the data and cross-validation' } },
              { t: { ru: 'Переобучение, недообучение, кривые обучения', en: 'Overfitting, underfitting, learning curves' } },
              { t: { ru: 'Метрики классификации: precision, recall, ROC-AUC, PR-AUC', en: 'Classification metrics: precision, recall, ROC-AUC, PR-AUC' } },
              { t: { ru: 'Метрики регрессии и их бизнес-смысл', en: 'Regression metrics and what they mean to the business' } },
              { t: { ru: 'Калибровка вероятностей', en: 'Probability calibration' } },
            ],
          },
          {
            title: { ru: 'Работа с данными и признаками', en: 'Data and feature work' },
            items: [
              { t: { ru: 'Разведочный анализ и профилирование данных', en: 'Exploratory analysis and data profiling' } },
              { t: { ru: 'Генерация признаков из событий и агрегатов', en: 'Building features from events and aggregates' } },
              { t: { ru: 'Кодирование категорий, шкалирование, пропуски', en: 'Encoding categories, scaling, missing values' } },
              { t: { ru: 'Дисбаланс классов и утечка данных', en: 'Class imbalance and data leakage' } },
              { t: { ru: 'Разметка данных и контроль её качества', en: 'Data labelling and controlling its quality' } },
            ],
          },
          {
            title: { ru: 'Инструменты', en: 'Tools' },
            items: [
              { t: { ru: 'SQL и pandas для подготовки выборок', en: 'SQL and pandas for preparing datasets' } },
              { t: { ru: 'NumPy, SciPy, scikit-learn', en: 'NumPy, SciPy, scikit-learn' } },
              { t: { ru: 'CatBoost, LightGBM, XGBoost', en: 'CatBoost, LightGBM, XGBoost' } },
              { t: { ru: 'Git и учёт экспериментов', en: 'Git and experiment tracking' } },
            ],
          },
        ],
        check: {
          ru: 'Ваша модель на отложенной выборке показывает то же качество, что и на валидации, и вы можете объяснить, за счёт каких признаков она работает.',
          en: 'Your model scores the same on a hold-out set as in validation, and you can explain which features make it work.',
        },
        trap: {
          ru: 'Гнаться за третьим знаком после запятой в метрике. Разница между 0,91 и 0,92 почти никогда не меняет решение, а неверно выбранная целевая переменная меняет всё.',
          en: 'Chasing the third decimal of a score. The gap between 0.91 and 0.92 almost never changes a decision, while a wrongly chosen target variable changes everything.',
        },
      },
      {
        id: 'middle',
        title: { ru: 'Middle: модель в продакшене', en: 'Middle: the model in production' },
        pace: { ru: 'ориентир: 1–3 года', en: 'rough guide: 1–3 years' },
        goal: { ru: 'Довести модель до реального решения и удержать её качество во времени', en: 'Getting a model to a real decision and holding its quality over time' },
        dayMix: {
          ru: [
            'Постановка задачи вместе с бизнесом: что именно предсказываем и зачем',
            'Запуск модели и мониторинг: дрейф, деградация, откат',
            'A/B модели против текущего решения, потому что офлайн-метрика бизнес-эффекта не показывает',
          ],
          en: [
            'Framing the task with the business: what exactly we predict and why',
            'Shipping the model and monitoring it: drift, decay, rollback',
            'An A/B of the model against the current solution, because an offline score does not show business impact',
          ],
        },
        blocks: [
          {
            title: { ru: 'Глубокое обучение', en: 'Deep learning' },
            items: [
              { t: { ru: 'Нейронные сети и обратное распространение ошибки', en: 'Neural networks and backpropagation' } },
              { t: { ru: 'PyTorch как основной фреймворк', en: 'PyTorch as the main framework' } },
              { t: { ru: 'Свёрточные и рекуррентные архитектуры', en: 'Convolutional and recurrent architectures' } },
              { t: { ru: 'Трансформеры и предобученные модели', en: 'Transformers and pretrained models' } },
              { t: { ru: 'Дообучение готовой модели вместо обучения с нуля', en: 'Fine-tuning an existing model instead of training from scratch' } },
            ],
          },
          {
            title: { ru: 'Временные ряды', en: 'Time series' },
            items: [
              { t: { ru: 'Декомпозиция: тренд, сезонность, остаток', en: 'Decomposition: trend, seasonality, residual' } },
              { t: { ru: 'Стационарность и автокорреляция', en: 'Stationarity and autocorrelation' } },
              { t: { ru: 'Сглаживание и модели семейства ARIMA', en: 'Smoothing and the ARIMA family' } },
              { t: { ru: 'Бустинг на календарных и лаговых признаках', en: 'Boosting on calendar and lag features' } },
              { t: { ru: 'Бэктест и валидация по времени', en: 'Backtesting and time-based validation' } },
            ],
          },
          {
            title: { ru: 'Продакшн и MLOps', en: 'Production and MLOps' },
            items: [
              { t: { ru: 'Сервинг модели: онлайн-инференс и батч', en: 'Serving a model: online inference and batch' } },
              { t: { ru: 'Docker, CI/CD и выкатка модели', en: 'Docker, CI/CD and shipping a model' } },
              { t: { ru: 'MLflow: эксперименты, версии, реестр моделей', en: 'MLflow: experiments, versions, the model registry' } },
              { t: { ru: 'Хранилище признаков и повторное использование фич', en: 'A feature store and reusing features' } },
              { t: { ru: 'Мониторинг качества и дрейфа, переобучение по расписанию', en: 'Quality and drift monitoring, scheduled retraining' } },
            ],
          },
          {
            title: { ru: 'Оценка эффекта в бою', en: 'Measuring the effect in production' },
            items: [
              { t: { ru: 'A/B-тест модели против текущего решения', en: 'An A/B test of the model against the current solution' } },
              { t: { ru: 'Расхождение офлайн-метрики и бизнес-эффекта', en: 'The gap between an offline metric and business impact' } },
              { t: { ru: 'Выбор порога и цена ошибки', en: 'Choosing a threshold and the cost of an error' } },
              { t: { ru: 'Модель, влияющая на собственные обучающие данные', en: 'A model that affects its own training data' } },
            ],
          },
          {
            title: { ru: 'Интерпретируемость', en: 'Interpretability' },
            items: [
              { t: { ru: 'Важность признаков и SHAP', en: 'Feature importance and SHAP' } },
              { t: { ru: 'Объяснение решения бизнесу и проверяющему', en: 'Explaining a decision to the business and to a reviewer' } },
              { t: { ru: 'Проверка модели на смещения', en: 'Checking a model for bias' } },
            ],
          },
          {
            title: { ru: 'Постановка ML-задачи', en: 'Framing an ML task' },
            items: [
              { t: { ru: 'Перевод бизнес-задачи в задачу обучения', en: 'Turning a business problem into a learning problem' } },
              { t: { ru: 'Выбор целевой переменной и горизонта', en: 'Choosing the target variable and the horizon' } },
              { t: { ru: 'Базовое решение и оценка потолка качества', en: 'A baseline and estimating the ceiling on quality' } },
              { t: { ru: 'Случаи, когда правило лучше модели', en: 'The cases where a rule beats a model' } },
            ],
          },
        ],
        check: {
          ru: 'Ваша модель работает в продакшене больше полугода, вы знаете, когда она деградирует, и у вас есть план, что делать в этот момент.',
          en: 'Your model has been in production for over six months, you know when it degrades, and you have a plan for that moment.',
        },
        trap: {
          ru: 'Валидация со случайным разбиением на данных, у которых есть время. Модель подсматривает будущее, метрика выглядит прекрасно, а в продакшене качество разваливается.',
          en: 'Random splits on data that has a time dimension. The model peeks into the future, the score looks great, and in production the quality falls apart.',
        },
      },
      {
        id: 'senior',
        title: { ru: 'Senior: специализация', en: 'Senior: specialisation' },
        pace: { ru: 'ориентир: 3+ года', en: 'rough guide: 3+ years' },
        goal: { ru: 'Глубина в одной области плюс умение сказать, что модель здесь не нужна', en: 'Depth in one area plus the ability to say that no model is needed here' },
        dayMix: {
          ru: [
            'Оценка задач до написания кода: где ML окупится, а где хватит простого правила',
            'Глубина в одной области: NLP и LLM, рекомендации, зрение или прогноз',
            'Разговор с теми, кто принимает решение: почему модель ответила именно так',
          ],
          en: [
            'Sizing up tasks before any code: where ML pays off and where a rule is enough',
            'Depth in one area: NLP and LLMs, recommenders, vision or forecasting',
            'Talking to decision-makers: why the model answered the way it did',
          ],
        },
        blocks: [
          {
            title: { ru: 'NLP и языковые модели', en: 'NLP and language models' },
            items: [
              { t: { ru: 'Эмбеддинги и векторный поиск', en: 'Embeddings and vector search' } },
              { t: { ru: 'Поиск по документам и RAG', en: 'Document retrieval and RAG' } },
              { t: { ru: 'Дообучение и адаптация готовых моделей', en: 'Fine-tuning and adapting existing models' } },
              { t: { ru: 'Оценка качества генерации и регрессии в ней', en: 'Evaluating generation quality and regressions in it' } },
            ],
          },
          {
            title: { ru: 'Другие специализации', en: 'Other specialisations' },
            items: [
              { t: { ru: 'Рекомендательные системы: холодный старт, ранжирование, онлайн-метрики', en: 'Recommenders: cold start, ranking, online metrics' } },
              { t: { ru: 'Компьютерное зрение: детекция, сегментация, разметка', en: 'Computer vision: detection, segmentation, labelling' } },
              { t: { ru: 'Прогнозирование спроса и планирование', en: 'Demand forecasting and planning' } },
              { t: { ru: 'Скоринг и антифрод: работа с редким классом', en: 'Scoring and fraud detection: working with a rare class' } },
            ],
          },
          {
            title: { ru: 'Инфраструктура обучения и инференса', en: 'Training and inference infrastructure' },
            items: [
              { t: { ru: 'Распределённое обучение и работа с GPU', en: 'Distributed training and working with GPUs' } },
              { t: { ru: 'Оптимизация инференса: квантизация, дистилляция, кэш', en: 'Inference optimisation: quantisation, distillation, caching' } },
              { t: { ru: 'Стоимость вычислений и её планирование', en: 'Compute cost and planning for it' } },
            ],
          },
          {
            title: { ru: 'Экономика и ответственность', en: 'Economics and accountability' },
            items: [
              { t: { ru: 'Полная стоимость модели: разработка, инференс, разметка, поддержка', en: 'The full cost of a model: development, inference, labelling, upkeep' } },
              { t: { ru: 'Оценка выигрыша в деньгах и случаи, когда ML не окупается', en: 'Sizing the gain in money and the cases where ML does not pay off' } },
              { t: { ru: 'Риски модели, смещения и регуляторные требования', en: 'Model risk, bias and regulatory requirements' } },
              { t: { ru: 'Правила отключения модели и резервное решение', en: 'Rules for switching a model off and the fallback' } },
            ],
          },
          {
            title: { ru: 'Процесс и люди', en: 'Process and people' },
            items: [
              { t: { ru: 'Ревью подходов и кода, стандарты проекта', en: 'Reviewing approaches and code, project standards' } },
              { t: { ru: 'Совместная работа с инженерами данных и разработчиками', en: 'Working alongside data engineers and developers' } },
              { t: { ru: 'Менторство, найм и объяснение результата бизнесу', en: 'Mentoring, hiring and explaining results to the business' } },
            ],
          },
        ],
        check: {
          ru: 'Вы отговорили команду от ML-решения там, где хватало эвристики, и сэкономили ей квартал.',
          en: 'You talked the team out of an ML solution where a heuristic was enough, and saved it a quarter.',
        },
        trap: {
          ru: 'Считать, что сложная модель говорит об уровне. Senior чаще упрощает: простое решение, которое работает в продакшене, полезнее сложного, которое туда не доехало.',
          en: 'Believing a complex model signals seniority. Seniors more often simplify: a simple solution that runs in production is worth more than a complex one that never got there.',
        },
      },
    ],
  },
]

// Роли внутри трека. Одна профессия на рынке разложена на несколько названий,
// и человек, выбравший трек, всё равно откликается на конкретную вакансию.
// Поэтому здесь каждая роль трека описана отдельно и сказано, чем она
// отличается от базовой роли и от соседних ролей того же трека.
//
// base: true — та роль, которую описывает шапка трека. Остальные выросли из
// неё сужением предмета, и в компании поменьше все они снова становятся одним
// человеком.
//
// short — за что роль отвечает, одной строкой. Это единственный текст, который
// видно в свёрнутой карточке: пять развёрнутых описаний подряд читаются как
// сплошное полотно, и роли в нём не различаются.
export const roles = [
  {
    title: { ru: 'Аналитик данных', en: 'Data analyst' },
    short: { ru: 'Вопросы от любой команды: посчитать, проверить, объяснить', en: 'Questions from any team: compute it, check it, explain it' },
    track: 'analyst',
    base: true,
    who: {
      ru: 'Аналитик данных без уточнения в названии — самая широкая роль трека. Он отвечает на вопросы, которые приходят от любой команды: почему изменилась метрика, сколько это стоило, что будет, если поменять условие. Специализации у роли нет, и предмет меняется вместе с вопросом.',
      en: 'A data analyst with no qualifier in the title is the broadest role on the track. They answer questions from any team: why a metric moved, what it cost, what happens if a condition changes. The role has no specialisation, and its subject shifts with the question.',
    },
    vs: {
      ru: 'Это базовая роль трека, и остальные четыре выросли из неё сужением предмета. Продуктовый аналитик занимается только продуктом, BI-аналитик только отчётностью, маркетинговый и web-аналитик только продвижением. Аналитик данных остаётся там, где вопросы приходят отовсюду, и поэтому чаще других работает напрямую с хранилищем.',
      en: 'This is the base role of the track, and the other four grew out of it by narrowing the subject. A product analyst deals only with the product, a BI analyst only with reporting, marketing and web analysts only with promotion. A data analyst stays where questions come from everywhere, and therefore works with the warehouse directly more often than the rest.',
    },
    tasks: {
      ru: [
        'Выгрузки и расчёты под вопросы разных команд',
        'Регулярная отчётность и дашборды',
        'Разбор аномалий: поломка данных или настоящее изменение',
        'Исследования под конкретное решение',
        'Сверка цифр с другими командами и поиск причины расхождения',
      ],
      en: [
        'Extracts and calculations for questions from different teams',
        'Recurring reporting and dashboards',
        'Investigating anomalies: broken data or a real change',
        'Research behind a specific decision',
        'Reconciling numbers with other teams and finding the cause of a gap',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['SQL', 'Excel / Sheets', 'Python / pandas'] },
      { g: { ru: 'Показать', en: 'Show it' }, items: ['BI: Metabase, Superset, DataLens, Tableau'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересно разбираться в причинах и не хочется рано сужаться до одной области. Она же чаще всего оказывается первой работой в данных: специализацию выбирают уже внутри компании, когда понятно, какие вопросы интереснее.',
      en: 'The role suits you if you enjoy digging into causes and would rather not narrow down early. It is also the most common first job in data: the specialisation gets chosen inside the company, once it is clear which questions interest you more.',
    },
  },
  {
    title: { ru: 'Продуктовый аналитик', en: 'Product analyst' },
    short: { ru: 'Эксперименты и метрики одного продукта', en: 'Experiments and the metrics of one product' },
    track: 'analyst',
    who: {
      ru: 'Продуктовый аналитик работает внутри продуктовой команды и отвечает за то, чтобы решения принимались по данным. Основной инструмент здесь эксперимент: гипотеза, метрики, размер выборки, результат и вывод из него. Вторая половина работы — метрики продукта: воронки, удержание, юнит-экономика.',
      en: 'A product analyst works inside a product team and owns the fact that decisions come from data. The main tool is the experiment: hypothesis, metrics, sample size, result and the conclusion from it. The other half of the job is product metrics: funnels, retention, unit economics.',
    },
    vs: {
      ru: 'От аналитика данных отличается предметом и позицией: он сидит в одной команде и отвечает за один продукт, а не за поток вопросов от всей компании. От BI-аналитика тем, что не строит систему отчётности, а участвует в решении о том, что делать с продуктом дальше. От маркетингового аналитика тем, что считает поведение внутри продукта, а не окупаемость каналов, которые привели человека.',
      en: 'It differs from a data analyst in subject and position: they sit in one team and own one product rather than a stream of questions from the whole company. It differs from a BI analyst in that they do not build the reporting system but take part in deciding what happens to the product next. It differs from a marketing analyst in that they measure behaviour inside the product, not the payback of the channels that brought the person in.',
    },
    tasks: {
      ru: [
        'Дизайн A/B-тестов: гипотеза, метрики и размер выборки до запуска',
        'Разбор результатов и решение, которое из них следует',
        'Метрики фич и воронок, разбор причин изменения',
        'Юнит-экономика и когорты',
        'Разметка событий: следить, чтобы считаемое попадало в логи',
        'Аргументы за и против пунктов роадмапа продукта',
      ],
      en: [
        'A/B test design: hypothesis, metrics and sample size before the launch',
        'Reading results and the decision that follows from them',
        'Feature and funnel metrics, and the reasons behind a change',
        'Unit economics and cohorts',
        'Event tracking: making sure what you count is actually logged',
        'Arguments for and against items on the product roadmap',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['SQL', 'Python', 'Платформа A/B-тестов'] },
      { g: { ru: 'Аналитика событий', en: 'Event analytics' }, items: ['Amplitude', 'Mixpanel', 'Разметка событий'] },
      { g: { ru: 'Показать', en: 'Show it' }, items: ['BI', 'Дерево метрик'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересен сам продукт и вы готовы спорить о нём наравне с менеджером. Здесь придётся спокойно относиться к тому, что заметная часть тестов заканчивается словами «разницы не видно», и что решение иногда принимают вопреки вашему анализу.',
      en: 'The role suits you if the product itself interests you and you are ready to argue about it on equal terms with the manager. You will need to be fine with a noticeable share of tests ending in "no visible difference", and with decisions that sometimes go against your analysis.',
    },
  },
  {
    title: { ru: 'BI-аналитик / BI-разработчик', en: 'BI analyst / BI developer' },
    short: { ru: 'Система отчётности, которой компания пользуется сама', en: 'The reporting system the company uses on its own' },
    track: 'analyst',
    who: {
      ru: 'BI-аналитик специализируется на визуализации показателей. Он собирает данные из разных источников, приводит их к единому виду и строит интерактивные отчёты в BI-системе. Дальше компания пользуется этими отчётами сама, без запроса к аналитику.',
      en: 'A BI analyst specialises in visualising metrics. They collect data from several sources, reconcile it and build interactive reports in a BI system. After that the company uses those reports on its own, without going back to an analyst.',
    },
    vs: {
      ru: 'От аналитика данных отличается тем, что отвечает не на отдельный вопрос, а строит систему отчётности, которая закрывает такие вопросы без него. Поэтому большая часть времени уходит на сбор требований и устройство витрин, а расчёты занимают меньшую долю дня. От продуктового аналитика отличается тем, что почти не участвует в решениях о продукте, а от дата-инженера тем, что работает над витриной и её отображением, а не над доставкой данных.',
      en: 'It differs from a data analyst in that they do not answer a single question but build the reporting system that closes such questions without them. Most of their time therefore goes into requirements and mart design, and calculations take a smaller share of the day. It differs from a product analyst in that they barely take part in product decisions, and from a data engineer in that they work on the mart and how it is displayed rather than on delivering the data.',
    },
    where: {
      ru: 'Крупные компании с несколькими бизнес-юнитами, где задачи разведены между разными аналитиками. Второй вариант: агентства, которые продают BI на аутсорс. Чаще всего это IT, финтех и банкинг, телеком.',
      en: 'Large companies with several business units, where the work is split between different analysts. The other option is agencies selling BI as a service. Most often IT, fintech and banking, telecom.',
    },
    tasks: {
      ru: [
        'Разработка отчётности от бизнес-требования до работающего дашборда. В крупных командах эту часть отдают BI-разработчику',
        'Шаблоны отчётов, чтобы следующий дашборд не собирался заново',
        'Доработка и обновление того, что уже работает. Поддержка занимает большую часть жизни дашборда',
        'Сбор и формализация требований на развитие аналитической платформы',
        'Постановка задач дата-инженерам на новые витрины',
        'Разбор источников и бизнес-процессов компании, чтобы понимать, чем наполнять поля витрины',
      ],
      en: [
        'Building reporting from a business requirement to a working dashboard. In large teams this part goes to a BI developer',
        'Report templates, so the next dashboard is not assembled from scratch',
        'Extending and updating what already runs. Maintenance takes up most of a dashboard’s life',
        'Gathering and formalising requirements for the analytics platform',
        'Briefing data engineers on new marts',
        'Studying the sources and business processes, to know what fills the fields of a mart',
      ],
    },
    stack: [
      { g: { ru: 'Запросы', en: 'Querying' }, items: ['SQL', 'DAX', 'MDX', 'Python / R'] },
      { g: { ru: 'BI-инструменты', en: 'BI tools' }, items: ['Power BI', 'Qlik', 'Superset', 'Yandex DataLens', 'Visiology', 'Redash'] },
      { g: { ru: 'Данные под отчётом', en: 'Data behind the report' }, items: ['СУБД', 'Архитектура хранилищ', 'ETL: Airflow', 'Excel продвинуто'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересно доводить работу до вида, которым пользуются каждый день. Кроме аналитического мышления здесь нужна инициативность: хороший дашборд редко описан в задаче, его приходится предлагать самому.',
      en: 'The role suits you if you enjoy taking work to the state where people use it daily. Beyond analytical thinking it needs initiative: a good dashboard is rarely spelled out in the ticket, you have to propose it yourself.',
    },
    overlap: {
      ru: 'Засчитываются SQL, понимание метрик и опыт работы с заказчиком. Добрать придётся один BI-инструмент вглубь, DAX или MDX, устройство хранилищ и витрин.',
      en: 'SQL, metric literacy and stakeholder experience all count. You will need to add one BI tool in depth, DAX or MDX, and how warehouses and marts are built.',
    },
    growth: {
      ru: 'Отсюда уходят в аналитику данных за более широким кругом задач или в BI-разработку, если интереснее сама система, чем отчёты в ней. Третий вариант это дата-инжиниринг, ближе к слою под витриной.',
      en: 'People move on into data analytics for a wider set of questions, or into BI development if the system itself interests them more than the reports on it. The third option is data engineering, closer to the layer below the mart.',
    },
  },
  {
    title: { ru: 'Маркетолог-аналитик', en: 'Marketing analyst' },
    short: { ru: 'Окупаемость каналов и рекламного бюджета', en: 'The payback of channels and the ad budget' },
    track: 'analyst',
    who: {
      ru: 'Маркетолог-аналитик отвечает на вопрос, окупается ли маркетинг. Он считает эффективность кампаний и отдельных каналов, строит воронку продаж, оценивает лояльность аудитории и прогнозирует, что даст следующий бюджет. Цель формулируется одинаково почти везде: поднять отдачу от продвижения и снизить стоимость привлечения.',
      en: 'A marketing analyst answers whether marketing pays for itself. They measure campaigns and individual channels, build the sales funnel, assess loyalty and forecast what the next budget will return. The goal is framed the same way almost everywhere: raise the return on promotion and lower the cost of acquisition.',
    },
    vs: {
      ru: 'Аппарат здесь тот же самый: когорты, воронки, A/B-тесты. Отличается предмет, потому что считают продвижение, а не продукт. От продуктового аналитика отличается тем, что отвечает за окупаемость каналов и бюджета, а не за поведение внутри продукта. От web-аналитика отличается шириной: здесь весь маркетинг, включая офлайн и CRM. Основную часть работы составляет знание домена, поэтому без опыта в маркетинге откликаться рано даже при хороших SQL и Python.',
      en: 'The apparatus is the same: cohorts, funnels, A/B tests. The subject differs, because the counting is about promotion rather than the product. It differs from a product analyst in owning the payback of channels and budget rather than behaviour inside the product. It differs from a web analyst in breadth: this is all of marketing, offline and CRM included. Domain knowledge makes up most of the job, so without marketing experience it is early to apply even with good SQL and Python.',
    },
    tasks: {
      ru: [
        'Оценка эффективности рекламных кампаний и отдельных каналов',
        'Настройка воронки продаж и поиск мест, где она теряет людей',
        'A/B-тесты маркетинговых гипотез',
        'Анализ аудитории когортами и сегментами',
        'Прогноз продаж и рисков кампании до того, как потрачен бюджет',
        'Отчёты и дашборды для тех, кто распределяет деньги',
      ],
      en: [
        'Measuring campaigns and individual channels',
        'Setting up the sales funnel and finding where it loses people',
        'A/B tests of marketing hypotheses',
        'Analysing the audience by cohorts and segments',
        'Forecasting sales and campaign risk before the budget is spent',
        'Reports and dashboards for the people who allocate the money',
      ],
    },
    stack: [
      { g: { ru: 'Источники', en: 'Sources' }, items: ['Яндекс Метрика, Google Analytics', 'CRM', 'Рекламные кабинеты', 'Roistat, Calltouch, OWOX'] },
      { g: { ru: 'Анализ', en: 'Analysis' }, items: ['Excel', 'SQL', 'Python для выгрузок и сегментации', 'Similarweb, Serpstat'] },
      { g: { ru: 'Показать', en: 'Show it' }, items: ['Power BI, DataLens, Grafana', 'Miro, Notion'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересны рынок и поведение людей, а устройство данных при этом вторично. Программирование здесь не обязательное требование: оно ускоряет работу, но профессию определяют другие навыки.',
      en: 'The role suits you if the market and how people behave interest you, and the mechanics of data come second. Programming is not a hard requirement: it speeds the work up, but other skills define the job.',
    },
    overlap: {
      ru: 'Засчитываются A/B-тесты, когорты, воронки, SQL и Python. Добрать придётся системы веб-аналитики, сквозную аналитику, рекламные кабинеты и CRM.',
      en: 'A/B tests, cohorts, funnels, SQL and Python all count. You will need to add web analytics platforms, attribution tools, ad accounts and CRM.',
    },
    growth: {
      ru: 'Самый частый переход это аналитика продукта, если за плечами есть метрики и тесты. Дальше по частоте идёт общая аналитика при знании SQL, Python и BI, а также возврат в маркетинг на роль интернет-маркетолога или продакт-маркетинг-менеджера.',
      en: 'The most common move is into product analytics, if you have metrics and tests behind you. Next comes general analytics with SQL, Python and BI, and a return to marketing as a digital marketer or product marketing manager.',
    },
  },
  {
    title: { ru: 'Web-аналитик', en: 'Web analyst' },
    short: { ru: 'Поведение на сайте и разметка событий', en: 'Behaviour on the site and event tracking' },
    track: 'analyst',
    who: {
      ru: 'Web-аналитик занимается узкой частью маркетинговой аналитики: поведением посетителей на сайте и посадочных страницах. Он смотрит, откуда пришёл трафик, сколько страниц человек просмотрел и на каком шаге ушёл. Заметная доля работы приходится на настройку сбора данных: пока события не размечены и теги не расставлены, анализировать нечего.',
      en: 'A web analyst covers a narrow part of marketing analytics: how visitors behave on a site and its landing pages. They look at where traffic came from, how many pages a person viewed and at which step they left. A noticeable share of the job is setting up collection: until events are tagged, there is nothing to analyse.',
    },
    vs: {
      ru: 'Самая узкая роль трека: здесь работают только с данными о сайте. От маркетингового аналитика отличается тем, что не отвечает за бюджет и каналы целиком, а разбирает поведение на страницах. Заметная доля работы уходит на настройку сбора: пока события не размечены и теги не расставлены, анализировать нечего. Роль ближе к вёрстке и рекламным кабинетам, чем к хранилищу, и статистика здесь почти не используется.',
      en: 'The narrowest role on the track: the work is only with data about the website. It differs from a marketing analyst in not owning the budget and the channels as a whole, and looking at behaviour on pages instead. A noticeable share of the job is setting up collection: until events are tagged, there is nothing to analyse. The role sits closer to markup and ad accounts than to a warehouse, and statistics barely come up.',
    },
    tasks: {
      ru: [
        'Установка и настройка системы аналитики, разметка событий и тегов',
        'Отслеживание трафика по всем каналам, включая контекстную рекламу',
        'Поведение аудитории: глубина просмотра, время на странице, пути по сайту',
        'Поиск неэффективных страниц и слабых мест воронки',
        'Гипотезы по улучшению сайта и A/B-тесты под них',
        'Отчёты по маркетинговым активностям',
      ],
      en: [
        'Installing and configuring analytics, tagging events',
        'Tracking traffic across every channel, paid search included',
        'Audience behaviour: depth of view, time on page, paths through the site',
        'Finding weak pages and leaking points in the funnel',
        'Hypotheses for improving the site and A/B tests behind them',
        'Reporting on marketing activity',
      ],
    },
    stack: [
      { g: { ru: 'Сбор', en: 'Collection' }, items: ['Google Analytics, Яндекс Метрика', 'Adobe Analytics', 'Менеджеры тегов', 'UTM-разметка'] },
      { g: { ru: 'Тесты и анализ', en: 'Tests and analysis' }, items: ['Optimizely, Adobe Target', 'SQL', 'Python / R для скриптов', 'Excel'] },
      { g: { ru: 'Рядом с сайтом', en: 'Next to the site' }, items: ['JavaScript, HTML, CSS', 'SEMrush, SimilarWeb', 'Figma'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам нравится доводить мелочи до порядка. Половина результата здесь зависит от того, насколько аккуратно размечен сайт, и это довольно кропотливая работа.',
      en: 'The role suits you if you like getting small things in order. Half the outcome here depends on how carefully the site is tagged, and that is painstaking work.',
    },
    overlap: {
      ru: 'Засчитываются A/B-тесты и воронки. Добрать придётся системы аналитики, менеджеры тегов, UTM-разметку и базовый JavaScript.',
      en: 'A/B tests and funnels count. You will need to add analytics suites, tag managers, UTM tagging and basic JavaScript.',
    },
    growth: {
      ru: 'Ближе всего маркетинговая аналитика, потому что инструменты пересекаются почти полностью. Дальше идут аналитика данных при знании SQL, Python и BI, а также web-разработка, фронтенд и UX-дизайн.',
      en: 'The closest move is marketing analytics, because the tools overlap almost entirely. After that come data analytics with SQL, Python and BI, and web or front-end development and UX design.',
    },
  },
  {
    title: { ru: 'Дата-инженер', en: 'Data engineer' },
    short: { ru: 'Путь данных от источника до витрины', en: 'The path of data from source to mart' },
    track: 'de',
    base: true,
    who: {
      ru: 'Дата-инженер — базовая роль трека. Он отвечает за путь данных целиком: забрать из источников, сложить в хранилище, разложить по слоям и отдать витринами. Вместе с этим на нём модель данных и то, чтобы через год в таблицах можно было разобраться без него.',
      en: 'A data engineer is the base role of the track. They own the whole path of the data: pull it from the sources, land it in the warehouse, split it into layers and hand it over as marts. Along with that they own the data model, and the fact that a year later the tables still make sense without them.',
    },
    vs: {
      ru: 'Остальные три роли трека — это его части, выделенные в отдельную работу там, где объём вырос. Analytics Engineer забирает верхний слой, ближе к витринам и метрикам. ETL-разработчик забирает загрузки. Инженер по качеству забирает проверки. В компании поменьше всё это делает один дата-инженер, и вакансия называется просто так.',
      en: 'The other three roles on the track are parts of this one, split off into separate jobs where the volume grew. An analytics engineer takes the top layer, closer to marts and metrics. An ETL developer takes the loads. A quality engineer takes the checks. In a smaller company one data engineer does all of it, and the posting is titled exactly this way.',
    },
    tasks: {
      ru: [
        'Пайплайны загрузки и трансформации, их поддержка и дежурство по сбоям',
        'Модель данных: слои, витрины, гранулярность',
        'Тесты качества, свежесть, контракты с источниками',
        'Оптимизация стоимости и скорости запросов',
        'Документация витрин для аналитиков',
      ],
      en: [
        'Ingestion and transformation pipelines, their upkeep and on-call for failures',
        'The data model: layers, marts, granularity',
        'Quality tests, freshness, contracts with sources',
        'Optimising query cost and speed',
        'Mart documentation for analysts',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['SQL глубоко', 'Python', 'Airflow / Dagster', 'dbt'] },
      { g: { ru: 'Хранение', en: 'Storage' }, items: ['PostgreSQL, ClickHouse', 'Parquet', 'Kafka, Spark'] },
      { g: { ru: 'Инженерия', en: 'Engineering' }, items: ['Docker, Git, CI', 'Мониторинг'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам нравится, когда система работает сама и сообщает о проблеме раньше людей. Работа заметна в основном в момент поломки, и с этим приходится мириться.',
      en: 'The role suits you if you like it when a system runs on its own and reports a problem before people do. The work is mostly visible at the moment it breaks, and you have to live with that.',
    },
  },
  {
    title: { ru: 'Analytics Engineer', en: 'Analytics engineer' },
    short: { ru: 'Витрины и определения метрик в коде', en: 'Marts and metric definitions in code' },
    who: {
      ru: 'Analytics Engineer работает между аналитиком и дата-инженером. Он превращает сырые данные в витрины, которыми пользуются аналитики, и держит определения метрик в коде, а не в головах. Роль появляется в компании тогда, когда одну и ту же метрику начинают считать тремя способами и цифры перестают сходиться.',
      en: 'An analytics engineer works between the analyst and the data engineer. They turn raw data into the marts analysts use and keep metric definitions in code rather than in people’s heads. The role appears once one metric starts being computed three different ways and the numbers stop agreeing.',
    },
    vs: {
      ru: 'От дата-инженера отличается слоем: он работает там, где данные уже лежат в хранилище, и превращает их в витрины, которыми пользуются аналитики. Определения метрик при этом живут в коде, а не в головах. От ETL-разработчика отличается тем, что отвечает за то, каким получится результат, а не за саму загрузку. Вакансию с названием «DWH-аналитик» на рынке чаще всего описывают именно так.',
      en: 'It differs from a data engineer in the layer: they work where the data already sits in the warehouse and turn it into the marts analysts use. Metric definitions then live in code rather than in people’s heads. It differs from an ETL developer in owning what the result looks like rather than the load itself. A posting titled "DWH analyst" usually describes exactly this.',
    },
    tasks: {
      ru: [
        'Витрины и слои: сырой, очищенный, готовый к использованию',
        'Определения метрик как код, с версиями и тестами',
        'Тесты качества: уникальность ключа, свежесть, полнота',
        'Документация витрин, чтобы аналитик разобрался без вас',
      ],
      en: [
        'Marts and layers: raw, cleaned, ready to use',
        'Metric definitions as code, with versions and tests',
        'Quality tests: key uniqueness, freshness, completeness',
        'Mart documentation, so an analyst can work it out without you',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['SQL глубоко', 'dbt', 'Git, CI'] },
      { g: { ru: 'Рядом', en: 'Around it' }, items: ['Airflow', 'Моделирование: звезда, SCD', 'Python'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вас раздражает, когда одну метрику считают по-разному, и хочется чинить это в корне, а не в очередном запросе.',
      en: 'The role suits you if it grates when one metric is computed three ways and you want to fix that at the root, not in yet another query.',
    },
    overlap: {
      ru: 'Засчитываются SQL, понимание гранулярности и витрин. Добрать придётся dbt, инженерные стандарты и моделирование данных.',
      en: 'SQL, granularity and an understanding of marts all count. You will need to add dbt, engineering standards and data modelling.',
    },
    growth: {
      ru: 'В дата-инженерию, глубже под витрину. В продуктовую или общую аналитику, ближе к вопросам бизнеса.',
      en: 'Into data engineering, deeper below the mart. Into product or general analytics, closer to the business questions.',
    },
    role: 'de',
    track: 'de',
  },
  {
    title: { ru: 'ETL-разработчик', en: 'ETL developer' },
    short: { ru: 'Загрузки из источников по готовому требованию', en: 'Loads from sources against a written requirement' },
    track: 'de',
    who: {
      ru: 'ETL-разработчик пишет и поддерживает загрузки данных из систем-источников в хранилище. Задача обычно приходит уже поставленной: есть источник, есть целевая таблица, нужно перенести данные и обеспечить, чтобы перенос повторялся каждый день без вмешательства. В крупных компаниях эта работа выделена в отдельную роль, в остальных входит в обязанности дата-инженера.',
      en: 'An ETL developer writes and maintains the loads that bring data from source systems into the warehouse. The task usually arrives already framed: there is a source, there is a target table, and the data has to move and keep moving every day without intervention. In large companies this is a separate role; elsewhere it is part of a data engineer’s job.',
    },
    vs: {
      ru: 'От дата-инженера отличается границами ответственности при тех же инструментах: ETL-разработчик отвечает за загрузку по готовому требованию, а модель данных, качество и то, как хранилищем пользуются дальше, остаются на дата-инженере. От инженера по качеству отличается тем, что отвечает за доставку данных, а проверки над ними настраивает кто-то другой.',
      en: 'It differs from a data engineer in scope while using the same tools: an ETL developer owns the load against a written requirement, while the data model, the quality and how the warehouse gets used stay with the data engineer. It differs from a quality engineer in owning the delivery of the data, with the checks on top of it set up by someone else.',
    },
    tasks: {
      ru: [
        'Разработка загрузок из источников: базы, файлы, API',
        'Поддержка и починка существующих потоков, дежурство по сбоям',
        'Проверка полноты и корректности перенесённых данных',
        'Документирование маппинга полей источника на поля приёмника',
      ],
      en: [
        'Building loads from sources: databases, files, APIs',
        'Maintaining and fixing existing flows, on-call for failures',
        'Checking that the transferred data is complete and correct',
        'Documenting how source fields map onto target fields',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['SQL', 'Python', 'Airflow, Informatica, Talend'] },
      { g: { ru: 'Рядом', en: 'Around it' }, items: ['Реляционные СУБД', 'Форматы обмена: CSV, JSON, XML', 'Git'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам нормально работать по готовому требованию и вы аккуратны в мелочах. Ошибка в загрузке проявляется не сразу, а в отчёте через неделю, поэтому здесь ценят внимательность больше, чем скорость.',
      en: 'The role suits you if working to a written requirement is fine by you and you are careful with details. An error in a load shows up not immediately but in a report a week later, so care counts for more than speed here.',
    },
    overlap: {
      ru: 'Засчитываются SQL, Python и понимание, откуда берутся данные. Добрать придётся оркестрацию, идемпотентность и инженерные стандарты кода.',
      en: 'SQL, Python and an understanding of where data comes from all count. You will need to add orchestration, idempotency and engineering standards for code.',
    },
    growth: {
      ru: 'Отсюда чаще всего уходят в дата-инженерию, где к загрузкам добавляются модель данных и качество. Второй вариант это Analytics Engineer, ближе к витринам и определениям метрик.',
      en: 'The usual move is into data engineering, where the data model and quality join the loads. The second option is analytics engineering, closer to marts and metric definitions.',
    },
    role: 'de',
  },
  {
    title: { ru: 'Инженер по качеству данных', en: 'Data quality engineer' },
    short: { ru: 'Проверки, свежесть и контракты с источниками', en: 'Checks, freshness and contracts with sources' },
    track: 'de',
    who: {
      ru: 'Инженер по качеству данных отвечает за то, чтобы ошибки в данных находились раньше, чем их увидят в отчёте. Он описывает правила проверки, настраивает тесты на полноту, свежесть и целостность, договаривается с владельцами источников о том, что считается поломкой, и разбирает инциденты, когда правило сработало.',
      en: 'A data quality engineer makes sure errors in the data get found before someone sees them in a report. They describe the checks, set up tests for completeness, freshness and integrity, agree with source owners on what counts as a break, and work through the incidents when a rule fires.',
    },
    vs: {
      ru: 'От дата-инженера отличается предметом: он отвечает за проверки и за договорённости с владельцами источников, а доставку данных обеспечивает кто-то другой. Отдельной ролью встречается в основном в крупных компаниях с большим числом источников. В остальных качество данных остаётся частью работы дата-инженера или аналитика, и отдельной вакансии не появляется.',
      en: 'It differs from a data engineer in subject: they own the checks and the agreements with source owners, while someone else provides the delivery. As a separate role this mostly exists in large companies with many sources. Elsewhere data quality stays part of a data engineer’s or an analyst’s job and no separate posting appears.',
    },
    tasks: {
      ru: [
        'Правила и тесты качества на ключевых таблицах',
        'Мониторинг свежести и полноты, алерты на отклонения',
        'Контракты с источниками: что считается поломкой и кто её чинит',
        'Разбор инцидентов и поиск причины, а не только последствия',
      ],
      en: [
        'Quality rules and tests on the key tables',
        'Freshness and completeness monitoring, alerts on deviations',
        'Contracts with sources: what counts as a break and who fixes it',
        'Incident analysis, looking for the cause rather than only the effect',
      ],
    },
    stack: [
      { g: { ru: 'Проверки', en: 'Checks' }, items: ['SQL', 'dbt tests', 'Great Expectations', 'Soda'] },
      { g: { ru: 'Рядом', en: 'Around it' }, items: ['Airflow', 'Python', 'Мониторинг и алертинг'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересно доводить систему до состояния, когда она сама сообщает о проблеме. Работа во многом состоит из переговоров с владельцами источников, а не только из кода.',
      en: 'The role suits you if you enjoy getting a system to the point where it reports its own problems. Much of the work is negotiating with source owners rather than writing code.',
    },
    overlap: {
      ru: 'Засчитываются SQL, понимание гранулярности и опыт разбора расхождений в цифрах. Добрать придётся инструменты тестирования данных и мониторинг.',
      en: 'SQL, granularity and experience chasing down discrepancies all count. You will need to add data testing tools and monitoring.',
    },
    growth: {
      ru: 'Ближе всего дата-инженерия целиком. Второй вариант это платформенные команды, где качество данных становится частью общей инфраструктуры.',
      en: 'The closest move is data engineering as a whole. The second option is platform teams, where data quality becomes part of the shared infrastructure.',
    },
    role: 'de',
  },
  {
    title: { ru: 'Data Scientist', en: 'Data scientist' },
    short: { ru: 'Модель, которая предсказывает верно', en: 'A model that predicts correctly' },
    track: 'ds',
    base: true,
    who: {
      ru: 'Data Scientist — базовая роль трека. Он отвечает за то, что модель предсказывает верно: формулирует задачу вместе с бизнесом, готовит данные и признаки, обучает модель и честно проверяет её качество. После запуска он же разбирается, почему качество упало.',
      en: 'A data scientist is the base role of the track. They own the model predicting correctly: framing the task with the business, preparing the data and the features, training the model and honestly checking its quality. After launch they are also the one working out why the quality dropped.',
    },
    vs: {
      ru: 'ML-инженер отвечает не за верность предсказания, а за то, что модель работает как сервис: держит нагрузку, отвечает быстро и стоит разумных денег. MLOps-инженер отвечает за процесс вокруг этого: сборку, доставку, версии, мониторинг. AI-инженер вообще не обучает модель, а встраивает чужую. В небольшой команде все четыре роли — это один человек, и вакансия называется любым из четырёх названий.',
      en: 'An ML engineer owns not the correctness of the prediction but the model running as a service: holding load, answering fast and costing a sensible amount. An MLOps engineer owns the process around that: building, delivery, versions, monitoring. An AI engineer does not train a model at all and wires in someone else’s. In a small team all four roles are one person, and the posting uses any of the four titles.',
    },
    tasks: {
      ru: [
        'Постановка задачи вместе с бизнесом: что предсказываем и зачем',
        'Подготовка данных, разметка и признаки',
        'Обучение моделей и честная валидация',
        'Оценка модели в A/B против текущего решения',
        'Разбор деградации качества после запуска',
      ],
      en: [
        'Framing the task with the business: what we predict and why',
        'Preparing data, labelling and features',
        'Training models and validating them honestly',
        'Evaluating the model in an A/B against the current solution',
        'Investigating quality decay after launch',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['Python', 'pandas / numpy', 'SQL'] },
      { g: { ru: 'Модели', en: 'Models' }, items: ['scikit-learn', 'CatBoost / LightGBM', 'PyTorch'] },
      { g: { ru: 'Довезти', en: 'Ship it' }, items: ['MLflow', 'Docker, Git'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вы спокойно переносите длинные отрезки без видимого результата и вам интересна математика за моделью. Месяц работы над данными, из которого не выходит ни одной работающей модели, здесь нормальная ситуация.',
      en: 'The role suits you if you can handle long stretches without a visible result and the maths behind the model interests you. A month of work on the data that produces no working model at all is a normal situation here.',
    },
  },
  {
    title: { ru: 'ML-инженер', en: 'ML engineer' },
    short: { ru: 'Модель, которая надёжно работает под нагрузкой', en: 'A model that runs reliably under load' },
    track: 'ds',
    who: {
      ru: 'ML-инженер отвечает за то, чтобы модель работала как сервис: выдерживала нагрузку, отвечала за приемлемое время и стоила разумных денег. Он занимается сервингом, версиями моделей, автоматическим переобучением и мониторингом. Саму модель при этом часто обучает кто-то другой.',
      en: 'An ML engineer owns the model as a service: it has to hold load, answer within an acceptable time and cost a reasonable amount. The work covers serving, model versions, automatic retraining and monitoring. The model itself is often trained by someone else.',
    },
    vs: {
      ru: 'От Data Scientist отличается зоной ответственности: DS отвечает за то, что модель предсказывает верно, а ML-инженер за то, что она надёжно работает под нагрузкой. От MLOps-инженера отличается масштабом: здесь конкретный сервис с моделью, там платформа и процесс для всех команд. В небольшой команде это один человек, и вакансия называется любым из трёх названий.',
      en: 'It differs from a data scientist in what it owns: a DS owns the model predicting correctly, an ML engineer owns it running reliably under load. It differs from an MLOps engineer in scale: here it is a specific service with a model, there it is the platform and the process for every team. In a small team that is one person, and the posting uses any of the three titles.',
    },
    tasks: {
      ru: [
        'Сервинг моделей: API, очереди, батч-инференс',
        'Пайплайны обучения и автоматическое переобучение по расписанию',
        'Мониторинг качества и дрейфа данных в продакшене',
        'Стоимость инференса и время ответа',
      ],
      en: [
        'Model serving: APIs, queues, batch inference',
        'Training pipelines and scheduled automatic retraining',
        'Monitoring quality and data drift in production',
        'Inference cost and response time',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['Python', 'Docker, Kubernetes', 'MLflow'] },
      { g: { ru: 'Рядом', en: 'Around it' }, items: ['Airflow', 'CI и тесты', 'Мониторинг: Prometheus, Grafana'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам ближе инженерная часть, чем исследовательская, и вы спокойно относитесь к дежурствам. Здесь больше кода и инфраструктуры, чем экспериментов с моделями.',
      en: 'The role suits you if the engineering half appeals more than the research half and on-call duty does not put you off. There is more code and infrastructure here than model experimentation.',
    },
    overlap: {
      ru: 'Засчитываются Python, понимание моделей и опыт валидации. Добрать придётся инженерные стандарты, контейнеры и мониторинг.',
      en: 'Python, an understanding of models and validation experience all count. You will need to add engineering standards, containers and monitoring.',
    },
    growth: {
      ru: 'Отсюда уходят в платформенные ML-команды или в инженерию данных, если инфраструктура интереснее самих моделей.',
      en: 'People move on into platform ML teams, or into data engineering if the infrastructure interests them more than the models.',
    },
  },
  {
    title: { ru: 'MLOps-инженер', en: 'MLOps engineer' },
    short: { ru: 'Сборка, доставка и мониторинг моделей', en: 'Building, delivering and monitoring models' },
    track: 'ds',
    who: {
      ru: 'MLOps-инженер отвечает за процесс вокруг моделей: сборку, доставку, версии данных и кода, автоматическое переобучение и мониторинг. Его результат — не сама модель, а то, что команда выкатывает новую версию без ручной работы и знает, когда качество поехало.',
      en: 'An MLOps engineer owns the process around models: building, delivery, versions of data and code, automatic retraining and monitoring. Their output is not the model itself but the fact that the team ships a new version without manual work and knows when quality slips.',
    },
    vs: {
      ru: 'От ML-инженера отличается границей: ML-инженер отвечает за конкретный сервис с моделью, а MLOps за платформу и процесс, которыми пользуются все команды. На практике эти две вакансии часто описывают одну и ту же работу, и различать их стоит по списку задач. От дата-инженера отличается предметом: там пайплайны данных, здесь пайплайны моделей.',
      en: 'It differs from an ML engineer in scope: an ML engineer owns a specific service with a model, while MLOps owns the platform and the process every team uses. In practice these two postings often describe the same work, and the task list is what tells them apart. It differs from a data engineer in subject: there the pipelines carry data, here they carry models.',
    },
    tasks: {
      ru: [
        'Пайплайны обучения и выкатки моделей',
        'Версии данных, кода и моделей, воспроизводимость эксперимента',
        'Мониторинг качества и дрейфа, откат на прошлую версию',
        'Инфраструктура под инференс и её стоимость',
      ],
      en: [
        'Training and deployment pipelines for models',
        'Versions of data, code and models, reproducibility of an experiment',
        'Quality and drift monitoring, rollback to a previous version',
        'Inference infrastructure and what it costs',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['Python', 'Docker, Kubernetes', 'CI'] },
      { g: { ru: 'ML-часть', en: 'The ML half' }, items: ['MLflow', 'Airflow', 'Feature store'] },
      { g: { ru: 'Наблюдение', en: 'Observability' }, items: ['Prometheus, Grafana', 'Логи и алерты'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам ближе инженерия, чем исследование, и вы готовы к дежурствам. Здесь почти нет работы с признаками и метриками качества модели, зато много инфраструктуры.',
      en: 'The role suits you if engineering appeals more than research and you are ready for on-call. There is almost no feature or model-quality work here, and a lot of infrastructure.',
    },
  },
  {
    title: { ru: 'AI-инженер (LLM)', en: 'AI engineer (LLM)' },
    short: { ru: 'Продукты поверх готовых языковых моделей', en: 'Products on top of existing language models' },
    track: 'ds',
    who: {
      ru: 'AI-инженер собирает продукты поверх готовых языковых моделей: ассистентов, поиск по документам, обработку обращений. Модель здесь не обучают, а подбирают, встраивают и оценивают. Основная часть работы это промпты, поиск по базе знаний, ограничения и проверка того, что система отвечает приемлемо.',
      en: 'An AI engineer builds products on top of existing language models: assistants, document search, request handling. The model is not trained here but chosen, wired in and evaluated. Most of the work is prompts, retrieval over a knowledge base, guardrails and checking that the system answers acceptably.',
    },
    vs: {
      ru: 'От Data Scientist отличается тем, что не обучает модель на своих данных, а работает с чужой моделью как с сервисом. Математики здесь заметно меньше, а инженерной работы и оценки качества заметно больше. От ML-инженера отличается предметом: там своя модель в продакшене, здесь чужая модель и то, что вокруг неё: поиск по документам, ограничения и проверка ответов.',
      en: 'It differs from a data scientist in not training a model on its own data and working with someone else’s model as a service. There is noticeably less maths here and noticeably more engineering and evaluation. It differs from an ML engineer in subject: there it is your own model in production, here it is someone else’s model and everything around it: retrieval over documents, guardrails and checking the answers.',
    },
    tasks: {
      ru: [
        'Поиск по документам (RAG): индексы, эмбеддинги, качество выдачи',
        'Промпты и ограничения, чтобы ответы были предсказуемыми',
        'Оценка качества генерации: наборы примеров, разметка, регрессии',
        'Стоимость запросов и время ответа',
      ],
      en: [
        'Retrieval over documents (RAG): indexes, embeddings, retrieval quality',
        'Prompts and guardrails, so the answers stay predictable',
        'Evaluating generation quality: example sets, labelling, regressions',
        'Request cost and response time',
      ],
    },
    stack: [
      { g: { ru: 'Основное', en: 'Core' }, items: ['Python', 'API языковых моделей', 'Векторные базы'] },
      { g: { ru: 'Рядом', en: 'Around it' }, items: ['Docker', 'Оценка качества и разметка', 'Мониторинг стоимости'] },
    ],
    fit: {
      ru: 'Роль подойдёт, если вам интересно быстро собирать работающие продукты и вы готовы к тому, что инструменты меняются каждые несколько месяцев. Формального образования по этой профессии пока нет, и требования у компаний расходятся сильнее, чем в остальных ролях.',
      en: 'The role suits you if you like assembling working products quickly and are fine with tools changing every few months. There is no formal education for this job yet, and requirements differ between companies more than in other roles.',
    },
    overlap: {
      ru: 'Засчитываются Python, привычка измерять качество и опыт работы с API. Добрать придётся устройство языковых моделей, поиск по базе знаний и методы оценки генерации.',
      en: 'Python, the habit of measuring quality and API experience all count. You will need to add how language models work, retrieval over a knowledge base and ways to evaluate generation.',
    },
    growth: {
      ru: 'Отсюда уходят в классический ML, если хочется обучать модели самому, или в продуктовые роли, потому что здесь много решений о том, каким должен быть сам продукт.',
      en: 'People move on into classical ML if they want to train models themselves, or into product roles, because much of the work is deciding what the product should be.',
    },
  },
]

// Возможные ловушки: вакансии, которые называются как трек, но работа там
// другая. Блок короткий и стоит после ролей — человек к этому моменту уже
// знает, как выглядит настоящая работа, и ловушку видно на контрасте.
export const pitfalls = {
  analyst: [
    {
      t: { ru: 'Аналитик данных, а основной инструмент Excel', en: 'Data analyst, but the main tool is Excel' },
      d: {
        ru: 'Иногда попадаются вакансии дата-аналитика, где весь стек это Excel и выгрузки из 1С. Такая работа существует, но она вас не прокачает: ни SQL, ни статистики, ни витрин там не будет, а через год опыт нечем будет подтвердить.',
        en: 'You will sometimes meet data analyst postings where the whole stack is Excel and exports from an accounting system. Such jobs exist, but they will not grow you: no SQL, no statistics, no marts, and a year later there is nothing to show for the experience.',
      },
    },
    {
      t: { ru: 'Вакансия «Аналитик» без уточнения', en: 'A posting titled just "Analyst"' },
      d: {
        ru: 'За этим словом часто стоит системный или бизнес-аналитик. Это другая профессия: там требования, интеграции и описание процессов, а выборок, метрик и статистики нет. Выдаёт стек: BPMN, UML, Swagger и Postman к аналитике данных отношения не имеют.',
        en: 'That word often stands for a systems or business analyst. It is a different profession: requirements, integrations and process descriptions, with no sampling, metrics or statistics. The stack gives it away: BPMN, UML, Swagger and Postman have nothing to do with data analytics.',
      },
    },
    {
      t: { ru: 'Продуктовый аналитик без продукта', en: 'A product analyst with no product' },
      d: {
        ru: 'Если у компании нет цифрового продукта с потоком пользователей, эксперимент ставить не на ком. Считать там есть что, но половина инструментов роли не работает, и на следующем собеседовании опыт A/B-тестов подтвердить не выйдет.',
        en: 'If the company has no digital product with a flow of users, there is no one to run an experiment on. There is plenty to count, but half the toolkit of the role does not apply, and at the next interview you will not be able to back up any A/B experience.',
      },
    },
  ],
  de: [
    {
      t: { ru: 'Дата-инженер, а по задачам выгрузки', en: 'Data engineer, but the tasks are extracts' },
      d: {
        ru: 'Встречаются вакансии, где под инженерией данных имеют в виду поддержку отчётности и ручные выгрузки. Проверяется по описанию задач: если в них нет оркестрации, модели данных и тестов качества, это работа аналитика с другим названием.',
        en: 'There are postings where data engineering means maintaining reports and pulling extracts by hand. The task list settles it: with no orchestration, data model or quality tests in there, it is an analyst’s job under a different title.',
      },
    },
    {
      t: { ru: 'Список из двадцати технологий', en: 'A list of twenty technologies' },
      d: {
        ru: 'Kafka, Spark, Iceberg и ещё десяток названий в компании, у которой все данные лежат в одной базе, обычно означают, что роль не определена. Спрашивайте на собеседовании про объёмы: сколько строк в день и сколько источников.',
        en: 'Kafka, Spark, Iceberg and a dozen more names at a company whose data all sits in one database usually mean the role has not been defined. Ask about volume at the interview: how many rows a day and how many sources.',
      },
    },
  ],
  ds: [
    {
      t: { ru: 'Data Scientist, а по задачам отчётность', en: 'Data scientist, but the tasks are reporting' },
      d: {
        ru: 'Роль иногда заводят по моде, а работа оказывается аналитической: дашборды, выгрузки и разовые исследования. Смотрите, есть ли в описании обучение моделей, валидация и запуск в продакшн, а не только слово «машинное обучение» в требованиях.',
        en: 'The role sometimes gets created because it is fashionable, and the work turns out to be analytics: dashboards, extracts and one-off research. Check whether the description mentions training, validation and shipping to production, rather than only the words "machine learning" in the requirements.',
      },
    },
    {
      t: { ru: 'Задача без данных', en: 'A task with no data' },
      d: {
        ru: 'Если исторических данных нет и разметки нет, первые полгода уйдут на их сбор. Это нормальная работа, но знать о ней лучше до выхода, а не после: ожидания «сделай модель за квартал» при таком старте не сбудутся.',
        en: 'With no historical data and no labels, the first six months go into collecting them. That is normal work, but it is better to know before you join than after: an expectation of "a model in a quarter" will not survive that start.',
      },
    },
  ],
}

// Карьерная лестница трека.
//
// Первые три ступени называются одинаково у всех треков, а дальше лестница
// раздваивается: экспертный путь (глубина без людей в подчинении) и
// управленческий (люди, приоритеты, бюджет). Это не наша выдумка, так устроены
// грейды и в описаниях вакансий, и в гайдах по профессиям: после senior
// человек выбирает между staff/principal и team lead.
//
// Содержание веток у треков разное, и это главное, ради чего блок переписан.
// У аналитики экспертная ветка тонкая и на российском рынке часто отсутствует,
// у инженерии данных она уходит в архитектуру, у DS в исследования. Сроки —
// ориентир по рынку: junior → middle обычно 1,5–2 года, middle → senior ещё
// 2–2,5 года, дальше разброс слишком большой, чтобы называть число.
//
// forks на ступени — боковые переходы, которые с неё открываются. Ниже мидла
// их нет: джуну выбирать не из чего, ему нужно закрыть базу.
export const ladder = {
  analyst: {
    entries: [
      { t: { ru: 'BI-аналитика' }, add: { ru: 'статистика и проверка гипотез', en: 'statistics and hypothesis testing' } },
      { t: { ru: 'Маркетинг и web-аналитика' }, add: { ru: 'SQL и Python на рабочем уровне', en: 'working-level SQL and Python' } },
      { t: { ru: 'Системная или бизнес-аналитика' }, add: { ru: 'SQL, Python, статистика, визуализация', en: 'SQL, Python, statistics, visualisation' } },
      { t: { ru: 'UX-исследования' }, add: { ru: 'количественная часть: метрики и эксперименты', en: 'the quantitative half: metrics and experiments' } },
    ],
    steps: [
      {
        id: 'junior',
        t: { ru: 'Джун', en: 'Junior' },
        pace: { ru: '0–2 года', en: '0–2 years' },
        d: { ru: 'Поддержка отчётности и простые задачи: типовые запросы и дашборды по определениям, которые задал кто-то до вас.', en: 'Reporting upkeep and simple tasks: routine queries and dashboards built on definitions someone set before you.' },
      },
      {
        id: 'middle',
        t: { ru: 'Мидл', en: 'Middle' },
        pace: { ru: '2–4 года', en: '2–4 years' },
        d: { ru: 'Ведёт задачу целиком и сам доводит постановку до однозначной. Заказчик перестаёт объяснять, что именно посчитать.', en: 'Owns a task end to end and sharpens the request themselves. Stakeholders stop spelling out what exactly to count.' },
        forks: [
          { t: { ru: 'Продуктовая аналитика', en: 'Product analytics' } },
          { t: { ru: 'BI и отчётность', en: 'BI and reporting' } },
          { t: { ru: 'Маркетинговая аналитика', en: 'Marketing analytics' } },
        ],
      },
      {
        id: 'senior',
        t: { ru: 'Сеньор', en: 'Senior' },
        pace: { ru: '4+ года', en: '4+ years' },
        d: { ru: 'Отвечает за выводы и за то, как считает вся команда. Переговоры и разбор чужих расчётов весят здесь столько же, сколько Python.', en: 'Owns the conclusions and how the whole team counts. Negotiation and reviewing other people’s numbers weigh as much here as Python.' },
        forks: [
          { t: { ru: 'Data Scientist / ML', en: 'Data Scientist / ML' }, role: 'ds' },
          { t: { ru: 'Инженерия данных', en: 'Data engineering' }, role: 'de' },
          { t: { ru: 'Менеджер продукта', en: 'Product manager' } },
        ],
      },
    ],
    fork: {
      lead: { ru: 'После сеньора лестница раздваивается, и выбирать приходится один раз:', en: 'After senior the ladder splits, and the choice is made once:' },
      ic: {
        t: { ru: 'Экспертный путь', en: 'The expert path' },
        d: { ru: 'Без людей в подчинении: методология, определения метрик и ревью расчётов на всю компанию. На российском рынке отдельной ступени часто нет, и такой человек называется просто сеньором.', en: 'No direct reports: methodology, metric definitions and reviewing numbers across the company. On the Russian market a separate grade often does not exist, and such a person is titled simply senior.' },
        steps: [
          { t: { ru: 'Ведущий аналитик', en: 'Lead analyst (IC)' }, d: { ru: 'Владеет доменом целиком, задаёт определения метрик и разбирает спорные расчёты.', en: 'Owns a whole domain, sets metric definitions and settles disputed numbers.' } },
          { t: { ru: 'Staff-аналитик', en: 'Staff analyst' }, d: { ru: 'Методология и стандарты расчётов для нескольких команд. Встречается в компаниях с большой аналитикой.', en: 'Methodology and calculation standards across several teams. Found in companies with a large analytics function.' } },
        ],
      },
      mgmt: {
        t: { ru: 'Управленческий путь', en: 'The management path' },
        d: { ru: 'Люди, приоритеты и бюджет. Считать руками при этом приходится всё меньше, и это главная причина, по которой с этого пути возвращаются обратно.', en: 'People, priorities and budget. You get to compute things yourself less and less, which is the main reason people step back off this path.' },
        steps: [
          { t: { ru: 'Тимлид', en: 'Team lead' }, d: { ru: 'Команда из трёх-восьми человек: приоритеты, ревью, найм и онбординг.', en: 'A team of three to eight: priorities, reviews, hiring and onboarding.' } },
          { t: { ru: 'Head of Analytics', en: 'Head of analytics' }, d: { ru: 'Аналитика как функция: несколько команд, стандарты, бюджет, разговор с руководством.', en: 'Analytics as a function: several teams, standards, budget, talking to leadership.' } },
          { t: { ru: 'CDO', en: 'CDO' }, d: { ru: 'Данные как актив компании. Ступень редкая: такая роль есть у крупных компаний, где данные приносят деньги напрямую.', en: 'Data as a company asset. A rare grade: the role exists at large companies where data makes money directly.' } },
        ],
      },
    },
    note: {
      ru: 'Лид и хэд есть далеко не в каждой компании. В команде из трёх аналитиков лестница заканчивается на сеньоре, и следующая ступень означает переход в компанию побольше. Спрашивайте на собеседовании, сколько человек в команде и кто ей руководит.',
      en: 'Lead and head do not exist in every company. In a team of three analysts the ladder ends at senior, and the next step means moving to a larger company. Ask at the interview how many people are on the team and who runs it.',
    },
  },

  de: {
    entries: [
      { t: { ru: 'Аналитика' }, role: 'analyst', add: { ru: 'Python как разработка, оркестрация, dbt', en: 'Python as engineering, orchestration, dbt' } },
      { t: { ru: 'Разработка' }, add: { ru: 'SQL вглубь, моделирование данных, хранилища', en: 'SQL in depth, data modelling, warehouses' } },
      { t: { ru: 'ETL-разработка' }, add: { ru: 'модель данных и качество', en: 'the data model and quality' } },
    ],
    steps: [
      {
        id: 'junior',
        t: { ru: 'Джун', en: 'Junior' },
        pace: { ru: '0–2 года', en: '0–2 years' },
        d: { ru: 'Пишет и чинит пайплайны по готовому требованию, дежурит по сбоям и разбирает алерты.', en: 'Writes and fixes pipelines against a written requirement, takes on-call and works through alerts.' },
      },
      {
        id: 'middle',
        t: { ru: 'Мидл', en: 'Middle' },
        pace: { ru: '2–5 лет', en: '2–5 years' },
        d: { ru: 'Отвечает за свой кусок хранилища целиком: модель данных, качество витрин и стоимость запросов.', en: 'Owns their slice of the warehouse end to end: the data model, mart quality and query cost.' },
        forks: [
          { t: { ru: 'Analytics Engineer', en: 'Analytics engineer' } },
          { t: { ru: 'Качество данных', en: 'Data quality' } },
        ],
      },
      {
        id: 'senior',
        t: { ru: 'Сеньор', en: 'Senior' },
        pace: { ru: '5+ лет', en: '5+ years' },
        d: { ru: 'Проектирует платформу и стандарты, по которым пайплайны делают другие команды. Отсюда же обычно вырастает архитектура хранилища.', en: 'Designs the platform and the standards other teams build pipelines by. Warehouse architecture usually grows out of this grade.' },
        forks: [
          { t: { ru: 'ML-инфраструктура', en: 'ML infrastructure' }, role: 'ds' },
          { t: { ru: 'Платформенная команда', en: 'Platform team' } },
        ],
      },
    ],
    fork: {
      lead: { ru: 'После сеньора лестница раздваивается, и на этом треке экспертная ветка длиннее, чем в аналитике:', en: 'After senior the ladder splits, and on this track the expert branch runs longer than in analytics:' },
      ic: {
        t: { ru: 'Экспертный путь', en: 'The expert path' },
        d: { ru: 'Самая развитая экспертная ветка из трёх треков: инженерные грейды выше сеньора существуют почти везде, где есть отдельная команда данных.', en: 'The most developed expert branch of the three tracks: engineering grades above senior exist almost anywhere there is a separate data team.' },
        steps: [
          { t: { ru: 'Staff / Principal Engineer', en: 'Staff / principal engineer' }, d: { ru: 'Самые тяжёлые задачи платформы и технические решения, которые переживут смену команды.', en: 'The hardest platform problems and technical decisions that outlive a change of team.' } },
          { t: { ru: 'Архитектор данных', en: 'Data architect' }, d: { ru: 'Архитектура хранилища и интеграций целиком. Отдельной ролью существует в основном в крупных компаниях, в остальных архитектуру делает senior-инженер.', en: 'The architecture of the warehouse and its integrations. A separate role mostly at large companies; elsewhere a senior engineer does the architecture.' } },
        ],
      },
      mgmt: {
        t: { ru: 'Управленческий путь', en: 'The management path' },
        d: { ru: 'Команда, SLA на данные и бюджет хранилища. Технический контекст здесь теряется медленнее, чем в других треках: обсуждать приходится те же пайплайны.', en: 'The team, data SLAs and the warehouse budget. Technical context fades more slowly here than on other tracks: the conversations are still about pipelines.' },
        steps: [
          { t: { ru: 'Тимлид', en: 'Team lead' }, d: { ru: 'Команда инженеров, SLA на данные, план развития платформы.', en: 'A team of engineers, data SLAs, the plan for the platform.' } },
          { t: { ru: 'Head of Data Platform', en: 'Head of data platform' }, d: { ru: 'Вся платформа: поставщики, доступы, персональные данные, бюджет.', en: 'The whole platform: vendors, access control, personal data, budget.' } },
          { t: { ru: 'CDO или CTO-направление', en: 'CDO or the CTO track' }, d: { ru: 'Данные и инфраструктура на уровне компании. Дата-инженеры чаще приходят сюда через технический менеджмент, а не через аналитику.', en: 'Data and infrastructure at company level. Data engineers usually arrive here through technical management rather than through analytics.' } },
        ],
      },
    },
    note: {
      ru: 'Отдельная роль архитектора данных на российском рынке встречается в основном в крупных компаниях. В остальных её обязанности выполняет senior-инженер или ИТ-архитектор, и вакансии с таким названием вы просто не увидите.',
      en: 'A separate data architect role mostly exists at large companies on the Russian market. Elsewhere its duties sit with a senior engineer or an IT architect, and you simply will not see postings with that title.',
    },
  },

  ds: {
    entries: [
      { t: { ru: 'Аналитика' }, role: 'analyst', add: { ru: 'вероятность, линейная алгебра, классическое ML', en: 'probability, linear algebra, classical ML' } },
      { t: { ru: 'Математика или наука' }, add: { ru: 'SQL, инженерные стандарты, продакшн', en: 'SQL, engineering standards, production' } },
      { t: { ru: 'Разработка' }, add: { ru: 'статистика, валидация, метрики качества', en: 'statistics, validation, quality metrics' } },
    ],
    steps: [
      {
        id: 'junior',
        t: { ru: 'Джун', en: 'Junior' },
        pace: { ru: '0–2 года', en: '0–2 years' },
        d: { ru: 'Обучает модели на поставленной задаче и учится честно мерить качество. Вакансий с таким названием на входе мало: чаще заходят через аналитику или ML-инженерию.', en: 'Trains models on a task someone framed and learns to measure quality honestly. Entry postings with this title are scarce: people usually come in through analytics or ML engineering.' },
      },
      {
        id: 'middle',
        t: { ru: 'Мидл', en: 'Middle' },
        pace: { ru: '2–5 лет', en: '2–5 years' },
        d: { ru: 'Доводит модель до продакшена и удерживает её качество во времени, включая мониторинг и откат.', en: 'Takes a model to production and holds its quality over time, monitoring and rollback included.' },
        forks: [
          { t: { ru: 'ML-инженерия', en: 'ML engineering' } },
          { t: { ru: 'MLOps', en: 'MLOps' } },
          { t: { ru: 'Специализация: NLP, рекомендации, зрение', en: 'A specialisation: NLP, recommenders, vision' } },
        ],
      },
      {
        id: 'senior',
        t: { ru: 'Сеньор', en: 'Senior' },
        pace: { ru: '5–8 лет', en: '5–8 years' },
        d: { ru: 'Самостоятелен от постановки задачи до продакшена, менторит младших и решает, где ML окупится, а где хватит правила.', en: 'Independent from framing the task to production, mentors juniors and decides where ML pays off and where a rule is enough.' },
        forks: [
          { t: { ru: 'ML-платформа', en: 'ML platform' }, role: 'de' },
          { t: { ru: 'Продуктовые роли', en: 'Product roles' }, role: 'analyst' },
        ],
      },
    ],
    fork: {
      lead: { ru: 'После сеньора лестница раздваивается, и здесь экспертная ветка уходит в исследования:', en: 'After senior the ladder splits, and here the expert branch runs into research:' },
      ic: {
        t: { ru: 'Экспертный путь', en: 'The expert path' },
        d: { ru: 'Глубина в одной области. Ступень требует либо публикаций, либо очень узкой специализации, и на российском рынке существует в нескольких компаниях.', en: 'Depth in one area. The grade needs either publications or a very narrow specialisation, and on the Russian market it exists at a handful of companies.' },
        steps: [
          { t: { ru: 'Staff / Principal DS', en: 'Staff / principal DS' }, d: { ru: 'Направление моделей целиком: архитектура решений, ревью подходов, оценка рисков ML.', en: 'A whole modelling area: solution architecture, reviewing approaches, assessing ML risk.' } },
          { t: { ru: 'Research Scientist', en: 'Research scientist' }, d: { ru: 'Исследования на границе применимого: новые подходы, публикации, длинные проекты без гарантии результата.', en: 'Research at the edge of what works: new approaches, publications, long projects with no guaranteed result.' } },
        ],
      },
      mgmt: {
        t: { ru: 'Управленческий путь', en: 'The management path' },
        d: { ru: 'Команда и приоритеты моделей. Отличие от других треков в том, что решение «здесь модель не нужна» принимают именно на этом уровне.', en: 'The team and model priorities. What differs from other tracks is that the call "no model is needed here" gets made at this level.' },
        steps: [
          { t: { ru: 'ML Lead', en: 'ML lead' }, d: { ru: 'Команда DS: приоритеты моделей, ревью подходов, найм.', en: 'A DS team: model priorities, reviewing approaches, hiring.' } },
          { t: { ru: 'Head of DS / ML', en: 'Head of DS / ML' }, d: { ru: 'ML как функция: инфраструктура, стоимость инференса, отношения с продуктовыми командами.', en: 'ML as a function: infrastructure, inference cost, relations with product teams.' } },
          { t: { ru: 'CDO или Chief AI Officer', en: 'CDO or chief AI officer' }, d: { ru: 'Данные и модели в стратегии компании. Ступень появилась недавно и существует пока у немногих.', en: 'Data and models in company strategy. A recent grade that exists at only a few companies so far.' } },
        ],
      },
    },
    note: {
      ru: 'На входе вакансий Data Scientist заметно меньше, чем вакансий аналитика и ML-инженера: роль сместилась в сторону мидла и сеньора. Планируйте вход через соседнюю роль, а не напрямую.',
      en: 'There are noticeably fewer entry-level data scientist postings than analyst or ML engineer ones: the role has shifted towards mid and senior. Plan your entry through an adjacent role rather than directly.',
    },
  },
}

// План занятий по месяцам. Этапы выше отвечают на вопрос, что должно быть
// закрыто, а план показывает порядок и сроки.
//
// Направления идут последовательно, а не параллельно: браться за статистику,
// не закрыв SQL, значит учить обе вещи вполовину. Одновременно идут только
// три вещи — Git, метрики с доменом и практика на своих данных: они не
// требуют отдельного захода и набираются по ходу.
//
// s и e — месяц начала и конца полосы. k: 'bg' означает фоновое направление,
// которое тянется долго и занимает мало времени в неделю.
// Сроки посчитаны от примерно 8–10 часов занятий в неделю и остаются
// ориентиром: важен порядок направлений, а не конкретный месяц.
export const plans = {
  analyst: {
    months: 14,
    milestones: [
      { at: 4, t: { ru: 'Пять фактов о своём датасете', en: 'Five facts about your own dataset' } },
      { at: 7, t: { ru: 'Дашборд, которым пользуются', en: 'A dashboard people use' } },
      { at: 14, t: { ru: 'Тест доведён до решения', en: 'A test taken through to a decision' } },
    ],
    lanes: [
      {
        t: { ru: 'SQL', en: 'SQL' },
        bars: [
          { s: 0, e: 1.5, t: { ru: 'Выборки, агрегация, JOIN', en: 'Selects, aggregation, joins' } },
          { s: 1.5, e: 2.5, t: { ru: 'CTE и оконные функции', en: 'CTEs and window functions' } },
        ],
      },
      {
        t: { ru: 'Python и pandas', en: 'Python and pandas' },
        bars: [
          { s: 2.5, e: 4, t: { ru: 'Синтаксис, pandas, merge и groupby', en: 'Syntax, pandas, merge and groupby' } },
          { s: 4, e: 5, t: { ru: 'NumPy, matplotlib, seaborn', en: 'NumPy, matplotlib, seaborn' } },
        ],
      },
      {
        t: { ru: 'BI', en: 'BI' },
        bars: [
          { s: 5, e: 6.5, t: { ru: 'Модель данных и первый дашборд', en: 'The data model and a first dashboard' } },
        ],
      },
      {
        t: { ru: 'Базовая статистика', en: 'Core statistics' },
        bars: [
          { s: 6.5, e: 8, t: { ru: 'Центр, разброс, распределения', en: 'Centre, spread, distributions' } },
          { s: 8, e: 9, t: { ru: 'Выборки, интервалы, бутстреп', en: 'Samples, intervals, bootstrap' } },
        ],
      },
      {
        t: { ru: 'A/B-тесты: классика', en: 'A/B testing: the classics' },
        bars: [
          { s: 9, e: 10, t: { ru: 'Проверка гипотез и выбор критерия', en: 'Hypothesis testing and choosing a test' } },
          { s: 10, e: 11, t: { ru: 'Дизайн теста, мощность, выборка', en: 'Test design, power, sample size' } },
        ],
      },
      {
        t: { ru: 'Продвинутая статистика', en: 'Advanced statistics' },
        bars: [
          { s: 11, e: 12.5, t: { ru: 'Регрессия, причинность, ловушки', en: 'Regression, causality, traps' } },
        ],
      },
      {
        t: { ru: 'A/B-тесты: продвинутые', en: 'A/B testing: advanced' },
        bars: [
          { s: 12.5, e: 14, t: { ru: 'CUPED, последовательные тесты, CATE', en: 'CUPED, sequential tests, CATE' } },
        ],
      },
      {
        t: { ru: 'Git', en: 'Git' },
        bars: [
          { s: 2.5, e: 14, k: 'bg', t: { ru: 'Ветки, коммиты, ревью', en: 'Branches, commits, reviews' } },
        ],
      },
      {
        t: { ru: 'Метрики и домен', en: 'Metrics and domain' },
        bars: [
          { s: 0, e: 14, k: 'bg', t: { ru: 'Определения, воронки, юнит-экономика, бизнес-процесс', en: 'Definitions, funnels, unit economics, the business process' } },
        ],
      },
      {
        t: { ru: 'Практика', en: 'Practice' },
        bars: [
          { s: 1.5, e: 14, k: 'bg', t: { ru: 'Свой датасет, разборы, собственный тест', en: 'Your own dataset, analyses, your own test' } },
        ],
      },
    ],
  },

  de: {
    months: 14,
    milestones: [
      { at: 6, t: { ru: 'Загрузка идёт каждый день', en: 'A load that runs every day' } },
      { at: 11, t: { ru: 'Витрина, которой пользуются', en: 'A mart people use' } },
      { at: 14, t: { ru: 'Месяц без ручного вмешательства', en: 'A month with no manual intervention' } },
    ],
    lanes: [
      {
        t: { ru: 'SQL', en: 'SQL' },
        bars: [
          { s: 0, e: 1.5, t: { ru: 'Выборки, агрегация, JOIN', en: 'Selects, aggregation, joins' } },
          { s: 1.5, e: 3, t: { ru: 'Оконные функции, план запроса, индексы', en: 'Window functions, query plans, indexes' } },
        ],
      },
      {
        t: { ru: 'Python', en: 'Python' },
        bars: [
          { s: 3, e: 5, t: { ru: 'Модули, тесты, работа с API', en: 'Modules, tests, working with APIs' } },
        ],
      },
      {
        t: { ru: 'Базы и хранилища', en: 'Databases and warehouses' },
        bars: [
          { s: 5, e: 6.5, t: { ru: 'PostgreSQL, ClickHouse, устройство DWH', en: 'PostgreSQL, ClickHouse, how a DWH works' } },
        ],
      },
      {
        t: { ru: 'ETL и оркестрация', en: 'ETL and orchestration' },
        bars: [
          { s: 6.5, e: 8, t: { ru: 'Загрузки, инкремент, идемпотентность', en: 'Loads, incrementality, idempotency' } },
          { s: 8, e: 9, t: { ru: 'Airflow: DAG, расписание, алерты', en: 'Airflow: DAGs, schedules, alerts' } },
        ],
      },
      {
        t: { ru: 'Форматы и хранение', en: 'Formats and storage' },
        bars: [
          { s: 9, e: 10, t: { ru: 'Parquet, партиционирование', en: 'Parquet, partitioning' } },
        ],
      },
      {
        t: { ru: 'Моделирование данных', en: 'Data modelling' },
        bars: [
          { s: 10, e: 11.5, t: { ru: 'Слои, звезда, SCD', en: 'Layers, star schema, SCD' } },
        ],
      },
      {
        t: { ru: 'dbt и качество', en: 'dbt and quality' },
        bars: [
          { s: 11.5, e: 13, t: { ru: 'Модели, тесты, свежесть, документация', en: 'Models, tests, freshness, documentation' } },
        ],
      },
      {
        t: { ru: 'Kafka и Spark', en: 'Kafka and Spark' },
        bars: [
          { s: 13, e: 14, t: { ru: 'Стриминг и распределённые вычисления', en: 'Streaming and distributed compute' } },
        ],
      },
      {
        t: { ru: 'Linux и Git', en: 'Linux and Git' },
        bars: [
          { s: 0, e: 14, k: 'bg', t: { ru: 'Командная строка, ветки, ревью, Docker', en: 'The shell, branches, reviews, Docker' } },
        ],
      },
      {
        t: { ru: 'Практика', en: 'Practice' },
        bars: [
          { s: 6.5, e: 14, k: 'bg', t: { ru: 'Свой пайплайн на расписании', en: 'Your own pipeline on a schedule' } },
        ],
      },
    ],
  },

  ds: {
    months: 18,
    milestones: [
      { at: 7, t: { ru: 'Математика и Python закрыты', en: 'Maths and Python are closed' } },
      { at: 13, t: { ru: 'Первая честно измеренная модель', en: 'A first honestly measured model' } },
      { at: 18, t: { ru: 'Качество держится на новых данных', en: 'Quality holds on new data' } },
    ],
    lanes: [
      {
        t: { ru: 'Python', en: 'Python' },
        bars: [
          { s: 0, e: 2, t: { ru: 'Синтаксис, структуры, функции', en: 'Syntax, structures, functions' } },
          { s: 2, e: 3.5, t: { ru: 'pandas и numpy', en: 'pandas and numpy' } },
        ],
      },
      {
        t: { ru: 'SQL', en: 'SQL' },
        bars: [
          { s: 3.5, e: 5, t: { ru: 'Выборки, JOIN, оконные функции', en: 'Selects, joins, window functions' } },
        ],
      },
      {
        t: { ru: 'Математика', en: 'Mathematics' },
        bars: [
          { s: 5, e: 7, t: { ru: 'Вероятность, распределения, линейная алгебра', en: 'Probability, distributions, linear algebra' } },
        ],
      },
      {
        t: { ru: 'Статистика', en: 'Statistics' },
        bars: [
          { s: 7, e: 9, t: { ru: 'Оценки, интервалы, проверка гипотез', en: 'Estimates, intervals, hypothesis testing' } },
        ],
      },
      {
        t: { ru: 'Классическое ML', en: 'Classical ML' },
        bars: [
          { s: 9, e: 11, t: { ru: 'Регрессии, деревья, бустинг', en: 'Regressions, trees, boosting' } },
          { s: 11, e: 13, t: { ru: 'Валидация, метрики качества, признаки', en: 'Validation, quality metrics, features' } },
        ],
      },
      {
        t: { ru: 'Глубокое обучение', en: 'Deep learning' },
        bars: [
          { s: 13, e: 15, t: { ru: 'Нейросети и PyTorch', en: 'Neural networks and PyTorch' } },
        ],
      },
      {
        t: { ru: 'Временные ряды', en: 'Time series' },
        bars: [
          { s: 15, e: 16, t: { ru: 'Декомпозиция, ARIMA, бэктест', en: 'Decomposition, ARIMA, backtesting' } },
        ],
      },
      {
        t: { ru: 'MLOps', en: 'MLOps' },
        bars: [
          { s: 16, e: 18, t: { ru: 'Docker, MLflow, сервинг, мониторинг', en: 'Docker, MLflow, serving, monitoring' } },
        ],
      },
      {
        t: { ru: 'Git', en: 'Git' },
        bars: [
          { s: 0, e: 18, k: 'bg', t: { ru: 'Ветки, ревью, структура проекта', en: 'Branches, reviews, project structure' } },
        ],
      },
      {
        t: { ru: 'Практика', en: 'Practice' },
        bars: [
          { s: 5, e: 18, k: 'bg', t: { ru: 'Свой датасет, соревнования, проект целиком', en: 'Your own dataset, competitions, a full project' } },
        ],
      },
    ],
  },
}
