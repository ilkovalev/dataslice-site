import { useState } from 'react'

// Роли метрик в эксперименте: ключевая, прокси, guardrail, информационная.
// Сценарии показывают, почему одной метрики мало: «победа» может ломать guardrail.
const SCEN = {
  win: {
    label: 'честная победа',
    verdict: 'Катить B: ключевая выросла, guardrail в порядке.', ship: true,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', d: +2.1 },
      { role: 'Прокси', m: 'добавления в корзину', d: +3.0 },
      { role: 'Guardrail', m: 'скорость страницы', d: -0.2 },
      { role: 'Guardrail', m: 'отписки', d: +0.1 },
      { role: 'Информационная', m: 'клики по баннеру', d: +5.0 },
    ],
  },
  harm: {
    label: 'победа ценой guardrail',
    verdict: 'НЕ катить: конверсия выросла, но отписки и возвраты подскочили — чистый ущерб.', ship: false,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', d: +2.4 },
      { role: 'Прокси', m: 'добавления в корзину', d: +2.0 },
      { role: 'Guardrail', m: 'отписки', d: +6.0 },
      { role: 'Guardrail', m: 'возвраты', d: +4.5 },
      { role: 'Информационная', m: 'клики по баннеру', d: +9.0 },
    ],
  },
  proxy: {
    label: 'прокси вырос, цель — нет',
    verdict: 'Осторожно: прокси-метрика выросла, а ключевая не сдвинулась — типичный закон Гудхарта.', ship: false,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', d: +0.1 },
      { role: 'Прокси', m: 'добавления в корзину', d: +7.0 },
      { role: 'Guardrail', m: 'скорость страницы', d: 0.0 },
      { role: 'Информационная', m: 'время на странице', d: +12.0 },
    ],
  },
}
const COLOR = { 'Ключевая': '#2ab8eb', 'Прокси': '#0d7fb0', 'Guardrail': '#d9a300', 'Информационная': '#9ca3af' }

export default function MetricRoles() {
  const [s, setS] = useState('win')
  const sc = SCEN[s]
  const bad = (row) => (row.role === 'Guardrail' && ((row.m === 'отписки' || row.m === 'возвраты') ? row.d > 1 : row.d < -1))

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(SCEN).map(([k, v]) => (
          <button key={k} onClick={() => setS(k)} className={`text-xs px-2.5 py-1 rounded-md border ${s === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{v.label}</button>
        ))}
      </div>

      <div className="space-y-1.5">
        {sc.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="text-[11px] uppercase tracking-wide w-28 shrink-0" style={{ color: COLOR[row.role] }}>{row.role}</span>
            <span className="text-gray-700 flex-1">{row.m}</span>
            <span className={`tabular-nums font-medium ${bad(row) ? 'text-[#dc4d4d]' : row.d > 0.5 ? 'text-green-600' : 'text-gray-500'}`}>{row.d > 0 ? '+' : ''}{row.d.toFixed(1)}%{bad(row) ? ' ⚠' : ''}</span>
          </div>
        ))}
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${sc.ship ? 'border-green-500/30 bg-green-500/5' : 'border-[#dc4d4d]/30 bg-[#dc4d4d]/5'} text-gray-700`}>
        {sc.ship ? '✓ ' : '✕ '}{sc.verdict}
      </div>
      <p className="text-xs text-gray-500 mt-2">Решение принимают по ОДНОЙ ключевой метрике, но только если guardrail-метрики не просели. Прокси ускоряет тест, но рост прокси без роста ключевой — ловушка. Информационные метрики объясняют «почему», но по ним не решают.</p>
    </div>
  )
}
