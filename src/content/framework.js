// Контент вкладки «Основы»: тексты, фреймворки, глоссарий метрик и
// конструктор архетипов. Двуязычная схема {ru, en} — как у деревьев и каталога.

// Пример дерева метрик (Profit Tree) для иллюстрации отличия дерева от пирамиды.
export const PROFIT_TREE = {
  root: {
    id: 'profit', level: 0,
    title: { ru: 'Прибыль', en: 'Profit' },
    formula: { ru: 'Доход − Расход', en: 'Revenue − Costs' },
    note: {
      ru: 'Вершина финансового дерева. Ниже — два слагаемых, и каждое раскладывается дальше на рычаги, которыми занимаются разные команды.',
      en: 'The top of the financial tree. Below are two terms, and each breaks down further into levers owned by different teams.',
    },
    children: [
      {
        id: 'revenue', level: 1, metricId: 'revenue',
        title: { ru: 'Доход', en: 'Revenue' },
        note: {
          ru: 'Первое слагаемое: сколько денег пришло. Раскладывается на число заказов и средний чек.',
          en: 'The first term: how much money came in. It breaks into order count and average order value.',
        },
        children: [
          {
            id: 'orders', level: 2,
            title: { ru: 'Кол-во заказов', en: 'Order count' },
            note: {
              ru: 'Сколько сделок совершено за период — множитель, за который отвечают маркетинг и продукт.',
              en: 'How many deals happened in the period — the factor marketing and product own.',
            },
          },
          {
            id: 'check', level: 2, metricId: 'aov',
            title: { ru: 'Средний чек', en: 'Average order' },
            note: {
              ru: 'Сколько денег в одном заказе — второй множитель дохода.',
              en: 'How much money one order carries — revenue\'s second factor.',
            },
          },
        ],
      },
      {
        id: 'cost', level: 1,
        title: { ru: 'Расход', en: 'Costs' },
        note: {
          ru: 'Второе слагаемое: сколько денег ушло. В реальном дереве раскладывается на постоянные и переменные затраты.',
          en: 'The second term: how much money went out. In a real tree it breaks into fixed and variable costs.',
        },
        children: [
          {
            id: 'fot', level: 2,
            title: { ru: 'ФОТ', en: 'Payroll' },
            note: {
              ru: 'Фонд оплаты труда — обычно самая крупная и самая постоянная статья расходов.',
              en: 'Payroll — usually the largest and most fixed cost line.',
            },
          },
          {
            id: 'mkt', level: 2, metricId: 'cac',
            title: { ru: 'Маркетинг', en: 'Marketing' },
            note: {
              ru: 'Расходы на привлечение: единственная статья, которую можно сократить за день — вместе с будущим доходом.',
              en: 'Acquisition spend: the one line you can cut in a day — along with future revenue.',
            },
          },
        ],
      },
    ],
  },
}

export const PYRAMID_BANDS = [
  { w: '46%', label: { ru: 'Бизнесовые', en: 'Business' }, items: { ru: 'выручка, рост базы — для руководства', en: 'revenue, base growth — for leadership' } },
  { w: '64%', label: { ru: 'Продуктовые', en: 'Product' }, items: { ru: 'конверсия, средний чек, retention', en: 'conversion, average order, retention' } },
  { w: '82%', label: { ru: 'Интерфейсные', en: 'Interface' }, items: { ru: 'CES, CSI, успешность задач', en: 'CES, CSI, task success' } },
  { w: '100%', label: { ru: 'Платформенные', en: 'Platform' }, items: { ru: 'время отклика, сбои, нагрузка', en: 'response time, errors, load' } },
]

export const FRAMEWORKS = [
  {
    name: 'AARRR (Pirate Metrics)',
    items: {
      ru: 'Acquisition (привлечение) → Activation (активация) → Retention (удержание) → Referral (рекомендации) → Revenue (доход)',
      en: 'Acquisition → Activation → Retention → Referral → Revenue',
    },
    use: {
      ru: 'Воронка жизненного цикла пользователя. Удобно для продуктов и стартапов: где теряем людей на пути к ценности и деньгам.',
      en: 'The user lifecycle funnel. Handy for products and startups: where people leak out on the way to value and money.',
    },
  },
  {
    name: 'HEART (Google)',
    items: {
      ru: 'Happiness (удовлетворённость) · Engagement (вовлечённость) · Adoption (освоение) · Retention (удержание) · Task success (успешность задач)',
      en: 'Happiness · Engagement · Adoption · Retention · Task success',
    },
    use: {
      ru: 'Для оценки качества и UX продукта: каждой букве — своя цель-сигнал и метрика.',
      en: 'For product quality and UX: each letter gets its own goal, signal and metric.',
    },
  },
  {
    name: 'Profit Tree',
    items: {
      ru: 'Прибыль = Доход − Расход → дальше раскладываем каждую ветку на рычаги',
      en: 'Profit = Revenue − Costs → then break each branch into levers',
    },
    use: {
      ru: 'Финансовое дерево для юнит-экономики: показывает, какой рычаг как влияет на прибыль.',
      en: 'The financial tree for unit economics: it shows which lever moves profit and how.',
    },
  },
]

// Глоссарий метрик по типам — с формулами. Чтобы было видно «какие вообще бывают».
export const GLOSSARY = [
  {
    group: { ru: 'Привлечение (Acquisition)', en: 'Acquisition' },
    items: [
      { m: 'CAC', f: { ru: 'расходы на маркетинг / число привлечённых', en: 'marketing spend / new customers' }, d: { ru: 'стоимость привлечения одного клиента.', en: 'the cost of acquiring one customer.' } },
      { m: { ru: 'Конверсия', en: 'Conversion' }, f: { ru: 'целевые действия / визиты', en: 'target actions / visits' }, d: { ru: 'доля посетителей, дошедших до нужного шага.', en: 'the share of visitors who reach the target step.' } },
      { m: 'CTR', f: { ru: 'клики / показы', en: 'clicks / impressions' }, d: { ru: 'кликабельность объявления или элемента.', en: 'the click rate of an ad or element.' } },
      { m: { ru: 'ДРР / ROMI', en: 'ROAS / ROMI' }, f: { ru: 'выручка от рекламы / расходы на неё', en: 'ad revenue / ad spend' }, d: { ru: 'отдача рекламных вложений.', en: 'the return on advertising spend.' } },
    ],
  },
  {
    group: { ru: 'Вовлечённость (Engagement)', en: 'Engagement' },
    items: [
      { m: 'DAU / MAU', f: { ru: 'уникальные за день / за месяц', en: 'daily / monthly uniques' }, d: { ru: 'активная аудитория; их отношение — «липкость» (stickiness).', en: 'the active audience; their ratio is stickiness.' } },
      { m: { ru: 'Частота', en: 'Frequency' }, f: { ru: 'сессии / пользователя', en: 'sessions / user' }, d: { ru: 'как часто человек возвращается.', en: 'how often a person comes back.' } },
      { m: { ru: 'Глубина', en: 'Depth' }, f: { ru: 'действия (или минуты) / сессию', en: 'actions (or minutes) / session' }, d: { ru: 'насколько плотно используют продукт за заход.', en: 'how intensely the product is used per visit.' } },
    ],
  },
  {
    group: { ru: 'Удержание (Retention)', en: 'Retention' },
    items: [
      { m: { ru: 'Retention N-дня', en: 'Day-N retention' }, f: { ru: 'вернувшиеся на день N / когорта', en: 'returned on day N / cohort' }, d: { ru: 'доля, оставшаяся через 1/7/30 дней.', en: 'the share still around after 1/7/30 days.' } },
      { m: 'Churn', f: { ru: 'ушедшие за период / база на старте', en: 'lost in period / base at start' }, d: { ru: 'отток; обратная сторона удержания.', en: 'churn; the flip side of retention.' } },
      { m: 'NRR', f: { ru: 'выручка когорты сейчас / год назад', en: 'cohort revenue now / a year ago' }, d: { ru: 'чистое удержание выручки с учётом роста и оттока.', en: 'net revenue retention, counting expansion and churn.' } },
    ],
  },
  {
    group: { ru: 'Монетизация (Monetization)', en: 'Monetization' },
    items: [
      { m: 'ARPU / ARPPU', f: { ru: 'выручка / все (или платящие) польз.', en: 'revenue / all (or paying) users' }, d: { ru: 'средний доход с пользователя или с платящего.', en: 'average revenue per user or per paying user.' } },
      { m: 'LTV', f: { ru: 'ARPU × средний срок жизни', en: 'ARPU × average lifetime' }, d: { ru: 'сколько денег приносит клиент за всё время.', en: 'how much a customer brings over their lifetime.' } },
      { m: 'LTV / CAC', f: { ru: 'LTV ÷ CAC', en: 'LTV ÷ CAC' }, d: { ru: 'окупаемость привлечения; здорово при > 3.', en: 'acquisition payback; healthy above 3.' } },
      { m: { ru: 'GMV / Оборот', en: 'GMV' }, f: { ru: 'сумма всех сделок', en: 'the value of all deals' }, d: { ru: 'валовой объём для маркетплейсов и платформ.', en: 'gross volume for marketplaces and platforms.' } },
    ],
  },
  {
    group: { ru: 'Качество и контр-метрики', en: 'Quality & counter-metrics' },
    items: [
      { m: 'NPS / CSAT', f: { ru: 'опросные индексы', en: 'survey indices' }, d: { ru: 'готовность рекомендовать / удовлетворённость.', en: 'willingness to recommend / satisfaction.' } },
      { m: { ru: 'Доля жалоб / возвратов', en: 'Complaint / return rate' }, f: { ru: 'жалобы (возвраты) / действия', en: 'complaints (returns) / actions' }, d: { ru: 'guardrail качества: ловит накрутку основной метрики.', en: 'a quality guardrail: it catches gaming of the headline metric.' } },
      { m: { ru: 'p95 / p99 латентности', en: 'p95 / p99 latency' }, f: { ru: 'перцентили времени ответа', en: 'response-time percentiles' }, d: { ru: 'насколько плохо самым невезучим — техническая надёжность.', en: 'how bad it is for the unluckiest — technical reliability.' } },
    ],
  },
]

export const SHAPES = [
  {
    archetype: { ru: 'Экономика внимания', en: 'Attention economy' },
    q: { ru: 'Показывает рекламу (продаёт внимание)', en: 'Shows ads (sells attention)' },
    northStar: { ru: 'Время/внимание × монетизация рекламой', en: 'Time/attention × ad monetization' },
    drivers: { ru: ['Охват', 'Частота', 'Глубина'], en: ['Reach', 'Frequency', 'Depth'] },
    counters: { ru: ['качество контента', 'долгосрочное удержание'], en: ['content quality', 'long-term retention'] },
  },
  {
    archetype: { ru: 'Коммуникационные сети', en: 'Communication networks' },
    q: { ru: 'Соединяет людей друг с другом', en: 'Connects people to each other' },
    northStar: { ru: 'Состоявшееся общение (сообщения, связанные пары)', en: 'Communication that happened (messages, connected pairs)' },
    drivers: { ru: ['Размер сети', 'Плотность связей', 'Частота общения'], en: ['Network size', 'Tie density', 'Communication frequency'] },
    counters: { ru: ['спам', 'приватность', 'монетизация переписки'], en: ['spam', 'privacy', 'monetizing private chats'] },
  },
  {
    archetype: { ru: 'Подписки', en: 'Subscriptions' },
    q: { ru: 'Регулярная плата за доступ', en: 'A recurring fee for access' },
    northStar: { ru: 'Удерживаемая платящая база', en: 'Retained paying base' },
    drivers: { ru: ['Привлечение', 'Удержание / Churn', 'ARPU'], en: ['Acquisition', 'Retention / churn', 'ARPU'] },
    counters: { ru: ['вынужденный отток', 'LTV / CAC'], en: ['involuntary churn', 'LTV / CAC'] },
  },
  {
    archetype: { ru: 'Транзакционные платформы', en: 'Transactional platforms' },
    q: { ru: 'Комиссия со сделок между сторонами', en: 'A commission on deals between sides' },
    northStar: { ru: 'Оборот / число сделок (GMV)', en: 'Volume / number of deals (GMV)' },
    drivers: { ru: ['Спрос', 'Предложение', 'Ликвидность'], en: ['Demand', 'Supply', 'Liquidity'] },
    counters: { ru: ['take rate', 'отток сторон', 'отмены'], en: ['take rate', 'side churn', 'cancellations'] },
  },
  {
    archetype: { ru: 'Прямая коммерция', en: 'Direct commerce' },
    q: { ru: 'Своя маржа с продажи товара', en: 'Your own margin on selling goods' },
    northStar: { ru: 'Выручка', en: 'Revenue' },
    drivers: { ru: ['Трафик', 'Конверсия', 'Чек', 'Повторные'], en: ['Traffic', 'Conversion', 'Basket', 'Repeats'] },
    counters: { ru: ['возвраты / маржа', 'CAC / LTV'], en: ['returns / margin', 'CAC / LTV'] },
  },
  {
    archetype: { ru: 'Сети физических точек', en: 'Physical location chains' },
    q: { ru: 'Сеть точек (рестораны, ритейл)', en: 'A chain of locations (restaurants, retail)' },
    northStar: { ru: 'Точки × Выручка с точки', en: 'Locations × Sales per location' },
    drivers: { ru: ['Экспансия', 'Same-store', 'Операционка'], en: ['Expansion', 'Same-store', 'Operations'] },
    counters: { ru: ['каннибализация', 'юнит-экономика'], en: ['cannibalization', 'unit economics'] },
  },
  {
    archetype: { ru: 'Финтех', en: 'Fintech' },
    q: { ru: 'Проценты и комиссии с денег', en: 'Interest and fees on money' },
    northStar: { ru: 'TPV / активные платящие', en: 'TPV / active payers' },
    drivers: { ru: ['База', 'Частота', 'Средний чек'], en: ['Base', 'Frequency', 'Average ticket'] },
    counters: { ru: ['дефолты', 'фрод'], en: ['defaults', 'fraud'] },
  },
  {
    archetype: { ru: 'Виртуальная экономика', en: 'Virtual economy' },
    q: { ru: 'Внутриигровые покупки', en: 'In-game purchases' },
    northStar: { ru: 'Платежи игроков', en: 'Player payments' },
    drivers: { ru: ['DAU', 'Конверсия в платящих', 'ARPPU'], en: ['DAU', 'Payer conversion', 'ARPPU'] },
    counters: { ru: ['pay-to-win', 'инфляция'], en: ['pay-to-win', 'inflation'] },
  },
  {
    archetype: { ru: 'AI / LLM-продукты', en: 'AI / LLM products' },
    q: { ru: 'Оплата за использование AI', en: 'Paying for AI usage' },
    northStar: { ru: 'Выручка (токены + подписки)', en: 'Revenue (tokens + subscriptions)' },
    drivers: { ru: ['Usage', 'Подписки', 'Маржа на запрос'], en: ['Usage', 'Subscriptions', 'Margin per request'] },
    counters: { ru: ['cost-per-user', 'сжатие маржи'], en: ['cost per user', 'margin compression'] },
  },
]

export const FW_CONTENT = {
  ru: {
    introHeading: 'Что такое метрика и зачем иерархия',
    intro: [
      'Метрика — это число, измеряющее состояние продукта или бизнеса: выручка, конверсия, удержание, время ответа. Сама по себе одна цифра мало что значит — важно, как метрики связаны между собой и какая из них главная.',
      'Поэтому метрики выстраивают в иерархию. На вершине — одна North Star, лучше всего отражающая ценность продукта. Под ней — драйверы, из которых она складывается, и операционные рычаги, на которые команда влияет напрямую. А в фундаменте — контр-метрики, не дающие «накрутить» главную в ущерб качеству (привет закону Гудхарта).',
      'Раскладывают метрики двумя разными способами — деревом и пирамидой. Это не одно и то же, и ниже видно, чем они отличаются.',
    ],
    anatomyHeading: 'Анатомия иерархии',
    anatomyNsm: { t: 'North Star · L0', d: 'одна метрика, лучше всего отражающая ключевую ценность продукта' },
    anatomyDrivers: { t: 'Драйверы и рычаги · L1–L5', d: 'из чего складывается North Star и на что команда влияет напрямую' },
    anatomyCounters: { t: 'Контр-метрики · guardrails', d: 'ограничители качества против «накрутки» главной метрики' },
    vsHeading: 'Дерево против иерархии метрик',
    vsTree: 'раскладывает одну метрику на множители и слагаемые (Прибыль = Доход − Расход). Идём по причинно-следственным рычагам — какую «шестерёнку» подкрутить.',
    vsTreeName: 'Дерево',
    vsPyramid: 'группирует метрики по уровню абстракции и аудитории. Не «из чего складывается», а «кому и о чём» — чтобы согласовать метрики между уровнями команды.',
    vsPyramidName: 'Иерархия (пирамида)',
    fwHeading: 'Готовые фреймворки',
    shapesHeading: 'Собрать дерево под незнакомый продукт',
    shapesIntro: 'Определите архетип по способу монетизации — и форма дерева готова.',
    shapesArchetype: 'Архетип',
    shapesDrivers: 'Драйверы (L1)',
    shapesCounters: 'Контр-метрики',
    glossaryHeading: 'Глоссарий метрик по типам',
    glossaryIntro: 'Базовый словарь: какие метрики вообще бывают и как считаются. Сгруппированы по этапу жизненного цикла — привлечение → вовлечённость → удержание → доход, — той же логике, что и в рамке AARRR (Acquisition → Activation → Retention → Referral → Revenue).',
  },
  en: {
    introHeading: 'What a metric is and why hierarchies exist',
    intro: [
      'A metric is a number measuring the state of a product or business: revenue, conversion, retention, response time. One number on its own means little — what matters is how metrics connect and which one leads.',
      'That\'s why metrics are arranged into a hierarchy. At the top sits a single North Star that best reflects the product\'s value. Below it are the drivers it\'s made of and the operational levers teams move directly. At the foundation are counter-metrics that stop anyone from gaming the headline number at quality\'s expense (hello, Goodhart\'s law).',
      'Metrics get laid out in two different ways — as a tree and as a pyramid. They are not the same thing, and the difference is visible below.',
    ],
    anatomyHeading: 'Anatomy of a hierarchy',
    anatomyNsm: { t: 'North Star · L0', d: 'the single metric that best reflects the product\'s core value' },
    anatomyDrivers: { t: 'Drivers and levers · L1–L5', d: 'what the North Star is made of and what teams move directly' },
    anatomyCounters: { t: 'Counter-metrics · guardrails', d: 'quality limits against gaming the headline metric' },
    vsHeading: 'Tree versus metric hierarchy',
    vsTree: 'breaks one metric into factors and terms (Profit = Revenue − Costs). You follow cause-and-effect levers — which gear to turn.',
    vsTreeName: 'A tree',
    vsPyramid: 'groups metrics by abstraction level and audience. Not "what it\'s made of" but "who cares about what" — to align metrics across team levels.',
    vsPyramidName: 'A hierarchy (pyramid)',
    fwHeading: 'Ready-made frameworks',
    shapesHeading: 'Building a tree for an unfamiliar product',
    shapesIntro: 'Identify the archetype by how the product makes money — and the tree\'s shape follows.',
    shapesArchetype: 'Archetype',
    shapesDrivers: 'Drivers (L1)',
    shapesCounters: 'Counter-metrics',
    glossaryHeading: 'A glossary of metrics by type',
    glossaryIntro: 'The basic vocabulary: which metrics exist and how they\'re computed. Grouped by lifecycle stage — acquisition → engagement → retention → revenue — the same logic as the AARRR frame (Acquisition → Activation → Retention → Referral → Revenue).',
  },
}
