import { useState } from 'react'

// Двухфакторная ANOVA: фактор A (контроль/тест) по оси X, фактор B — две линии
// (mobile/desktop). Параллельные линии = взаимодействия нет; расходящиеся/
// пересекающиеся = есть взаимодействие (эффект A зависит от B).
const W = 460
const H = 260
const PAD = 44

export default function InteractionPlot({ locale = 'ru' }) {
  const en = locale === 'en'
  const [effA, setEffA] = useState(0.04) // главный эффект A (сдвиг при переходе контроль→тест)
  const [inter, setInter] = useState(0.08) // сила взаимодействия

  // y(device, group): device 0 = mobile (низкая база), 1 = desktop (выше)
  // group 0 = контроль, 1 = тест. Взаимодействие: на desktop эффект A меньше/обратный.
  const y = (device, group) => 0.10 + 0.06 * device + effA * group - inter * device * group
  const sx = (group) => PAD + group * (W - 2 * PAD)
  const sy = (v) => H - PAD - ((v - 0.04) / 0.22) * (H - 2 * PAD)
  const lines = [
    { dev: 0, label: 'mobile', c: '#2ab8eb' },
    { dev: 1, label: 'desktop', c: '#16a34a' },
  ]
  const interMag = Math.abs(inter)
  const verdict = interMag < 0.015
    ? (en ? 'the lines are nearly parallel → no interaction' : 'линии почти параллельны → взаимодействия нет')
    : interMag < 0.06
      ? (en ? 'the lines diverge → a weak interaction' : 'линии расходятся → слабое взаимодействие')
      : (en ? 'the lines diverge sharply/cross → a strong interaction' : 'линии сильно расходятся/пересекаются → сильное взаимодействие')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        {lines.map((l) => (
          <g key={l.dev}>
            <line x1={sx(0)} y1={sy(y(l.dev, 0))} x2={sx(1)} y2={sy(y(l.dev, 1))} stroke={l.c} strokeWidth="2.5" />
            <circle cx={sx(0)} cy={sy(y(l.dev, 0))} r="4" fill={l.c} />
            <circle cx={sx(1)} cy={sy(y(l.dev, 1))} r="4" fill={l.c} />
            <text x={sx(1) + 6} y={sy(y(l.dev, 1)) + 4} fill={l.c} fontSize="11">{l.label}</text>
          </g>
        ))}
        <text x={sx(0)} y={H - PAD + 16} fill="#6b7280" fontSize="11" textAnchor="middle">{en ? 'control' : 'контроль'}</text>
        <text x={sx(1)} y={H - PAD + 16} fill="#6b7280" fontSize="11" textAnchor="middle">{en ? 'test (B)' : 'тест (B)'}</text>
        <text x={PAD} y={PAD - 8} fill="#9a907c" fontSize="10" textAnchor="start">{en ? 'conversion' : 'конверсия'}</text>
      </svg>

      <div className="text-sm text-gray-700 mt-1">{verdict}</div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Main effect of A (test vs control)' : 'Главный эффект A (тест vs контроль)'}</span><span className="text-cyanink">{(effA * 100).toFixed(0)} {en ? 'pp' : 'п.п.'}</span></div>
          <input type="range" min="-0.02" max="0.1" step="0.01" value={effA} onChange={(e) => setEffA(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Interaction A×B' : 'Взаимодействие A×B'}</span><span className="text-cyanink">{(inter * 100).toFixed(0)} {en ? 'pp' : 'п.п.'}</span></div>
          <input type="range" min="0" max="0.14" step="0.01" value={inter} onChange={(e) => setInter(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'Set the interaction to 0 — the lines become parallel: the test’s effect is the same on mobile and desktop. Increase it — the lines diverge and may cross: on mobile the test helps, on desktop it hurts. A significant interaction = the "average effect" lies; look by segment.'
        : 'Поставьте взаимодействие в 0 — линии станут параллельны: эффект теста одинаков на mobile и desktop. Увеличьте — линии расходятся и могут пересечься: на mobile тест помогает, на desktop вредит. Значимое взаимодействие = «средний эффект» врёт, нужно смотреть по сегментам.'}</p>
    </div>
  )
}
