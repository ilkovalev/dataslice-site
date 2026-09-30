// Подводные камни для терминов глоссария, у которых нет карточки в каталоге
// метрик. У остальных камни берутся из каталога при сборке (vite.config.js,
// __GLOSSARY_METRICS__) — чтобы глоссарий и карточка не расходились.
// Ключ — id термина в glossary.js / glossary-en.js.
export const glossaryPitfalls = {
  'north-star': {
    ru: [
      'Метрика, которую команда не может сдвинуть своими действиями, не работает как North Star: её видят в отчётах, но решений по ней не принимают.',
      'Выручка в роли North Star тянет к краткосрочным решениям: скидкам и навязчивым продажам, которые потом съедают удержание.',
      'Без контр-метрик North Star накручивают: рост числа заказов можно купить отменами и возвратами.',
    ],
    en: [
      'A metric the team cannot move with its own actions does not work as a North Star: people see it in reports but make no decisions on it.',
      'Revenue as a North Star pulls toward short-term moves: discounts and pushy sales that later eat into retention.',
      'Without guardrails a North Star gets gamed: growth in orders can be bought with cancellations and returns.',
    ],
  },
  guardrails: {
    ru: [
      'Контр-метрики фиксируют до запуска эксперимента. Выбранные после результата, они подгоняются под нужный вывод.',
      'Чем больше контр-метрик, тем вероятнее, что одна из них ухудшится случайно: это та же проблема множественных сравнений.',
      'Допустимый порог ухудшения задают заранее, иначе любое движение контр-метрики превращается в спор.',
    ],
    en: [
      'Guardrails are fixed before the experiment starts. Picked after the result, they get fitted to the desired conclusion.',
      'The more guardrails, the likelier one of them worsens by chance: it is the same multiple comparisons problem.',
      'The acceptable degradation threshold is set in advance, otherwise any movement of a guardrail turns into an argument.',
    ],
  },
  cpm: {
    ru: [
      'CPM разных площадок и форматов сравнивают осторожно: тысяча показов в ленте и тысяча показов в поиске получают разное внимание.',
      'Низкий CPM часто означает широкую нецелевую аудиторию: дешёвые показы превращаются в дорогие клики и заказы.',
      'Часть оплаченных показов пользователь не видел: баннер внизу страницы засчитан, но до него не долистали. Рядом смотрят долю видимых показов.',
    ],
    en: [
      'Compare CPM across platforms and formats with care: a thousand feed impressions and a thousand search impressions get different attention.',
      'A low CPM often means a broad, off-target audience: cheap impressions turn into expensive clicks and orders.',
      'Some paid impressions were never seen: a banner at the bottom of the page counts even if nobody scrolled to it. Check viewability alongside.',
    ],
  },
  cpi: {
    ru: [
      'Установка ещё не пользователь: каналы сравнивают по стоимости активированного или платящего пользователя, а не по CPI.',
      'Мотивированный трафик, где за установку дают бонус, даёт низкий CPI и почти нулевое удержание.',
      'CPI зависит от атрибуции: органические установки, приписанные рекламе, занижают его.',
    ],
    en: [
      'An install is not yet a user: channels are compared by the cost of an activated or paying user, not by CPI.',
      'Incentivized traffic, where installs earn a bonus, gives a low CPI and near-zero retention.',
      'CPI depends on attribution: organic installs credited to ads make it look lower.',
    ],
  },
  tac: {
    ru: [
      'TAC смотрят долей от рекламной выручки: рост в абсолютных деньгах при растущей выручке нормален.',
      'Часть TAC — долгосрочные договоры с фиксированными платежами, поэтому в коротком окне доля скачет без изменений в бизнесе.',
      'Резкое сокращение TAC может обрушить трафик: за партнёрскими платежами стоят места по умолчанию, которые заберёт конкурент.',
    ],
    en: [
      'TAC is read as a share of ad revenue: growth in absolute money is normal while revenue grows.',
      'Part of TAC is long-term contracts with fixed payments, so over a short window the share jumps with no change in the business.',
      'Cutting TAC sharply can crash traffic: partner payments buy default placements that a competitor will take.',
    ],
  },
  'look-to-book': {
    ru: [
      'Один человек делает много поисков: в знаменателе сессии, а не люди, и рост повторных поисков роняет метрику без ухудшения продукта.',
      'Боты и агрегаторы, опрашивающие цены, раздувают число поисков, их отфильтровывают до расчёта.',
      'Направления и сезоны напрямую не сравнивают: отели в сезон и авиабилеты на праздники бронируют по-разному.',
    ],
    en: [
      'One person runs many searches: the denominator counts sessions, not people, and more repeat searches lower the metric without the product getting worse.',
      'Bots and aggregators polling prices inflate the search count and are filtered out before the calculation.',
      'Destinations and seasons are not compared directly: hotels in high season and flights for holidays are booked differently.',
    ],
  },
  rpm: {
    ru: [
      'RPM считает все просмотры, включая просмотры без рекламы, поэтому он ниже CPM, который платит рекламодатель.',
      'RPM сильно зависит от страны и тематики аудитории: одинаковое число просмотров в разных регионах приносит разный доход.',
      'Сезонность рекламных бюджетов, с пиком в конце года и провалом в январе, двигает RPM без изменений в контенте.',
    ],
    en: [
      'RPM counts all views, including those without ads, so it is lower than the CPM the advertiser pays.',
      'RPM depends heavily on the audience\'s country and topic: the same number of views in different regions earns different money.',
      'Seasonal ad budgets, peaking at year end and dipping in January, move RPM with no change in the content.',
    ],
  },
  arr: {
    ru: [
      'ARR описывает текущий темп, а не заработанные деньги: в отчётности выручка признаётся по мере оказания услуги.',
      'Разовые платежи и оплату внедрения в ARR не включают, иначе он завышает регулярную базу.',
      'Контракты с ростом цены по годам считают по цене текущего года, а не по средней за весь срок.',
    ],
    en: [
      'ARR describes the current run rate, not money earned: in the books revenue is recognized as the service is delivered.',
      'One-off payments and implementation fees stay out of ARR, otherwise it overstates the recurring base.',
      'Contracts with yearly price steps count at the current year\'s price, not the average over the whole term.',
    ],
  },
  grr: {
    ru: [
      'GRR не бывает выше 100%: если получилось больше, в расчёт попали расширения.',
      'Считают по одной когорте клиентов на начало периода, новые клиенты в расчёт не входят.',
      'Высокий GRR при низком NRR значит, что клиенты остаются, но не растут. Низкий GRR при высоком NRR значит, что рост держится на немногих крупных клиентах.',
    ],
    en: [
      'GRR never exceeds 100%: if it does, expansion slipped into the calculation.',
      'It is computed over one customer cohort at the start of the period; new customers stay out.',
      'High GRR with low NRR means customers stay but do not grow. Low GRR with high NRR means growth rests on a few large customers.',
    ],
  },
  acv: {
    ru: [
      'Для контрактов короче года ACV обычно приравнивают к полной сумме, иначе месячный контракт превращается в двенадцатикратный годовой.',
      'Разовые платежи за внедрение и обучение в ACV не включают или показывают отдельно.',
      'Скидка за длинный контракт снижает ACV, и сравнение с TCV показывает, сколько стоила длина.',
    ],
    en: [
      'For contracts shorter than a year, ACV is usually set to the full amount, otherwise a monthly contract becomes a twelvefold annual one.',
      'One-off implementation and training fees stay out of ACV or are shown separately.',
      'A discount for a long contract lowers ACV, and comparing it with TCV shows what the length cost.',
    ],
  },
  gbv: {
    ru: [
      'GBV считают до отмен, а в трэвеле их доля велика, поэтому рядом смотрят чистый GBV.',
      'Бронирование и поездка разнесены во времени: GBV месяца описывает спрос, а выручку признают после поездки.',
      'Колебания курсов валют меняют GBV международных броней без изменения числа поездок.',
    ],
    en: [
      'GBV is counted before cancellations, and in travel their share is large, so net GBV is tracked alongside.',
      'Booking and travel are spread out in time: a month\'s GBV describes demand, while revenue is recognized after the trip.',
      'Exchange rate swings change the GBV of international bookings with no change in the number of trips.',
    ],
  },
}
