import { useState } from 'react'

// Переобучение: полином высокой степени проходит сквозь каждую точку обучения,
// но виляет и проваливается на новых данных. Ошибка на обучении падает,
// на тесте — U-образная.
const W = 520
const H = 320
const PAD = 32
// обучающие точки — выраженный зигзаг: высокая степень полинома гонится за ними
// и сильно виляет между ними. Тестовые точки лежат у плавной «истины» посередине,
// поэтому переобученная кривая проходит мимо них с заметным отрывом.
const TRAIN = [[5, 40], [15, 72], [25, 42], [35, 73], [45, 41], [55, 74], [65, 42], [75, 73], [85, 40], [95, 72]]
const TEST = [[10, 57], [30, 56], [50, 58], [70, 56], [90, 57]]

// решение СЛАУ методом Гаусса
function solve(A, b) {
  const n = b.length
  for (let i = 0; i < n; i++) {
    let piv = i
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r
    ;[A[i], A[piv]] = [A[piv], A[i]]
    ;[b[i], b[piv]] = [b[piv], b[i]]
    for (let r = 0; r < n; r++) {
      if (r === i || A[i][i] === 0) continue
      const f = A[r][i] / A[i][i]
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]
      b[r] -= f * b[i]
    }
  }
  return b.map((v, i) => (A[i][i] ? v / A[i][i] : 0))
}
const xs = (x) => (x - 50) / 50 // масштаб в [-1,1]
function polyfit(points, deg) {
  const m = deg + 1
  const A = Array.from({ length: m }, () => new Array(m).fill(0))
  const bb = new Array(m).fill(0)
  for (const [x, y] of points) {
    const t = xs(x)
    const pw = [1]
    for (let k = 1; k < 2 * m; k++) pw.push(pw[k - 1] * t)
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) A[i][j] += pw[i + j]
      bb[i] += pw[i] * y
    }
  }
  return solve(A, bb)
}
const evalp = (c, x) => { const t = xs(x); let s = 0; for (let i = c.length - 1; i >= 0; i--) s = s * t + c[i]; return s }
const mse = (c, pts) => pts.reduce((a, [x, y]) => a + (y - evalp(c, x)) ** 2, 0) / pts.length

export default function Overfitting() {
  const [deg, setDeg] = useState(8)
  const c = polyfit(TRAIN, deg)
  const sx = (x) => PAD + (x / 100) * (W - 2 * PAD)
  const sy = (y) => H - PAD - (Math.max(0, Math.min(100, y)) / 100) * (H - 2 * PAD)
  let d = ''
  for (let x = 0; x <= 100; x += 1) d += `${x === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(evalp(c, x)).toFixed(1)} `
  const eTrain = mse(c, TRAIN)
  const eTest = mse(c, TEST)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <path d={d} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        {TRAIN.map(([x, y], i) => <circle key={`tr${i}`} cx={sx(x)} cy={sy(y)} r="6" fill="#2a2f3a" stroke="#ffffff" strokeWidth="2" />)}
        {TEST.map(([x, y], i) => <circle key={`te${i}`} cx={sx(x)} cy={sy(y)} r="6" fill="#fbbf24" />)}
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-gray-700">⚪ обучение</span>
        <span className="text-[#fbbf24]">🟡 новые данные (тест)</span>
      </div>
      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-[#2ab8eb]">Ошибка на обучении: {eTrain.toFixed(0)}</span>
        <span className="text-[#fbbf24]">Ошибка на новых данных: {eTest.toFixed(0)}</span>
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Сложность модели (степень полинома)</span><span className="tabular-nums text-cyanink">{deg}</span></div>
        <input type="range" min="1" max="9" step="1" value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="w-full accent-accent" />
      </label>
    </div>
  )
}
