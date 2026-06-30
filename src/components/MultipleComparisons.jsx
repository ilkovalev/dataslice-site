import { useState } from 'react'

// Множественные сравнения: если проверить много гипотез (все пустые),
// часть «значима» случайно. Поправка Бонферрони ужесточает порог.
export default function MultipleComparisons() {
  const [n, setN] = useState(20)
  const [tests, setTests] = useState([])
  const [bonf, setBonf] = useState(false)

  const run = () => setTests(Array.from({ length: n }, () => Math.random()))
  const thr = bonf ? 0.05 / n : 0.05
  const fp = tests.filter((p) => p < thr).length
  const cols = 10

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: 360 }}>
        {tests.length === 0
          ? Array.from({ length: n }).map((_, i) => <div key={i} className="aspect-square rounded bg-black/5" />)
          : tests.map((p, i) => (
            <div key={i} className={`aspect-square rounded ${p < thr ? 'bg-[#f87171]' : 'bg-black/10'}`} title={`p = ${p.toFixed(3)}`} />
          ))}
      </div>

      <div className="mt-3 text-sm">
        {tests.length > 0 && (
          <span className={fp ? 'text-[#f87171]' : 'text-gray-600'}>
            «Значимых» (p &lt; {thr.toFixed(bonf ? 4 : 2)}): <span className="font-semibold">{fp}</span> из {n} — а ведь реального эффекта нет ни в одном.
          </span>
        )}
      </div>

      <label className="block mt-4 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>Число проверяемых гипотез</span><span className="text-cyanink">{n}</span></div>
        <input type="range" min="5" max="100" step="5" value={n} onChange={(e) => { setN(Number(e.target.value)); setTests([]) }} className="w-full accent-accent" />
      </label>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <button onClick={run} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">запустить тесты</button>
        <label className="text-xs text-gray-600 flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={bonf} onChange={(e) => setBonf(e.target.checked)} className="accent-accent" />
          поправка Бонферрони (порог 0.05/n)
        </label>
      </div>
    </div>
  )
}
