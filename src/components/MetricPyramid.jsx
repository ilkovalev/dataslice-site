// Пирамида метрик — ИНОЙ срез, чем дерево. Дерево раскладывает North Star на
// множители (причинно-следственно). Пирамида группирует метрики по уровню
// абстракции и аудитории: сверху узкие «бизнесовые» (для совета директоров),
// снизу широкие «платформенные» (для инженеров). Данные — в tree.pyramid.bands.
const widths = ['46%', '64%', '82%', '100%']
const shades = ['bg-accent/25', 'bg-accent/18', 'bg-accent/12', 'bg-accent/8']

export default function MetricPyramid({ tree }) {
  const bands = tree.pyramid?.bands ?? []
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {tree.pyramid?.note && <p className="text-sm text-gray-600 mb-4">{tree.pyramid.note}</p>}
      <div className="flex flex-col items-center gap-2">
        {bands.map((b, i) => (
          <div key={i} className={`rounded-lg border border-black/10 px-4 py-2.5 text-center ${shades[i] ?? 'bg-accent/8'}`} style={{ width: widths[i] ?? '100%' }}>
            <div className="text-[11px] uppercase tracking-wider text-gray-700">{b.label}</div>
            {b.role && <div className="text-[11px] text-gray-500 mb-0.5">{b.role}</div>}
            <div className="text-sm text-gray-900 leading-snug">{b.items.join('  ·  ')}</div>
          </div>
        ))}
      </div>
      {tree.counterMetrics && (
        <div className="mt-4 pt-3 border-t border-black/10 text-sm text-gray-600">
          <span className="text-amber-600">Контр-метрики (фундамент):</span> {tree.counterMetrics.map((c) => c.title).join(' · ')}
        </div>
      )}
    </div>
  )
}
