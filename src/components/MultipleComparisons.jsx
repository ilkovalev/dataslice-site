import { useMemo, useState } from 'react'

// Множественные сравнения. Проверяем m гипотез, из которых часть реально
// работает. Показываем два подхода к контролю ошибок:
//   • FWER (Бонферрони, порог α/m) — держит вероятность ХОТЯ БЫ ОДНОГО ложного
//     открытия ≤ α; очень строг, гасит и настоящие находки.
//   • FDR (Бенджамини–Хохберг) — держит ожидаемую ДОЛЮ ложных среди найденного;
//     мягче, находит больше настоящих эффектов ценой редких ложных.
// Правый график — «лесенка» BH: отсортированные p против линии i·α/m.
const ALPHA = 0.05
const M_TRUE_EFFECT = 2.8 // сила настоящего эффекта (сдвиг z), даёт малые p

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
function randn() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) }

// BH: наибольший ранг k (по возр. p), где p(k) ≤ k/m·α; отвергаем ранги ≤ k
function bhCutoffRank(sortedP, m) {
  let k = 0
  for (let i = 1; i <= m; i++) if (sortedP[i - 1] <= (i / m) * ALPHA) k = i
  return k
}

export default function MultipleComparisons({ locale = 'ru' }) {
  const en = locale === 'en'
  const [m, setM] = useState(20)
  const [nTrue, setNTrue] = useState(0)
  const [mode, setMode] = useState('none') // none | bonf | bh
  const [tests, setTests] = useState([])

  function run() {
    const real = Math.min(nTrue, m)
    const arr = Array.from({ length: m }, (_, i) => {
      const isTrue = i < real
      const z = (isTrue ? M_TRUE_EFFECT : 0) + randn()
      return { p: 1 - cdf(z), isTrue } // односторонний p
    })
    // перемешаем, чтобы истинные не кучковались в сетке
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]] }
    setTests(arr)
  }

  const analysis = useMemo(() => {
    if (!tests.length) return null
    const sortedP = tests.map((t) => t.p).sort((a, b) => a - b)
    const bhK = bhCutoffRank(sortedP, tests.length)
    const bhThr = bhK > 0 ? (bhK / tests.length) * ALPHA : 0
    const bonfThr = ALPHA / tests.length
    const reject = (t) => mode === 'none' ? t.p < ALPHA : mode === 'bonf' ? t.p < bonfThr : t.p <= bhThr
    const marked = tests.map((t) => ({ ...t, rej: reject(t) }))
    const TP = marked.filter((t) => t.rej && t.isTrue).length
    const FP = marked.filter((t) => t.rej && !t.isTrue).length
    const FN = marked.filter((t) => !t.rej && t.isTrue).length
    const rejected = TP + FP
    const fdr = rejected ? FP / rejected : 0
    return { marked, sortedP, bhK, bhThr, bonfThr, TP, FP, FN, rejected, fdr }
  }, [tests, mode])

  const cols = 10
  const colorOf = (t) => t.rej ? (t.isTrue ? '#16a34a' : '#f87171') : (t.isTrue ? '#f59e0b' : 'rgba(0,0,0,0.10)')

  // правый график: лесенка BH
  const CW = 300, CH = 210, CP = 34
  const yCap = 0.25
  const sx = (i) => CP + ((i - 1) / Math.max(1, m - 1)) * (CW - 2 * CP)
  const syc = (p) => CH - 24 - (Math.min(p, yCap) / yCap) * (CH - 24 - 16)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      {/* выбор поправки */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-600 mr-1">{en ? 'Correction:' : 'Поправка:'}</span>
        <button onClick={() => setMode('none')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'none' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'no correction' : 'без поправки'}</button>
        <button onClick={() => setMode('bonf')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'bonf' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'Bonferroni (FWER)' : 'Бонферрони (FWER)'}</button>
        <button onClick={() => setMode('bh')} className={`text-xs px-2.5 py-1 rounded-md border ${mode === 'bh' ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>{en ? 'Benjamini–Hochberg (FDR)' : 'Бенджамини–Хохберг (FDR)'}</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start">
        {/* сетка гипотез */}
        <div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: 320 }}>
            {!analysis
              ? Array.from({ length: m }).map((_, i) => <div key={i} className="aspect-square rounded bg-black/5" />)
              : analysis.marked.map((t, i) => (
                <div key={i} className="aspect-square rounded" style={{ background: colorOf(t) }} title={`p = ${t.p.toFixed(3)}${t.isTrue ? (en ? ' · real effect' : ' · реальный эффект') : ''}`} />
              ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px]">
            <span className="text-[#16a34a]">■ {en ? 'true discovery' : 'верное открытие'}</span>
            <span className="text-[#f87171]">■ {en ? 'false discovery' : 'ложное открытие'}</span>
            <span className="text-[#d9920a]">■ {en ? 'missed effect' : 'пропущенный эффект'}</span>
            <span className="text-gray-500">■ {en ? 'correctly rejected' : 'верно отклонено'}</span>
          </div>
        </div>

        {/* график BH */}
        <div>
          <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto select-none">
            <text x={CW / 2} y={12} fill="#6b7280" fontSize="10" textAnchor="middle">{en ? 'sorted p-values and the threshold:' : 'отсортированные p и порог:'} {mode === 'none' ? (en ? 'no correction' : 'без поправки') : mode === 'bonf' ? (en ? 'Bonferroni' : 'Бонферрони') : (en ? 'Benjamini–Hochberg' : 'Бенджамини–Хохберг')}</text>
            <line x1={CP} y1={CH - 24} x2={CW - CP} y2={CH - 24} stroke="#d6cebf" strokeWidth="1" />
            <line x1={CP} y1={16} x2={CP} y2={CH - 24} stroke="#d6cebf" strokeWidth="1" />
            {/* порог ТОЛЬКО активного режима */}
            {mode === 'none' && <>
              <line x1={CP} y1={syc(ALPHA)} x2={CW - CP} y2={syc(ALPHA)} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={CW - CP} y={syc(ALPHA) - 3} fill="#9ca3af" fontSize="9" textAnchor="end">α = 0.05</text>
            </>}
            {mode === 'bonf' && analysis && <>
              <line x1={CP} y1={syc(analysis.bonfThr)} x2={CW - CP} y2={syc(analysis.bonfThr)} stroke="#0d7fb0" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={CW - CP} y={syc(analysis.bonfThr) - 3} fill="#0d7fb0" fontSize="9" textAnchor="end">{en ? 'threshold α/m =' : 'порог α/m ='} {analysis.bonfThr.toFixed(4)}</text>
            </>}
            {mode === 'bh' && <>
              <line x1={sx(1)} y1={syc((1 / m) * ALPHA)} x2={sx(m)} y2={syc(ALPHA)} stroke="#16a34a" strokeWidth="1.6" />
              <text x={sx(m)} y={syc(ALPHA) + 12} fill="#16a34a" fontSize="9" textAnchor="end">{en ? 'staircase i·α/m' : 'лесенка i·α/m'}</text>
              {analysis && analysis.bhK > 0 && (
                <line x1={sx(analysis.bhK) + 3} y1={16} x2={sx(analysis.bhK) + 3} y2={CH - 24} stroke="#16a34a" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              )}
            </>}
            {/* отсортированные p-value, окрашены по текущему режиму */}
            {analysis && analysis.sortedP.map((p, i) => {
              const rank = i + 1
              const rej = mode === 'none' ? p < ALPHA : mode === 'bonf' ? p < analysis.bonfThr : analysis.bhK > 0 && rank <= analysis.bhK
              return <circle key={i} cx={sx(rank)} cy={syc(p)} r="2.6" fill={rej ? '#16a34a' : '#9ca3af'} opacity="0.85" />
            })}
            <text x={CP} y={CH - 8} fill="#9ca3af" fontSize="9" textAnchor="start">{en ? 'rank i (ascending p) →   ● green — rejected' : 'ранг i (по возрастанию p) →   ● зелёные — отвергнуты'}</text>
          </svg>
        </div>
      </div>

      {analysis && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[#16a34a]">{en ? 'true discoveries:' : 'верных открытий:'} {analysis.TP} {en ? 'of' : 'из'} {Math.min(nTrue, m)}</span>
          <span className="text-[#f87171]">{en ? 'false:' : 'ложных:'} {analysis.FP}</span>
          <span className="text-[#d9920a]">{en ? 'missed:' : 'пропущено:'} {analysis.FN}</span>
          <span className="text-gray-600">{en ? 'share of false among the found (FDR):' : 'доля ложных среди найденного (FDR):'} {analysis.rejected ? (analysis.fdr * 100).toFixed(0) + '%' : '—'}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3 mt-4 text-sm">
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Number of hypotheses m' : 'Число гипотез m'}</span><span className="text-cyanink">{m}</span></div>
          <input type="range" min="10" max="100" step="5" value={m} onChange={(e) => { setM(Number(e.target.value)); setTests([]) }} className="w-full accent-accent" />
        </label>
        <label>
          <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'How many truly work' : 'Из них реально работают'}</span><span className="text-cyanink">{Math.min(nTrue, m)}</span></div>
          <input type="range" min="0" max="30" step="1" value={nTrue} onChange={(e) => { setNTrue(Number(e.target.value)); setTests([]) }} className="w-full accent-accent" />
        </label>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={run} className="text-xs px-3 py-1 rounded-md bg-cyanink text-white hover:opacity-90">{en ? 'run the tests' : 'запустить тесты'}</button>
        <button onClick={() => setTests([])} className="text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-600 hover:bg-black/5">{en ? 'reset' : 'сбросить'}</button>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-3">{en
        ? 'Without a correction, "significant" passes for both real effects and ~5% of the empty ones (red). Bonferroni (FWER) lowers the threshold to α/m — the false ones nearly vanish, but real findings die with them (lots of orange "missed"). Benjamini–Hochberg (FDR) bounds not "zero errors" but the share of false among the found: the threshold is the point where the i·α/m staircase stops covering the sorted p-values — it usually catches more real effects at a controlled share of false ones.'
        : 'Без поправки «значимо» проходят и настоящие эффекты, и ~5% пустых (красные). Бонферрони (FWER) опускает порог до α/m — ложные почти исчезают, но вместе с ними гаснут и настоящие находки (много оранжевых «пропущено»). Бенджамини–Хохберг (FDR) держит не «ноль ошибок», а долю ложных среди найденного: порог — точка, где лесенкой i·α/m перестаёт накрывать отсортированные p, — обычно ловит больше настоящих эффектов при контролируемой доле ложных.'}</p>
    </div>
  )
}
