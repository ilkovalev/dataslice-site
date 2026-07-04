import { useEffect, useRef, useState } from 'react'
import { useAutoRun, autoRunClass } from '../lib/useAutoRun.js'

// Закон больших чисел: доля орлов сходится к вероятности p по мере бросков.
const W = 640
const H = 260
const PAD = 40
const CAP = 2500 // авто-стоп, чтобы история не росла бесконечно

export default function CoinFlips() {
  const [p, setP] = useState(0.5)
  const [hist, setHist] = useState([]) // доля орлов после каждого броска
  const [heads, setHeads] = useState(0)
  const [n, setN] = useState(0)
  const timer = useRef(null)
  const pRef = useRef(p)
  pRef.current = p
  const acc = useRef({ h: 0, n: 0 }) // текущие счётчики для анимации
  acc.current.h = heads
  acc.current.n = n
  useEffect(() => () => clearInterval(timer.current), [])

  function flip(count) {
    clearInterval(timer.current)
    let h = heads
    let total = n
    const add = []
    for (let i = 0; i < count; i++) {
      total++
      if (Math.random() < p) h++
      add.push(h / total)
    }
    setHeads(h)
    setN(total)
    setHist((prev) => [...prev, ...add])
  }
  // Автопрогон: монета бросается сама, пока не остановишь (или до CAP).
  const [running, setRunning] = useAutoRun(() => {
    acc.current.n += 1
    if (Math.random() < pRef.current) acc.current.h += 1
    const { h, n: total } = acc.current
    setHeads(h)
    setN(total)
    setHist((prev) => [...prev, h / total])
  }, 45)
  useEffect(() => { if (n >= CAP) setRunning(false) }, [n, setRunning])
  function reset() {
    setRunning(false)
    clearInterval(timer.current)
    acc.current = { h: 0, n: 0 }
    setHist([])
    setHeads(0)
    setN(0)
  }

  const sx = (i) => PAD + (hist.length <= 1 ? 0 : (i / (hist.length - 1)) * (W - 2 * PAD))
  const sy = (v) => PAD + (1 - v) * (H - 2 * PAD)
  const d = hist.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')
  const prop = n ? heads / n : 0

  // частотная гистограмма исходов: доли орлов/решек против целей p и 1−p
  const HW = 260
  const HH = 150
  const HPAD = 30
  const bx = [0.32, 0.68].map((f) => HPAD + f * (HW - 2 * HPAD))
  const byBase = HH - HPAD
  const bh = (v) => v * (HH - 2 * HPAD - 8)
  const tailsProp = n ? 1 - prop : 0

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="space-y-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
          {[0, 0.5, 1].map((g) => (
            <g key={g}>
              <line x1={PAD} y1={sy(g)} x2={W - PAD} y2={sy(g)} stroke="#e7e1d4" strokeWidth="1" />
              <text x={PAD - 6} y={sy(g) + 3} fill="#6b7280" fontSize="10" textAnchor="end">{g}</text>
            </g>
          ))}
          <line x1={PAD} y1={sy(p)} x2={W - PAD} y2={sy(p)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" />
          <text x={W - PAD} y={sy(p) - 5} fill="#fbbf24" fontSize="10" textAnchor="end">вероятность p = {p.toFixed(2)}</text>
          {hist.length > 1 && <path d={d} fill="none" stroke="#2ab8eb" strokeWidth="2" />}
          <text x={PAD} y={14} fill="#6b7280" fontSize="10">бегущая доля орлов →</text>
        </svg>

        {/* частотная гистограмма исходов */}
        <svg viewBox={`0 0 ${HW} ${HH}`} className="w-full max-w-[320px] h-auto select-none">
          <text x={HW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">частоты исходов</text>
          <line x1={HPAD} y1={byBase} x2={HW - HPAD} y2={byBase} stroke="#d6cebf" strokeWidth="1.5" />
          {/* целевые доли p и 1−p */}
          {[[bx[0], p], [bx[1], 1 - p]].map(([x, t], i) => (
            <line key={i} x1={x - 26} y1={byBase - bh(t)} x2={x + 26} y2={byBase - bh(t)} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
          ))}
          <rect x={bx[0] - 22} y={byBase - bh(prop)} width="44" height={bh(prop)} fill="#2ab8eb" opacity="0.85" rx="2" />
          <rect x={bx[1] - 22} y={byBase - bh(tailsProp)} width="44" height={bh(tailsProp)} fill="#9ca3af" opacity="0.7" rx="2" />
          <text x={bx[0]} y={byBase + 14} fill="#2ab8eb" fontSize="11" textAnchor="middle">орёл {n ? (prop * 100).toFixed(0) + '%' : ''}</text>
          <text x={bx[1]} y={byBase + 14} fill="#6b7280" fontSize="11" textAnchor="middle">решка {n ? (tailsProp * 100).toFixed(0) + '%' : ''}</text>
        </svg>
      </div>

      <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-700">
        <span>Бросков: {n}</span>
        <span>Орлов: {heads}</span>
        <span className="text-[#2ab8eb]">Доля орлов: {n ? prop.toFixed(3) : '—'}</span>
        <span className="text-[#d9a300]">пунктир — цели p и 1−p</span>
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1">
          <span>Вероятность орла p</span>
          <span className="tabular-nums text-cyanink">{p.toFixed(2)}</span>
        </div>
        <input type="range" min="0.05" max="0.95" step="0.05" value={p} onChange={(e) => { setP(Number(e.target.value)); reset() }} className="w-full accent-accent" />
      </label>

      <div className="flex gap-2 mt-3">
        <button onClick={() => { setRunning(false); flip(10) }} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">+10 бросков</button>
        <button onClick={() => { setRunning(false); flip(100) }} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">+100 бросков</button>
        <button onClick={() => setRunning((r) => !r)} className={autoRunClass(running)}>{running ? '⏸ стоп' : '▶ автопрогон'}</button>
        <button onClick={reset} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">сбросить</button>
      </div>
    </div>
  )
}
