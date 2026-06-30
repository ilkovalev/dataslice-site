import { useState } from 'react'

// Основы вероятности на кубике (6 исходов). Кликами задаём события A и B,
// видим их на диаграмме Венна и считаем P(A), P(B), P(A∪B), P(A∩B).
// highlight из бита фокусирует урок: 'complement' (не A), 'independence'.
const OUT = [1, 2, 3, 4, 5, 6]
const VW = 440
const VH = 250

export default function EventsProbability({ highlight }) {
  const [a, setA] = useState([false, true, false, true, false, true]) // чётные
  const [b, setB] = useState([false, false, false, true, true, true]) // >3

  const toggle = (set, fn, i) => fn(set.map((v, k) => (k === i ? !v : v)))
  const count = (s) => s.filter(Boolean).length
  const pA = count(a) / 6
  const pB = count(b) / 6
  const inter = a.map((v, i) => v && b[i])
  const union = a.map((v, i) => v || b[i])
  const pInter = count(inter) / 6
  const pUnion = count(union) / 6
  const indep = Math.abs(pInter - pA * pB) < 1e-9
  const showIndep = highlight === 'independence'
  const showCompl = highlight === 'complement'

  const region = (i) => (a[i] && b[i] ? 'both' : a[i] ? 'aOnly' : b[i] ? 'bOnly' : 'none')
  const colorOf = { both: '#16a34a', aOnly: '#2ab8eb', bOnly: '#d99a06', none: '#9ca3af' }

  // раскладка чисел по областям Венна
  const cy = 108
  const r = 80
  const cxA = 168
  const cxB = 272
  const centroids = { aOnly: [cxA - 36, cy], both: [(cxA + cxB) / 2, cy], bOnly: [cxB + 36, cy], none: [(cxA + cxB) / 2, cy + r + 28] }
  const placed = {}
  OUT.forEach((v, i) => { const reg = region(i); (placed[reg] ||= []).push(v) })

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {/* Как пользоваться */}
      <div className="rounded-lg border border-black/10 bg-ink/60 px-3 py-2 mb-3 text-xs text-gray-600 leading-snug">
        <span className="text-gray-800 font-medium">Как пользоваться.</span> Внизу 6 клеток — это исходы броска кубика (1–6). Под каждой клеткой две кнопки: нажмите <span className="text-cyanink font-medium">A</span>, чтобы включить исход в событие A, и <span className="text-amber-600 font-medium">B</span> — в событие B. Диаграмма Венна сверху сразу показывает, куда попал каждый исход.
      </div>

      {/* Диаграмма Венна */}
      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto select-none">
        <text x={cxA - r + 6} y={26} fill="#0d7fb0" fontSize="12" fontWeight="700" textAnchor="middle">событие A</text>
        <text x={cxB + r - 6} y={26} fill="#b8830a" fontSize="12" fontWeight="700" textAnchor="middle">событие B</text>
        <circle cx={cxA} cy={cy} r={r} fill="#2ab8eb" fillOpacity="0.16" stroke="#2ab8eb" strokeWidth={showCompl ? 2.5 : 1.5} strokeDasharray={showCompl ? '5 3' : ''} />
        <circle cx={cxB} cy={cy} r={r} fill="#fbbf24" fillOpacity="0.18" stroke="#d99a06" strokeWidth="1.5" />
        {/* числа по областям */}
        {Object.entries(placed).map(([reg, nums]) => {
          const [cxc, cyc] = centroids[reg]
          const start = cxc - (nums.length - 1) * 13
          return nums.map((v, j) => (
            <text key={`${reg}-${v}`} x={start + j * 26} y={cyc + 6} fill={colorOf[reg]} fontSize="18" fontWeight="700" textAnchor="middle">{v}</text>
          ))
        })}
        {placed.none && <text x={centroids.none[0]} y={centroids.none[1] + 22} fill="#9ca3af" fontSize="10" textAnchor="middle">ни A, ни B</text>}
      </svg>

      {/* Легенда */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3">
        <span className="text-cyanink">● только A</span>
        <span className="text-[#b8830a]">● только B</span>
        <span className="text-green-600">● A и B (пересечение)</span>
        <span className="text-gray-400">● ни то, ни другое</span>
      </div>

      {/* Кубик с переключателями A/B */}
      <div className="text-xs text-gray-500 mb-1.5">Исходы кубика — нажимайте кнопки A / B под каждым:</div>
      <div className="grid grid-cols-6 gap-2">
        {OUT.map((v, i) => (
          <div key={v} className="text-center">
            <div
              className="rounded-lg h-11 flex items-center justify-center text-lg font-semibold text-gray-900"
              style={{ background: colorOf[region(i)], opacity: a[i] || b[i] ? 0.8 : 0.35, outline: showCompl && !a[i] ? '2px dashed #6b7280' : 'none', outlineOffset: '1px' }}
            >{v}</div>
            <div className="flex gap-1 mt-1 justify-center">
              <button onClick={() => toggle(a, setA, i)} className={`text-[10px] px-1.5 py-0.5 rounded border ${a[i] ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-500'}`}>A</button>
              <button onClick={() => toggle(b, setB, i)} className={`text-[10px] px-1.5 py-0.5 rounded border ${b[i] ? 'border-amber-400/60 text-amber-600 bg-amber-400/15' : 'border-black/10 text-gray-500'}`}>B</button>
            </div>
          </div>
        ))}
      </div>

      {/* Вероятности */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-sm">
        <span className="text-cyanink">P(A) = {count(a)}/6 = {pA.toFixed(2)}</span>
        <span className="text-[#b8830a]">P(B) = {count(b)}/6 = {pB.toFixed(2)}</span>
        <span className="text-green-600">P(A∩B) = {count(inter)}/6 = {pInter.toFixed(2)}</span>
        <span className="text-gray-700">P(A∪B) = {count(union)}/6 = {pUnion.toFixed(2)}</span>
      </div>

      {/* Формула — фокус задаётся битом */}
      <div className="mt-3 rounded-lg border border-black/10 bg-ink px-3 py-2 text-sm space-y-1">
        {showCompl && (
          <div className="font-mono text-gray-700">P(не A) = 1 − P(A) = 1 − {pA.toFixed(2)} = {(1 - pA).toFixed(2)} <span className="text-gray-500">(клетки с пунктиром)</span></div>
        )}
        <div className="font-mono text-gray-700">P(A∪B) = P(A) + P(B) − P(A∩B) = {pA.toFixed(2)} + {pB.toFixed(2)} − {pInter.toFixed(2)} = {pUnion.toFixed(2)}</div>
        {showIndep && (
          <div className="font-mono text-gray-700">P(A∩B) = {pInter.toFixed(2)} {indep ? '=' : '≠'} P(A)·P(B) = {(pA * pB).toFixed(2)} → <span className={indep ? 'text-green-600' : 'text-[#dc4d4d]'}>{indep ? 'независимы' : 'зависимы'}</span></div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">Кликайте A/B под исходами, чтобы менять события — диаграмма и числа пересчитываются вживую. На Венне: левый серп — только A, правый — только B, линза посередине — пересечение (A и B), снаружи — исходы вне обоих событий.</p>
    </div>
  )
}
