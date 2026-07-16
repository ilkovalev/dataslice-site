// Контент блока про North Star Metric во вкладке «Основы».
// Тексты отдельно от компонента: NorthStar.jsx остаётся тонким.
// Демо-дерево декомпозиции — в двуязычной схеме {ru, en}, как деревья индустрий.

// Три вида NSM по фреймворку Amplitude: attention / transaction / productivity.
export const NSM_TYPES = [
  {
    id: 'attention',
    title: { ru: 'Внимание (attention)', en: 'Attention' },
    metric: { ru: 'Время, проведённое в продукте', en: 'Time spent in the product' },
    desc: {
      ru: 'Ценность продукта — в самом потреблении: пользователь пришёл провести время, и чем больше он его провёл, тем больше получил. Монетизация обычно рекламная, поэтому минуты внимания напрямую конвертируются в инвентарь.',
      en: 'The value is in consumption itself: the user came to spend time, and the more they spend, the more they got. Monetization is usually ad-based, so minutes of attention convert directly into inventory.',
    },
    examples: { ru: 'Netflix — часы просмотра · TikTok и YouTube — Total Watch Time · Spotify — минуты прослушивания', en: 'Netflix — hours streamed · TikTok and YouTube — total watch time · Spotify — listening minutes' },
    when: { ru: 'Ваш продукт такой, если пользователь не решает конкретную задачу, а «проводит время», и вы продаёте это время рекламодателям.', en: 'Your product is this type if the user isn\'t solving a specific task but "spending time", and you sell that time to advertisers.' },
    industries: ['social', 'search', 'streaming'],
  },
  {
    id: 'transaction',
    title: { ru: 'Транзакции (transaction)', en: 'Transaction' },
    metric: { ru: 'Число (или объём) состоявшихся сделок', en: 'The number (or value) of completed transactions' },
    desc: {
      ru: 'Ценность возникает в момент сделки: заказ доставлен, поездка состоялась, ночь забронирована. Считать надо именно завершённые транзакции, а не созданные: в завершённой сошлись спрос, предложение и операционка.',
      en: 'Value appears at the moment of the deal: the order arrived, the ride happened, the night was booked. Count completed transactions, not created ones: a completed one is where demand, supply and operations all met.',
    },
    examples: { ru: 'Airbnb — booked nights · Uber — completed trips · Ozon и Wildberries — GMV · Яндекс Еда — completed orders', en: 'Airbnb — booked nights · Uber — completed trips · Ozon and Wildberries — GMV · DoorDash — completed orders' },
    when: { ru: 'Ваш продукт такой, если вы сводите две стороны или продаёте товар, а деньги приходят с каждой сделки — комиссией или маржой.', en: 'Your product is this type if you match two sides or sell goods, and money arrives with every deal — as commission or margin.' },
    industries: ['marketplace', 'ondemand', 'foodtech', 'ota', 'ecommerce', 'fintech', 'restaurants', 'classifieds'],
  },
  {
    id: 'productivity',
    title: { ru: 'Продуктивность (productivity)', en: 'Productivity' },
    metric: { ru: 'Объём созданной пользователем ценности', en: 'The amount of value the user created' },
    desc: {
      ru: 'Ценность — в результате работы: созданный документ, закрытая сделка, пройденный курс, принятый AI-код. Время здесь не цель, а издержка: хороший продукт помогает сделать работу быстрее, а не задержать пользователя подольше.',
      en: 'Value is in the work done: a document created, a deal closed, a course finished, an AI diff accepted. Time here is a cost, not a goal: a good product helps finish the work faster instead of keeping the user around longer.',
    },
    examples: { ru: 'Slack — сообщения команды · WhatsApp и Telegram — отправленные сообщения · Notion и Figma — созданные документы и файлы · Duolingo — завершённые уроки · Cursor — принятые диффы', en: 'Slack — team messages · WhatsApp and Telegram — messages sent · Notion and Figma — documents and files created · Duolingo — lessons completed · Cursor — accepted diffs' },
    when: { ru: 'Ваш продукт такой, если пользователь приходит с задачей и уходит с результатом, а платят вам за то, что результат получается лучше или быстрее. Мессенджеры — предельный случай: результат (состоявшееся общение) пользователи создают друг для друга сами, а продукту достаточно не мешать.', en: 'Your product is this type if the user arrives with a task and leaves with a result, and you get paid because that result comes out better or faster. Messengers are the extreme case: users create the result (communication that happened) for each other, and the product\'s job is to stay out of the way.' },
    industries: ['saas', 'messengers', 'edtech', 'ai'],
  },
]

export const NS_CONTENT = {
  ru: {
    heading: 'North Star Metric: одна метрика на вершине',
    intro: [
      'North Star Metric — это одна метрика, которая лучше всего отражает ценность, получаемую пользователем от продукта. Она стоит на вершине дерева (уровень L0), и всё остальное — её декомпозиция.',
      'Смысл NSM не в том, чтобы измерять всё одним числом, — это невозможно. Смысл в фокусе: когда у компании двадцать равнозначных приоритетов, у неё нет ни одного. NSM отвечает на вопрос «если мы можем сдвинуть только одну цифру, то какую?».',
      'Важная оговорка: «одна метрика» не значит «единственная метрика». Рядом всегда живут контр-метрики — ограничители, не дающие накрутить главную цифру в ущерб продукту.',
    ],
    typesHeading: 'Три вида North Star',
    typesIntro: 'Классификация Amplitude: тип NSM определяется тем, за что пользователь на самом деле ценит продукт. Выбор вида важнее выбора конкретной формулы — он задаёт форму всего дерева.',
    typeMetric: 'Что измеряет',
    typeExamples: 'Примеры',
    typeWhen: 'Когда это про вас',
    typeIndustries: 'Разобрано в индустриях',
    criteriaHeading: 'Критерии хорошей North Star',
    criteria: [
      { t: 'Отражает ценность для пользователя', d: 'Растёт, когда пользователю стало лучше, а не когда его получилось дожать. Выручка — плохая NSM: она растёт и от повышения цен.' },
      { t: 'Опережает выручку', d: 'Деньги приходят с лагом; NSM должна двигаться раньше и предсказывать их. Если метрика меняется одновременно с выручкой, она бесполезна для управления.' },
      { t: 'Измерима часто', d: 'Ежедневно или еженедельно. Метрика, которая считается раз в квартал, не даёт обратной связи для решений.' },
      { t: 'Команды могут на неё влиять', d: 'Между действием команды и метрикой должна быть видимая цепочка. Иначе это метрика для отчёта, а не для работы.' },
      { t: 'Не vanity-метрика', d: 'Не «всего зарегистрировано»: накопительные счётчики растут всегда, даже когда продукт умирает.' },
      { t: 'Работает с контр-метриками', d: 'У любой NSM есть способ накрутить её во вред продукту. Если для метрики нельзя придумать guardrail — вы просто ещё не подумали.' },
    ],
    ioHeading: 'Input-метрики против output-метрик',
    ioText: [
      'NSM — это output: результат, на который никто не может повлиять напрямую. Нельзя «сделать» completed orders — можно улучшить время доставки, ассортимент и конверсию, а заказы вырастут сами.',
      'Input-метрики — это то, на что команда влияет непосредственно на этой неделе. В дереве метрик они живут на нижних уровнях: L4–L5. Разница практическая — цели ставят по output, а работу планируют по input.',
    ],
    ioInput: { t: 'Input-метрики (L3–L5)', d: 'На что команда влияет напрямую: скорость доставки, качество карточки, время ответа. Двигаются за недели.' },
    ioNsm: { t: 'North Star (L0)', d: 'Результат, в который складываются все input-метрики. Двигается за месяцы.' },
    ioRevenue: { t: 'Выручка и прибыль', d: 'Следуют за NSM с лагом в кварталы. Ставить их целью команде — значит просить влиять на то, что от неё далеко.' },
    treeHeading: 'Декомпозиция North Star до 6 уровня',
    treeIntro: 'Дерево ниже раскладывает GMV маркетплейса от North Star (L0) до операционных рычагов (L5). Кликните на любой узел — откроется карточка метрики с формулой и SQL. Обратите внимание, как меняется природа узлов по мере спуска: сверху — измеримые результаты, снизу — то, что команда делает руками.',
    goodhartHeading: 'Закон Гудхарта: почему одной метрики мало',
    goodhartText: [
      'Как только метрика становится целью, она перестаёт быть хорошей метрикой. Это не теория, а ежедневная практика: поставьте команде поддержки цель по времени ответа — получите быстрые бесполезные ответы; поставьте ленте цель по времени просмотра — получите кликбейт.',
      'Поэтому NSM никогда не живёт одна. Внизу дерева — контр-метрики (guardrails): доля возвратов рядом с выручкой, отмены рядом с заказами, отписки рядом с пушами. Они не растут — они не должны ухудшаться.',
    ],
    goodhartLink: 'Подробнее — в уроке про закон Гудхарта →',
    picksHeading: 'Посмотреть на реальных деревьях',
    picksIntro: 'Каждая индустрия во вкладке «Индустрии» — это NSM одного из трёх видов, разложенная до 6 уровня.',
  },
  en: {
    heading: 'North Star Metric: one metric at the top',
    intro: [
      'A North Star Metric is the single metric that best captures the value users get from the product. It sits at the top of the tree (level L0), and everything else is its decomposition.',
      'The point of an NSM isn\'t to measure everything with one number — that\'s impossible. The point is focus: a company with twenty equal priorities has none. The NSM answers "if we could move only one number, which one?".',
      'One caveat: "one metric" doesn\'t mean "the only metric". Counter-metrics always live next to it — guardrails that stop you from gaming the headline number at the product\'s expense.',
    ],
    typesHeading: 'Three types of North Star',
    typesIntro: 'Amplitude\'s classification: the NSM type follows from what users actually value the product for. Picking the type matters more than picking the formula — it shapes the entire tree.',
    typeMetric: 'What it measures',
    typeExamples: 'Examples',
    typeWhen: 'When this is you',
    typeIndustries: 'Covered in industries',
    criteriaHeading: 'What makes a North Star good',
    criteria: [
      { t: 'It reflects user value', d: 'It grows when the user is better off, not when you squeezed them harder. Revenue is a poor NSM: it also grows from raising prices.' },
      { t: 'It leads revenue', d: 'Money arrives with a lag; the NSM should move earlier and predict it. A metric that moves in lockstep with revenue is useless for steering.' },
      { t: 'It\'s measured often', d: 'Daily or weekly. A metric computed once a quarter gives no feedback for decisions.' },
      { t: 'Teams can move it', d: 'There must be a visible chain from a team\'s action to the metric. Otherwise it\'s a metric for the report, not for the work.' },
      { t: 'It\'s not a vanity metric', d: 'Not "total registrations": cumulative counters always go up, even as the product dies.' },
      { t: 'It works with counter-metrics', d: 'Every NSM can be gamed against the product. If you can\'t think of a guardrail for it, you just haven\'t thought hard enough.' },
    ],
    ioHeading: 'Input metrics vs output metrics',
    ioText: [
      'An NSM is an output: a result nobody can touch directly. You can\'t "do" completed orders — you can improve delivery time, selection and conversion, and orders grow on their own.',
      'Input metrics are what a team moves directly this week. In a metric tree they live at the bottom: L4–L5. The distinction is practical — you set goals on outputs and plan work on inputs.',
    ],
    ioInput: { t: 'Input metrics (L3–L5)', d: 'What the team moves directly: delivery speed, page quality, response time. They shift within weeks.' },
    ioNsm: { t: 'North Star (L0)', d: 'The result all input metrics add up to. It shifts over months.' },
    ioRevenue: { t: 'Revenue and profit', d: 'They follow the NSM with a lag of quarters. Handing them to a team as a goal means asking them to move something far away from their hands.' },
    treeHeading: 'Decomposing a North Star down to level 6',
    treeIntro: 'The tree below breaks a marketplace\'s GMV down from the North Star (L0) to operational levers (L5). Click any node to open its metric card with a formula and SQL. Notice how the nature of the nodes changes on the way down: measurable results at the top, things teams do with their hands at the bottom.',
    goodhartHeading: 'Goodhart\'s law: why one metric is never enough',
    goodhartText: [
      'When a measure becomes a target, it ceases to be a good measure. That\'s not theory but daily practice: give support a response-time goal and you get fast useless replies; give the feed a watch-time goal and you get clickbait.',
      'So an NSM never lives alone. At the bottom of the tree sit counter-metrics (guardrails): return rate next to revenue, cancellations next to orders, opt-outs next to pushes. They\'re not meant to grow — they\'re meant not to get worse.',
    ],
    goodhartLink: 'More in the lesson on Goodhart\'s law →',
    picksHeading: 'See it on real trees',
    picksIntro: 'Every industry in the "Industries" tab is an NSM of one of the three types, decomposed down to level 6.',
  },
}

// Демо-дерево: GMV маркетплейса, уровни 0–5.
// Узлы с metricId открывают карточки из общего справочника.
export const NS_DEMO_TREE = {
  root: {
    id: 'ns-gmv', level: 0, metricId: 'gmv',
    title: { ru: 'GMV — North Star', en: 'GMV — North Star' },
    formula: { ru: 'Покупатели × Частота × Чек', en: 'Buyers × Frequency × Basket' },
    note: { ru: 'Транзакционная NSM: оборот состоявшихся сделок. Раскладывается на три множителя, которыми занимаются разные команды.', en: 'A transactional NSM: the value of completed deals. It splits into three factors owned by different teams.' },
    children: [
      {
        id: 'ns-buyers', level: 1, metricId: 'dau-mau',
        title: { ru: 'Активные покупатели', en: 'Active buyers' },
        note: { ru: 'Первый множитель: сколько людей вообще покупает за период.', en: 'The first factor: how many people buy at all in a period.' },
        children: [
          {
            id: 'ns-new', level: 2, metricId: 'cac',
            title: { ru: 'Новые покупатели', en: 'New buyers' },
            note: { ru: 'Приток: платные и органические каналы.', en: 'Inflow: paid and organic channels.' },
            children: [
              {
                id: 'ns-cr', level: 3, metricId: 'conversion-rate',
                title: { ru: 'Конверсия в первый заказ', en: 'First-order conversion' },
                note: { ru: 'Визит → заказ: превращение трафика в покупателей.', en: 'Visit → order: turning traffic into buyers.' },
                children: [
                  {
                    id: 'ns-funnel', level: 4, metricId: 'funnel-dropoff',
                    title: { ru: 'Воронка чекаута', en: 'Checkout funnel' },
                    note: { ru: 'Где теряем: корзина → доставка → оплата.', en: 'Where we leak: cart → shipping → payment.' },
                    children: [
                      {
                        id: 'ns-checkout-ux', level: 5, kind: 'lever',
                        title: { ru: 'Шаги оформления', en: 'Checkout steps' },
                        note: { ru: 'Input-метрика: число полей и шагов — то, что команда меняет на этой неделе.', en: 'An input metric: the number of fields and steps — what the team changes this week.' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'ns-retained', level: 2, metricId: 'repeat-rate',
            title: { ru: 'Вернувшиеся покупатели', en: 'Returning buyers' },
            note: { ru: 'Удержание: покупатель без CAC — самый прибыльный покупатель.', en: 'Retention: a buyer with no CAC is the most profitable buyer.' },
            children: [
              {
                id: 'ns-cohort', level: 3, metricId: 'retention-n-day',
                title: { ru: 'Когортное удержание', en: 'Cohort retention' },
                note: { ru: 'Кривая возвратов по когортам: вышла ли на плато.', en: 'The cohort return curve: did it reach a plateau.' },
                children: [
                  {
                    id: 'ns-crm', level: 4, kind: 'lever',
                    title: { ru: 'CRM-коммуникации', en: 'CRM communications' },
                    note: { ru: 'Рычаг: цепочки писем и пушей по жизненному циклу.', en: 'Lever: lifecycle email and push flows.' },
                    children: [
                      {
                        id: 'ns-segments', level: 5, kind: 'lever',
                        title: { ru: 'Сегментация базы', en: 'Base segmentation' },
                        note: { ru: 'Input-метрика: точность сегментов вместо рассылки по всем.', en: 'An input metric: segment precision instead of blasting everyone.' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'ns-freq', level: 1, metricId: 'purchase-frequency',
        title: { ru: 'Частота заказов', en: 'Order frequency' },
        note: { ru: 'Второй множитель: сколько раз покупает один покупатель.', en: 'The second factor: how many times one buyer buys.' },
        children: [
          {
            id: 'ns-liquidity', level: 2, metricId: 'liquidity',
            title: { ru: 'Ликвидность', en: 'Liquidity' },
            note: { ru: 'Нашёл ли покупатель то, что искал, — иначе следующего заказа не будет.', en: 'Did the buyer find what they came for — otherwise there is no next order.' },
            children: [
              {
                id: 'ns-supply', level: 3, metricId: 'active-listings',
                title: { ru: 'Активное предложение', en: 'Active supply' },
                note: { ru: 'Товар, доступный к сделке прямо сейчас.', en: 'Inventory available for a deal right now.' },
                children: [
                  {
                    id: 'ns-oos', level: 4, metricId: 'oos-rate',
                    title: { ru: 'Доступность (OOS)', en: 'Availability (OOS)' },
                    note: { ru: 'Спрос, упирающийся в отсутствие товара.', en: 'Demand hitting empty stock.' },
                    children: [
                      {
                        id: 'ns-seller-tools', level: 5, kind: 'lever',
                        title: { ru: 'Инструменты селлера', en: 'Seller tools' },
                        note: { ru: 'Input-метрика: прогноз спроса и автопополнение у продавцов.', en: 'An input metric: demand forecasting and auto-replenishment for sellers.' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'ns-aov', level: 1, metricId: 'aov',
        title: { ru: 'Средний чек', en: 'Average order' },
        note: { ru: 'Третий множитель: сколько денег в одном заказе.', en: 'The third factor: how much money one order carries.' },
        children: [
          {
            id: 'ns-mix', level: 2,
            title: { ru: 'Состав корзины', en: 'Basket mix' },
            formula: { ru: 'позиций × цена позиции', en: 'items × item price' },
            note: { ru: 'Два рычага чека с разной механикой.', en: 'Two basket levers with different mechanics.' },
            children: [
              {
                id: 'ns-reco', level: 3, kind: 'lever',
                title: { ru: 'Рекомендации', en: 'Recommendations' },
                note: { ru: 'Рычаг: «с этим покупают» на карточке и в корзине.', en: 'Lever: "bought together" on the page and in the cart.' },
                children: [
                  {
                    id: 'ns-reco-ctr', level: 4, metricId: 'ctr',
                    title: { ru: 'CTR рекомендаций', en: 'Reco CTR' },
                    note: { ru: 'Кликают ли по предложенному.', en: 'Do recommendations get clicked.' },
                    children: [
                      {
                        id: 'ns-reco-model', level: 5, kind: 'lever',
                        title: { ru: 'Модель рекомендаций', en: 'Reco model' },
                        note: { ru: 'Input-метрика: качество модели — то, над чем ML-команда работает спринтами.', en: 'An input metric: model quality — what the ML team works on sprint by sprint.' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  counterMetrics: [
    { title: { ru: 'Доля возвратов', en: 'Return rate' }, note: { ru: 'GMV с возвратами — фиктивный оборот', en: 'GMV that returns is fictitious flow' } },
    { title: { ru: 'Маржа промо', en: 'Promo margin' }, note: { ru: 'рост оборота на субсидиях в убыток', en: 'subsidy-driven flow growth at a loss' } },
    { title: { ru: 'Отток селлеров', en: 'Seller churn' }, note: { ru: 'высокая комиссия выдавливает предложение', en: 'high commission squeezes supply out' } },
  ],
}
