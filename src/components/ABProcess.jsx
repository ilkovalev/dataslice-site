import { useState } from 'react'

// Полный процесс A/B по этапам (на основе чек-листа). Кликните этап —
// раскроются ключевые проверки. Это «дорожная карта» эксперимента.
const PHASES = [
  { key: 'biz', n: '1', title: 'Бизнес-постановка', titleEn: 'Business framing', items: [
    'Обозначена проблема и продуктовая гипотеза',
    'Понятны масштаб и направление изменения ключевой метрики',
    'Посчитана экономическая целесообразность (точка безубыточности)',
    'Оценены риски и ограничения; сформулирован критерий успеха и action-plan',
  ], itemsEn: [
    'The problem and the product hypothesis are stated',
    'The scale and direction of the primary-metric change are understood',
    'The economics are computed (the break-even point)',
    'Risks and constraints assessed; a success criterion and an action plan are formulated',
  ] },
  { key: 'design', n: '2', title: 'Дизайн', titleEn: 'Design', items: [
    'Метрики: ключевая (под гипотезу), прокси, заградительные (guardrails), информационные',
    'Сплитование: сегмент, способ деления и балансировки, нет пересечений с другими тестами',
    'Статистика: критерий под каждую метрику, соотношение групп, MDE, α, β, размер выборки, длительность',
    'Поправки: эффект новизны, подглядывание, сезонность, окно конверсии, выбросы, множественные сравнения',
    'Проверки: критерий проверен на A/A-симуляциях, изменение реализовано и протестировано',
  ], itemsEn: [
    'Metrics: primary (matching the hypothesis), proxy, guardrails, informational',
    'Splitting: the segment, the assignment and balancing scheme, no overlap with other tests',
    'Statistics: a criterion per metric, group ratio, MDE, α, β, sample size, duration',
    'Adjustments: novelty effect, peeking, seasonality, conversion window, outliers, multiple comparisons',
    'Checks: the criterion validated on A/A simulations, the change implemented and tested',
  ] },
  { key: 'run', n: '3', title: 'Проведение', titleEn: 'Running', items: [
    'Нововведение технически работает, логирование корректно',
    'Нет несоответствия в соотношении выборок (SRM)',
    'Нет проблем в репрезентативности и перетекания пользователей между группами',
    'В динамике метрик нет странностей; тест не останавливают раньше срока',
  ], itemsEn: [
    'The change technically works, logging is correct',
    'No sample ratio mismatch (SRM)',
    'No representativeness issues and no users leaking between groups',
    'No oddities in the metric dynamics; the test is not stopped early',
  ] },
  { key: 'result', n: '4', title: 'Итоги', titleEn: 'Results', items: [
    'Определены статзначимые изменения метрик',
    'Есть чёткие ответы по первоначальной гипотезе и связь с другими тестами',
    'Результаты ёмко сформулированы, представлены стейкхолдерам',
    'Есть не только выводы, но и конкретные предложения по действиям',
  ], itemsEn: [
    'Statistically significant metric changes identified',
    'Clear answers on the original hypothesis and links to other tests',
    'Results stated concisely and presented to stakeholders',
    'Not just conclusions, but concrete proposed actions',
  ] },
  { key: 'close', n: '5', title: 'Завершение', titleEn: 'Wrap-up', items: [
    'Выполнен action-план: раскатили или откатили',
    'Результаты внесены в базу знаний',
    'Поставлены задачи на «выпил» эксперимента из кода',
    'После раскатки метрики ведут себя как ожидалось',
  ], itemsEn: [
    'The action plan executed: rolled out or rolled back',
    'Results recorded in the knowledge base',
    'Tasks filed to remove the experiment from the code',
    'After rollout the metrics behave as expected',
  ] },
]

export default function ABProcess({ locale = 'ru' }) {
  const en = locale === 'en'
  const [sel, setSel] = useState(0)
  const p = PHASES[sel]
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-1.5">
        {PHASES.map((ph, i) => (
          <button
            key={ph.key}
            onClick={() => setSel(i)}
            className={`flex-1 min-w-[90px] rounded-md border px-2 py-2 text-center text-xs transition-colors ${
              sel === i ? 'border-accent/60 bg-accent/15 text-cyanink' : 'border-black/10 text-gray-700 hover:bg-black/5'
            }`}
          >
            <div className="text-[10px] text-gray-500">{en ? 'phase' : 'этап'} {ph.n}</div>
            {en ? ph.titleEn : ph.title}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-4 py-3">
        <div className="text-cyanink font-medium mb-2">{en ? 'Phase' : 'Этап'} {p.n}. {en ? p.titleEn : p.title}</div>
        <ul className="space-y-1.5">
          {(en ? p.itemsEn : p.items).map((it, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-cyanink/70 mt-0.5">✓</span><span>{it}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'This is an abridged map; a real checklist has dozens of items. What matters is the order: business and design first, launch only after.'
        : 'Это сокращённая карта; в реальном чек-листе десятки пунктов. Главное — порядок: сначала бизнес и дизайн, и только потом запуск.'}</p>
    </div>
  )
}
