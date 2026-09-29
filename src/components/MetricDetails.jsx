import { gloss } from './Glossed.jsx'

// Общие блоки разбора метрики: их показывают и глоссарий, и карточка метрики.
// Вынесены сюда, чтобы две поверхности выглядели одинаково и не расходились
// по составу — раньше в карточке были камни, а в глоссарии кейс, и наоборот.

export function SectionLabel({ children }) {
  return <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1.5">{children}</div>
}

export function ExampleBlock({ label, text }) {
  if (!text) return null
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <p className="rounded-2xl bg-white/65 ring-1 ring-white/80 shadow-[0_2px_10px_-6px_rgba(20,50,80,0.18)] px-4 py-3 text-sm text-gray-700 leading-relaxed">
        {text}
      </p>
    </div>
  )
}

export function Pitfalls({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <ol className="rounded-2xl bg-amber-50/70 ring-1 ring-amber-200/70 divide-y divide-amber-200/60">
        {items.map((p, i) => (
          <li key={i} className="flex gap-3 px-4 py-2.5 text-sm text-gray-700 leading-relaxed">
            <span className="mt-0.5 shrink-0 h-5 w-5 rounded-full bg-amber-400/25 text-amber-800 text-[11px] font-semibold grid place-items-center">
              {i + 1}
            </span>
            <span>{gloss(p)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
