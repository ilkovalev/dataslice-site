import { useMemo, useState } from 'react'
import MetricTreeGraph from './MetricTreeGraph.jsx'
import NorthStar from './NorthStar.jsx'
import { gloss } from './Glossed.jsx'
import { useLocale, loc } from '../lib/i18n.js'
import { FW_CONTENT, PROFIT_TREE, PYRAMID_BANDS, FRAMEWORKS, GLOSSARY, SHAPES } from '../content/framework.js'

// Вкладка «Основы»: что такое метрика и иерархия, дерево против пирамиды,
// блок про North Star, готовые фреймворки, конструктор архетипов и глоссарий.
function resolveNode(n, l) {
  return {
    ...n,
    title: loc(n.title, l),
    formula: loc(n.formula, l),
    note: loc(n.note, l),
    children: n.children?.map((c) => resolveNode(c, l)),
  }
}

export default function Framework({ industries, onPick }) {
  const locale = useLocale()
  const t = FW_CONTENT[locale]
  const [sel, setSel] = useState(null)
  const shape = SHAPES.find((s) => s.archetype.ru === sel)
  // Индустрии уже локализованы в MetricsPage — сопоставляем по русскому ключу,
  // он же хранится в JSON-ах индустрий как каноническое имя архетипа.
  const matches = sel ? industries.filter((i) => i.archetypeKey === sel) : []
  const profitTree = useMemo(() => ({ root: resolveNode(PROFIT_TREE.root, locale) }), [locale])

  return (
    <div className="space-y-8">
      <section className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 lg:items-start">
        <div>
          <h2 className="text-lg font-medium mb-2">{t.introHeading}</h2>
          <div className="text-[15px] text-gray-700 leading-relaxed space-y-3">
            {t.intro.map((p, i) => (
              <p key={i}>{gloss(p)}</p>
            ))}
          </div>
        </div>
        {/* Схема-шпаргалка справа: заполняет ширину и визуализирует три уровня иерархии */}
        <aside className="mt-6 lg:mt-0 rounded-xl border border-black/10 bg-panel p-5">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-3">{t.anatomyHeading}</div>
          <div className="space-y-2">
            <div className="rounded-lg border border-accent/40 bg-accent/12 px-3.5 py-2.5">
              <div className="text-sm font-semibold text-cyanink">{t.anatomyNsm.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.anatomyNsm.d}</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↑</div>
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/[0.07] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-sky-700">{t.anatomyDrivers.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.anatomyDrivers.d}</div>
            </div>
            <div className="flex justify-center text-gray-300 text-xs leading-none">↑</div>
            <div className="rounded-lg border border-amber-400/45 bg-amber-400/[0.1] px-3.5 py-2.5">
              <div className="text-sm font-semibold text-amber-700">{t.anatomyCounters.t}</div>
              <div className="text-xs text-gray-600 mt-0.5">{t.anatomyCounters.d}</div>
            </div>
          </div>
        </aside>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">{t.vsHeading}</h2>
        {/* Две схемы стоят рядом и сравниваются, поэтому подписи и рамки должны
            начинаться и заканчиваться на одной высоте. Subgrid кладёт подпись и
            карточку каждой колонки в общие ряды: подписи выравниваются по самой
            длинной, карточки тянутся на остаток (1fr). На мобильном колонки
            складываются в столбик, и subgrid не нужен. */}
        <div className="grid md:grid-cols-2 md:grid-rows-[auto_1fr] gap-4 lg:gap-6">
          <div className="min-w-0 flex flex-col md:grid md:grid-rows-subgrid md:row-span-2">
            <div className="text-sm text-gray-700 mb-2">
              <span className="text-cyanink">{t.vsTreeName}</span> {t.vsTree}
            </div>
            {/* Иллюстрация к мысли «дерево ≠ пирамида»: рядом статичная пирамида,
                и дерево здесь такая же картинка — без интерактива и уровней. */}
            <MetricTreeGraph tree={profitTree} plain className="flex-1 flex flex-col justify-center" />
          </div>
          <div className="min-w-0 flex flex-col md:grid md:grid-rows-subgrid md:row-span-2">
            <div className="text-sm text-gray-700 mb-2">
              <span className="text-cyanink">{t.vsPyramidName}</span> {t.vsPyramid}
            </div>
            <div className="rounded-xl border border-black/10 bg-panel p-5 flex-1 flex flex-col items-center justify-center gap-2">
              {PYRAMID_BANDS.map((b, i) => (
                <div key={i} className="rounded-lg border border-black/10 bg-accent/12 px-3 py-2 text-center" style={{ width: b.w }}>
                  <div className="text-[11px] uppercase tracking-wider text-gray-700">{loc(b.label, locale)}</div>
                  <div className="text-xs text-gray-900">{loc(b.items, locale)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NorthStar industries={industries} onPick={onPick} />

      {/* Справочные секции в две колонки на десктопе — чтобы заполнить ширину, как в статистике */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-10 lg:items-start space-y-8 lg:space-y-0">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium mb-3">{t.fwHeading}</h2>
            <div className="space-y-3">
              {FRAMEWORKS.map((f) => (
                <div key={f.name} className="rounded-lg border border-black/10 bg-panel px-4 py-3">
                  <div className="text-cyanink font-medium">{f.name}</div>
                  <div className="text-sm text-gray-900 mt-0.5">{loc(f.items, locale)}</div>
                  <div className="text-sm text-gray-600 mt-1">{loc(f.use, locale)}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-1">{t.shapesHeading}</h2>
            <p className="text-gray-600 text-sm mb-3">{t.shapesIntro}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SHAPES.map((s) => (
                <button
                  key={s.archetype.ru}
                  onClick={() => setSel(s.archetype.ru)}
                  className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                    s.archetype.ru === sel ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-700 hover:bg-black/5'
                  }`}
                >
                  {loc(s.q, locale)}
                </button>
              ))}
            </div>
            {shape && (
              <div className="rounded-xl border border-black/10 bg-panel p-5">
                <div className="text-xs uppercase tracking-wider text-gray-500">{t.shapesArchetype}</div>
                <div className="text-lg text-cyanink font-medium mb-3">{loc(shape.archetype, locale)}</div>
                <div className="text-sm text-gray-600">North Star</div>
                <div className="font-mono text-sm text-cyanink/90 bg-accent/10 inline-block px-2 py-0.5 rounded mb-3">{loc(shape.northStar, locale)}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {t.shapesDrivers}: <span className="text-sky-600/90">{loc(shape.drivers, locale).join(' · ')}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {t.shapesCounters}: <span className="text-amber-600/80">{loc(shape.counters, locale).join(' · ')}</span>
                </div>
                {matches.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {matches.map((m) => (
                      <button key={m.id} onClick={() => onPick(m.id)} className="text-sm px-3 py-1 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">
                        {m.industry} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <section>
          <h2 className="text-lg font-medium mb-3">{t.glossaryHeading}</h2>
          <p className="text-gray-600 text-sm mb-3">{t.glossaryIntro}</p>
          <div className="space-y-3">
            {GLOSSARY.map((g) => (
              <div key={g.group.ru} className="rounded-lg border border-black/10 bg-panel px-4 py-3">
                <div className="text-cyanink font-medium mb-1.5">{loc(g.group, locale)}</div>
                <dl className="space-y-1.5">
                  {g.items.map((it) => (
                    <div key={loc(it.m, locale)} className="text-sm sm:flex sm:gap-2">
                      <dt className="text-gray-900 font-medium sm:w-32 shrink-0">{loc(it.m, locale)}</dt>
                      <dd className="text-gray-600">
                        <span className="font-mono text-cyanink/90 text-xs bg-accent/10 px-1.5 py-0.5 rounded">{loc(it.f, locale)}</span>
                        <span className="ml-2">{loc(it.d, locale)}</span>
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
