import { useState } from 'react'

// Роли метрик в эксперименте: ключевая, прокси, guardrail, информационная.
// Сценарии показывают, почему одной метрики мало: «победа» может ломать guardrail.
const SCEN = {
  win: {
    label: 'честная победа', labelEn: 'an honest win',
    verdict: 'Катить B: ключевая выросла, guardrail в порядке.', verdictEn: 'Ship B: the primary metric grew, guardrails are fine.', ship: true,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', mEn: 'order conversion', d: +2.1 },
      { role: 'Прокси', m: 'добавления в корзину', mEn: 'add-to-cart', d: +3.0 },
      { role: 'Guardrail', m: 'скорость страницы', mEn: 'page speed', d: -0.2 },
      { role: 'Guardrail', m: 'отписки', mEn: 'unsubscribes', d: +0.1 },
      { role: 'Информационная', m: 'клики по баннеру', mEn: 'banner clicks', d: +5.0 },
    ],
  },
  harm: {
    label: 'победа ценой guardrail', labelEn: 'a win at a guardrail’s expense',
    verdict: 'НЕ катить: конверсия выросла, но отписки и возвраты подскочили — чистый ущерб.', verdictEn: 'Do NOT ship: conversion grew, but unsubscribes and refunds jumped — net damage.', ship: false,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', mEn: 'order conversion', d: +2.4 },
      { role: 'Прокси', m: 'добавления в корзину', mEn: 'add-to-cart', d: +2.0 },
      { role: 'Guardrail', m: 'отписки', mEn: 'unsubscribes', d: +6.0 },
      { role: 'Guardrail', m: 'возвраты', mEn: 'refunds', d: +4.5 },
      { role: 'Информационная', m: 'клики по баннеру', mEn: 'banner clicks', d: +9.0 },
    ],
  },
  proxy: {
    label: 'прокси вырос, цель — нет', labelEn: 'proxy up, goal flat',
    verdict: 'Осторожно: прокси-метрика выросла, а ключевая не сдвинулась — типичный закон Гудхарта.', verdictEn: 'Careful: the proxy metric grew while the primary did not move — a textbook Goodhart’s law.', ship: false,
    rows: [
      { role: 'Ключевая', m: 'конверсия в заказ', mEn: 'order conversion', d: +0.1 },
      { role: 'Прокси', m: 'добавления в корзину', mEn: 'add-to-cart', d: +7.0 },
      { role: 'Guardrail', m: 'скорость страницы', mEn: 'page speed', d: 0.0 },
      { role: 'Информационная', m: 'время на странице', mEn: 'time on page', d: +12.0 },
    ],
  },
}
const COLOR = { 'Ключевая': '#2ab8eb', 'Прокси': '#0d7fb0', 'Guardrail': '#d9a300', 'Информационная': '#9ca3af' }
const ROLE_EN = { 'Ключевая': 'Primary', 'Прокси': 'Proxy', 'Guardrail': 'Guardrail', 'Информационная': 'Informational' }

export default function MetricRoles({ locale = 'ru' }) {
  const en = locale === 'en'
  const [s, setS] = useState('win')
  const sc = SCEN[s]
  const bad = (row) => (row.role === 'Guardrail' && ((row.m === 'отписки' || row.m === 'возвраты') ? row.d > 1 : row.d < -1))

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(SCEN).map(([k, v]) => (
          <button key={k} onClick={() => setS(k)} className={`text-xs px-2.5 py-1 rounded-md border ${s === k ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? v.labelEn : v.label}</button>
        ))}
      </div>

      <div className="space-y-1.5">
        {sc.rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="text-[11px] uppercase tracking-wide w-28 shrink-0" style={{ color: COLOR[row.role] }}>{en ? ROLE_EN[row.role] : row.role}</span>
            <span className="text-gray-700 flex-1">{en ? row.mEn : row.m}</span>
            <span className={`tabular-nums font-medium ${bad(row) ? 'text-[#dc4d4d]' : row.d > 0.5 ? 'text-green-600' : 'text-gray-500'}`}>{row.d > 0 ? '+' : ''}{row.d.toFixed(1)}%{bad(row) ? ' ⚠' : ''}</span>
          </div>
        ))}
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${sc.ship ? 'border-green-500/30 bg-green-500/5' : 'border-[#dc4d4d]/30 bg-[#dc4d4d]/5'} text-gray-700`}>
        {sc.ship ? '✓ ' : '✕ '}{en ? sc.verdictEn : sc.verdict}
      </div>
      <p className="text-xs text-gray-500 mt-2">{en
        ? 'The decision is made on ONE primary metric — but only if the guardrail metrics have not dipped. A proxy speeds up the test, but proxy growth without primary growth is a trap. Informational metrics explain the "why", but decisions are not made on them.'
        : 'Решение принимают по ОДНОЙ ключевой метрике, но только если guardrail-метрики не просели. Прокси ускоряет тест, но рост прокси без роста ключевой — ловушка. Информационные метрики объясняют «почему», но по ним не решают.'}</p>
    </div>
  )
}
