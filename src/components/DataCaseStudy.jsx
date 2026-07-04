import { useMemo, useState } from 'react'

// Капстоун: сквозной разбор ОДНОГО встроенного датасета через весь курс.
// Шаги: знакомство/распределение → выбросы → сегменты → A/B (ATE+CI) → CATE → вывод.
// Данные генерируются детерминированно (seeded), чтобы быть «как настоящие», но стабильными.
const W = 520
const H = 220
const PAD = 36

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const Phi = (z) => 0.5 * (1 + erf(z / Math.SQRT2))

function buildData() {
  const r = mulberry32(42)
  const rows = []
  for (let i = 0; i < 2400; i++) {
    const device = r() < 0.55 ? 'mobile' : 'desktop'
    const group = r() < 0.5 ? 'A' : 'B'
    // выручка: лог-нормальная (скошенная) + редкие выбросы
    let revenue = Math.exp(2.2 + (device === 'desktop' ? 0.5 : 0) + 0.9 * (Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r())))
    if (r() < 0.01) revenue *= 8 // выброс
    // конверсия: базовая зависит от устройства; эффект B РАЗНЫЙ по устройству
    // (mobile: +8 п.п., desktop: −8 п.п.) → средний ATE около нуля, но CATE резко разный
    const base = device === 'mobile' ? 0.10 : 0.16
    const lift = group === 'B' ? (device === 'mobile' ? 0.08 : -0.08) : 0
    const converted = r() < base + lift ? 1 : 0
    rows.push({ device, group, revenue: Math.round(revenue), converted })
  }
  return rows
}

const STEPS = ['Данные', 'Выбросы', 'Сегменты', 'A/B-итог', 'CATE', 'Вывод']

export default function DataCaseStudy() {
  const data = useMemo(buildData, [])
  const [step, setStep] = useState(0)

  const rev = data.map((d) => d.revenue)
  const mean = rev.reduce((a, b) => a + b, 0) / rev.length
  const sorted = [...rev].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const p95 = sorted[Math.floor(sorted.length * 0.95)]
  const maxRev = sorted[sorted.length - 1]

  // конверсия по группам
  const conv = (rows) => rows.filter((d) => d.converted).length / (rows.length || 1)
  const A = data.filter((d) => d.group === 'A'); const B = data.filter((d) => d.group === 'B')
  const cA = conv(A); const cB = conv(B)
  const pool = (cA * A.length + cB * B.length) / data.length
  const se = Math.sqrt(pool * (1 - pool) * (1 / A.length + 1 / B.length))
  const z = (cB - cA) / se; const pval = 2 * (1 - Phi(Math.abs(z)))
  const ciHalf = 1.96 * se

  // конверсия по устройству
  const byDev = (dev) => conv(data.filter((d) => d.device === dev))
  // CATE: лифт B−A по устройству
  const cate = (dev) => {
    const da = data.filter((d) => d.device === dev && d.group === 'A')
    const db = data.filter((d) => d.device === dev && d.group === 'B')
    return conv(db) - conv(da)
  }

  // --- мини-чарты ---
  function Hist({ highlightOutliers }) {
    const BINS = 24; const dmax = highlightOutliers ? maxRev : p95 * 1.1
    const bw = dmax / BINS; const counts = new Array(BINS).fill(0)
    for (const v of rev) { let b = Math.floor(v / bw); if (b >= BINS) b = BINS - 1; counts[b]++ }
    const mc = Math.max(...counts, 1)
    const sx = (x) => PAD + (x / dmax) * (W - 2 * PAD)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {counts.map((c, k) => { const h = (c / mc) * (H - 2 * PAD); return c ? <rect key={k} x={sx(k * bw) + 1} y={H - PAD - h} width={(W - 2 * PAD) / BINS - 1} height={h} fill="#2ab8eb" opacity="0.8" /> : null })}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" />
        <line x1={sx(median)} y1={PAD - 6} x2={sx(median)} y2={H - PAD} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={sx(median)} y={PAD - 8} fill="#d9a300" fontSize="10" textAnchor="middle">медиана {median}</text>
        {sx(mean) < W - PAD && <line x1={sx(mean)} y1={PAD - 6} x2={sx(mean)} y2={H - PAD} stroke="#16a34a" strokeWidth="1.5" />}
        {sx(mean) < W - PAD && <text x={sx(mean)} y={H - PAD + 14} fill="#16a34a" fontSize="10" textAnchor="middle">среднее {mean.toFixed(0)}</text>}
        {highlightOutliers && <line x1={sx(p95)} y1={PAD} x2={sx(p95)} y2={H - PAD} stroke="#dc4d4d" strokeWidth="1" strokeDasharray="3 3" />}
        {highlightOutliers && <text x={sx(p95)} y={PAD + 10} fill="#dc4d4d" fontSize="10">p95 = {p95}</text>}
      </svg>
    )
  }
  function Bars({ items, fmt, ci }) {
    const max = Math.max(...items.map((i) => i.v), 0.01)
    const bw = (W - 2 * PAD) / items.length
    const sy = (v) => H - PAD - (v / (max * 1.3)) * (H - 2 * PAD)
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" />
        {items.map((it, i) => {
          const cx = PAD + bw * (i + 0.5)
          return (
            <g key={i}>
              <rect x={cx - 26} y={sy(it.v)} width="52" height={H - PAD - sy(it.v)} fill={it.c || '#2ab8eb'} opacity="0.8" rx="2" />
              {ci && <line x1={cx} y1={sy(it.v - it.ci)} x2={cx} y2={sy(it.v + it.ci)} stroke="#2a2f3a" strokeWidth="1.5" />}
              <text x={cx} y={sy(it.v) - 6} fill="#2a2f3a" fontSize="11" textAnchor="middle">{fmt(it.v)}</text>
              <text x={cx} y={H - PAD + 14} fill="#6b7280" fontSize="10" textAnchor="middle">{it.label}</text>
            </g>
          )
        })}
      </svg>
    )
  }

  const pct = (v) => (v * 100).toFixed(1) + '%'
  const body = [
    { chart: <Hist />, text: `2400 пользователей, выручка на пользователя. Распределение скошено вправо: среднее (${mean.toFixed(0)}) заметно выше медианы (${median}). Вывод: типичного пользователя честнее описывать медианой, а не средним.` },
    { chart: <Hist highlightOutliers />, text: `На полном диапазоне видны редкие выбросы (хвост до ${maxRev}). Это реальные крупные покупки, не ошибки. Решение: не удалять, но для «типичного» значения смотреть медиану и p95 (${p95}), а среднее использовать осторожно.` },
    { chart: <Bars items={[{ label: 'mobile', v: byDev('mobile') }, { label: 'desktop', v: byDev('desktop'), c: '#16a34a' }]} fmt={pct} />, text: `Конверсия сильно зависит от устройства: на desktop выше, чем на mobile. Это важный сегмент — если группы A/B случайно разбалансированы по устройству, сравнение исказится. Здесь рандомизация их уравняла.` },
    { chart: <Bars items={[{ label: 'A', v: cA, ci: ciHalf }, { label: 'B', v: cB, ci: ciHalf, c: '#16a34a' }]} fmt={pct} ci />, text: `A/B-итог (ATE): конверсия A = ${pct(cA)}, B = ${pct(cB)}. Разница ${pct(cB - cA)}, z = ${z.toFixed(2)}, p = ${pval < 0.001 ? '<0.001' : pval.toFixed(3)}. ${pval < 0.05 ? 'Значимо, и интервалы почти не перекрываются.' : 'Не значимо — интервалы перекрываются.'} Но средний эффект — ещё не вся правда.` },
    { chart: <Bars items={[
      { label: 'mob·A', v: conv(data.filter((d) => d.device === 'mobile' && d.group === 'A')), c: '#9ca3af' },
      { label: 'mob·B', v: conv(data.filter((d) => d.device === 'mobile' && d.group === 'B')), c: '#16a34a' },
      { label: 'desk·A', v: conv(data.filter((d) => d.device === 'desktop' && d.group === 'A')), c: '#9ca3af' },
      { label: 'desk·B', v: conv(data.filter((d) => d.device === 'desktop' && d.group === 'B')), c: '#dc4d4d' },
    ]} fmt={pct} />, text: `CATE по сегментам: на mobile B выше A (лифт ${(cate('mobile') * 100).toFixed(1)} п.п.), а на desktop B НИЖЕ A (${(cate('desktop') * 100).toFixed(1)} п.п.). Эффект разнонаправленный — средний ATE его прячет! Решение: катить B только на mobile, на desktop оставить A.` },
    { chart: null, text: `Итог разбора: 1) скошенные данные → медиана/перцентили; 2) выбросы реальны → не удалять; 3) ключевой сегмент — устройство; 4) ATE значим, но 5) CATE показывает разнонаправленный эффект — решение сегментное. Один датасет — почти весь курс: распределения, выбросы, сегменты, A/B, ATE/CATE, причинность.` },
  ]

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`text-xs px-2.5 py-1 rounded-md border ${step === i ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{i + 1}. {s}</button>
        ))}
      </div>
      {body[step].chart}
      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{body[step].text}</p>
      <div className="flex gap-2 mt-3">
        <button disabled={step === 0} onClick={() => setStep(step - 1)} className="text-sm px-3 py-1.5 rounded-md border border-black/15 text-gray-700 disabled:opacity-30 hover:bg-black/5">Назад</button>
        {step < STEPS.length - 1 && <button onClick={() => setStep(step + 1)} className="text-sm px-3 py-1.5 rounded-md border border-accent/40 text-cyanink hover:bg-accent/10">Дальше</button>}
      </div>
    </div>
  )
}
