import { useState } from 'react'
import MetricTreeGraph from './MetricTreeGraph.jsx'

// Пример дерева метрик (Profit Tree) для иллюстрации.
const profitTree = {
  root: {
    id: 'profit', level: 0, title: 'Прибыль', formula: 'Доход − Расход',
    children: [
      { id: 'revenue', level: 1, title: 'Доход', children: [
        { id: 'orders', level: 2, title: 'Кол-во заказов' },
        { id: 'check', level: 2, title: 'Средний чек' },
      ] },
      { id: 'cost', level: 1, title: 'Расход', children: [
        { id: 'fot', level: 2, title: 'ФОТ' },
        { id: 'mkt', level: 2, title: 'Маркетинг' },
      ] },
    ],
  },
}

const pyramidBands = [
  { w: '46%', label: 'Бизнесовые', items: 'выручка, рост базы — для руководства' },
  { w: '64%', label: 'Продуктовые', items: 'конверсия, средний чек, retention' },
  { w: '82%', label: 'Интерфейсные', items: 'CES, CSI, успешность задач' },
  { w: '100%', label: 'Платформенные', items: 'время отклика, сбои, нагрузка' },
]

const FRAMEWORKS = [
  { name: 'AARRR (Pirate Metrics)', items: 'Acquisition (привлечение) → Activation (активация) → Retention (удержание) → Referral (рекомендации) → Revenue (доход)', use: 'Воронка жизненного цикла пользователя. Удобно для продуктов и стартапов: где теряем людей на пути к ценности и деньгам.' },
  { name: 'HEART (Google)', items: 'Happiness (удовлетворённость) · Engagement (вовлечённость) · Adoption (освоение) · Retention (удержание) · Task success (успешность задач)', use: 'Для оценки качества и UX продукта: каждой букве — своя цель-сигнал и метрика.' },
  { name: 'Profit Tree', items: 'Прибыль = Доход − Расход → дальше раскладываем каждую ветку на рычаги', use: 'Финансовое дерево для юнит-экономики: показывает, какой рычаг как влияет на прибыль.' },
]

// Глоссарий метрик по типам — с формулами. Чтобы было видно «какие вообще бывают».
const GLOSSARY = [
  {
    group: 'Привлечение (Acquisition)',
    items: [
      { m: 'CAC', f: 'расходы на маркетинг / число привлечённых', d: 'стоимость привлечения одного клиента.' },
      { m: 'Конверсия', f: 'целевые действия / визиты', d: 'доля посетителей, дошедших до нужного шага.' },
      { m: 'CTR', f: 'клики / показы', d: 'кликабельность объявления или элемента.' },
      { m: 'ДРР / ROMI', f: 'выручка от рекламы / расходы на неё', d: 'отдача рекламных вложений.' },
    ],
  },
  {
    group: 'Вовлечённость (Engagement)',
    items: [
      { m: 'DAU / MAU', f: 'уникальные за день / за месяц', d: 'активная аудитория; их отношение — «липкость» (stickiness).' },
      { m: 'Частота', f: 'сессии / пользователя', d: 'как часто человек возвращается.' },
      { m: 'Глубина', f: 'действия (или минуты) / сессию', d: 'насколько плотно используют продукт за заход.' },
    ],
  },
  {
    group: 'Удержание (Retention)',
    items: [
      { m: 'Retention N-дня', f: 'вернувшиеся на день N / когорта', d: 'доля, оставшаяся через 1/7/30 дней.' },
      { m: 'Churn', f: 'ушедшие за период / база на старте', d: 'отток; обратная сторона удержания.' },
      { m: 'NRR', f: 'выручка когорты сейчас / год назад', d: 'чистое удержание выручки с учётом роста и оттока.' },
    ],
  },
  {
    group: 'Монетизация (Monetization)',
    items: [
      { m: 'ARPU / ARPPU', f: 'выручка / все (или платящие) польз.', d: 'средний доход с пользователя или с платящего.' },
      { m: 'LTV', f: 'ARPU × средний срок жизни', d: 'сколько денег приносит клиент за всё время.' },
      { m: 'LTV / CAC', f: 'LTV ÷ CAC', d: 'окупаемость привлечения; здорово при > 3.' },
      { m: 'GMV / Оборот', f: 'сумма всех сделок', d: 'валовой объём для маркетплейсов и платформ.' },
    ],
  },
  {
    group: 'Качество и контр-метрики',
    items: [
      { m: 'NPS / CSAT', f: 'опросные индексы', d: 'готовность рекомендовать / удовлетворённость.' },
      { m: 'Доля жалоб / возвратов', f: 'жалобы (возвраты) / действия', d: 'guardrail качества: ловит накрутку основной метрики.' },
      { m: 'p95 / p99 латентности', f: 'перцентили времени ответа', d: 'насколько плохо самым невезучим — техническая надёжность.' },
    ],
  },
]

const SHAPES = [
  { archetype: 'Экономика внимания', q: 'Показывает рекламу (продаёт внимание)', northStar: 'Время/внимание × монетизация рекламой', drivers: ['Охват', 'Частота', 'Глубина'], counters: ['качество контента', 'долгосрочное удержание'] },
  { archetype: 'Подписки', q: 'Регулярная плата за доступ', northStar: 'Удерживаемая платящая база', drivers: ['Привлечение', 'Удержание / Churn', 'ARPU'], counters: ['вынужденный отток', 'LTV / CAC'] },
  { archetype: 'Транзакционные платформы', q: 'Комиссия со сделок между сторонами', northStar: 'Оборот / число сделок (GMV)', drivers: ['Спрос', 'Предложение', 'Ликвидность'], counters: ['take rate', 'отток сторон', 'отмены'] },
  { archetype: 'Прямая коммерция', q: 'Своя маржа с продажи товара', northStar: 'Выручка', drivers: ['Трафик', 'Конверсия', 'Чек', 'Повторные'], counters: ['возвраты / маржа', 'CAC / LTV'] },
  { archetype: 'Сети физических точек', q: 'Сеть точек (рестораны, ритейл)', northStar: 'Точки × Выручка с точки', drivers: ['Экспансия', 'Same-store', 'Операционка'], counters: ['каннибализация', 'юнит-экономика'] },
  { archetype: 'Финтех', q: 'Проценты и комиссии с денег', northStar: 'TPV / активные платящие', drivers: ['База', 'Частота', 'Средний чек'], counters: ['дефолты', 'фрод'] },
  { archetype: 'Виртуальная экономика', q: 'Внутриигровые покупки', northStar: 'Платежи игроков', drivers: ['DAU', 'Конверсия в платящих', 'ARPPU'], counters: ['pay-to-win', 'инфляция'] },
  { archetype: 'AI / LLM-продукты', q: 'Оплата за использование AI', northStar: 'Выручка (токены + подписки)', drivers: ['Usage', 'Подписки', 'Маржа на запрос'], counters: ['cost-per-user', 'сжатие маржи'] },
]

export default function Framework({ industries, onPick }) {
  const [sel, setSel] = useState(null)
  const shape = SHAPES.find((s) => s.archetype === sel)
  const matches = sel ? industries.filter((i) => i.archetype === sel) : []

  return (
    <div className="space-y-8">
      <section className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:items-start">
        <div>
          <h2 className="text-lg font-medium mb-2">Что такое метрика и зачем иерархия</h2>
          <div className="text-[15px] text-gray-700 leading-relaxed space-y-3">
            <p>Метрика — это число, измеряющее состояние продукта или бизнеса: выручка, конверсия, удержание, время ответа. Сама по себе одна цифра мало что значит — важно, как метрики связаны между собой и какая из них главная.</p>
            <p>Поэтому метрики выстраивают в иерархию. На вершине — одна <span className="text-cyanink">North Star</span>, лучше всего отражающая ценность продукта. Под ней — драйверы, из которых она складывается, и операционные рычаги, на которые команда влияет напрямую. А в фундаменте — контр-метрики, не дающие «накрутить» главную в ущерб качеству (привет закону Гудхарта).</p>
            <p>Раскладывают метрики двумя разными способами — деревом и пирамидой. Это не одно и то же, и ниже видно, чем они отличаются.</p>
          </div>
        </div>
        {/* Схема-шпаргалка справа: заполняет ширину и визуализирует три уровня иерархии */}
        <aside className="mt-6 lg:mt-0 rounded-xl border border-black/10 bg-panel p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">Анатомия иерархии</div>
          <div className="space-y-2">
            <div className="rounded-lg border border-accent/40 bg-accent/12 px-3.5 py-2.5">
              <div className="text-sm font-semibold text-cyanink">North Star · L0</div>
              <div className="text-xs text-gray-600 mt-0.5">одна метрика, лучше всего отражающая ключевую ценность продукта</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↑</div>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/[0.07] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-sky-700">Драйверы и рычаги · L1 / L2</div>
              <div className="text-xs text-gray-600 mt-0.5">из чего складывается North Star и на что команда влияет напрямую</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↑</div>
            <div className="rounded-lg border border-amber-400/45 bg-amber-400/[0.1] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-amber-700">Контр-метрики · guardrails</div>
              <div className="text-xs text-gray-600 mt-0.5">ограничители качества против «накрутки» главной метрики</div>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Дерево против иерархии метрик</h2>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          <div className="min-w-0">
            <div className="text-sm text-gray-700 mb-2"><span className="text-cyanink">Дерево</span> раскладывает одну метрику на множители и слагаемые (Прибыль = Доход − Расход). Идём по причинно-следственным рычагам — какую «шестерёнку» подкрутить.</div>
            <MetricTreeGraph tree={profitTree} />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-gray-700 mb-2"><span className="text-cyanink">Иерархия (пирамида)</span> группирует метрики по уровню абстракции и аудитории. Не «из чего складывается», а «кому и о чём» — чтобы согласовать метрики между уровнями команды.</div>
            <div className="rounded-xl border border-black/10 bg-panel p-5 flex flex-col items-center gap-2">
              {pyramidBands.map((b, i) => (
                <div key={i} className="rounded-lg border border-black/10 bg-accent/12 px-3 py-2 text-center" style={{ width: b.w }}>
                  <div className="text-[11px] uppercase tracking-wider text-gray-700">{b.label}</div>
                  <div className="text-xs text-gray-900">{b.items}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Справочные секции в две колонки на десктопе — чтобы заполнить ширину, как в статистике */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:items-start space-y-8 lg:space-y-0">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium mb-3">Готовые фреймворки</h2>
            <div className="space-y-3">
              {FRAMEWORKS.map((f) => (
                <div key={f.name} className="rounded-lg border border-black/10 bg-panel px-4 py-3">
                  <div className="text-cyanink font-medium">{f.name}</div>
                  <div className="text-sm text-gray-900 mt-0.5">{f.items}</div>
                  <div className="text-sm text-gray-600 mt-1">{f.use}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-1">Собрать дерево под незнакомый продукт</h2>
            <p className="text-gray-600 text-sm mb-3">Определите архетип по способу монетизации — и форма дерева готова.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SHAPES.map((s) => (
                <button key={s.archetype} onClick={() => setSel(s.archetype)} className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${s.archetype === sel ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-700 hover:bg-black/5'}`}>
                  {s.q}
                </button>
              ))}
            </div>
            {shape && (
              <div className="rounded-xl border border-black/10 bg-panel p-5">
                <div className="text-xs uppercase tracking-wider text-gray-500">Архетип</div>
                <div className="text-lg text-cyanink font-medium mb-3">{shape.archetype}</div>
                <div className="text-sm text-gray-600">North Star</div>
                <div className="font-mono text-sm text-cyanink/90 bg-accent/10 inline-block px-2 py-0.5 rounded mb-3">{shape.northStar}</div>
                <div className="text-sm text-gray-600 mb-1">Драйверы (L1): <span className="text-sky-600/90">{shape.drivers.join(' · ')}</span></div>
                <div className="text-sm text-gray-600 mb-4">Контр-метрики: <span className="text-amber-600/80">{shape.counters.join(' · ')}</span></div>
                {matches.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {matches.map((m) => (
                      <button key={m.id} onClick={() => onPick(m.id)} className="text-sm px-3 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">{m.industry} →</button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <section>
          <h2 className="text-lg font-medium mb-3">Глоссарий метрик по типам</h2>
          <p className="text-gray-600 text-sm mb-3">Базовый словарь: какие метрики вообще бывают и как считаются. Сгруппированы по этапу жизненного цикла (как в AARRR).</p>
          <div className="space-y-3">
            {GLOSSARY.map((g) => (
              <div key={g.group} className="rounded-lg border border-black/10 bg-panel px-4 py-3">
                <div className="text-cyanink font-medium mb-1.5">{g.group}</div>
                <dl className="space-y-1.5">
                  {g.items.map((it) => (
                    <div key={it.m} className="text-sm sm:flex sm:gap-2">
                      <dt className="text-gray-900 font-medium sm:w-32 shrink-0">{it.m}</dt>
                      <dd className="text-gray-600">
                        <span className="font-mono text-cyanink/90 text-xs bg-accent/10 px-1.5 py-0.5 rounded">{it.f}</span>
                        <span className="ml-2">{it.d}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
