import { useMemo, useState } from 'react'

// Последовательный тест «честного подглядывания». В отличие от урока про
// подглядывание (где линия p-value просто блуждает под плоским порогом), здесь
// данные набираются ПО НЕДЕЛЯМ, а решение об остановке сверяется с границей,
// которая заранее заложила цену многократных проверок. Сравниваем три границы:
//   • наивный порог |Z| ≥ 1.96 на каждой проверке — ложные остановки раздуваются;
//   • Pocock — постоянный, но поднятый порог;
//   • O'Brien–Fleming — очень строгий в начале, смягчается к финалу.
// Значения границ — стандартные табличные для K=5 проверок, α=0.05 (двусторонний).
const W = 560
const H = 240
const PAD = 46
const TOP = 20
const BASE = H - 34
const K = 5 // число промежуточных проверок (недель)
const ZCAP = 5
const DRIFT = 1.05 // сила реального эффекта (сдвиг за неделю), когда «эффект есть»

const BOUNDS = {
  naive: { label: 'наивный порог 0.05', color: '#f87171', crit: () => 1.96 },
  pocock: { label: 'Pocock', color: '#0d7fb0', crit: () => 2.413 },
  obf: { label: "O'Brien–Fleming", color: '#16a34a', crit: (k) => 2.04 * Math.sqrt(K / k) },
}

function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return x >= 0 ? y : -y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
function gauss() {
  let u = 0, v = 0
  while (!u) u = Math.random()
  while (!v) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// один эксперимент: кумулятивный Z по неделям. Под H0 Z_k = (Σ e)/√k;
// при эффекте добавляется дрейф g·√k. Возвращает массив Z по неделям 1..K.
function simulate(effect) {
  let s = 0
  const zs = []
  for (let k = 1; k <= K; k++) {
    s += gauss()
    zs.push(s / Math.sqrt(k) + (effect ? DRIFT : 0) * Math.sqrt(k))
  }
  return zs
}
// первая неделя, где |Z| пробил границу type (или null)
function crossWeek(zs, type) {
  for (let k = 1; k <= zs.length; k++) if (Math.abs(zs[k - 1]) >= BOUNDS[type].crit(k)) return k
  return null
}

export default function SequentialTest() {
  const [type, setType] = useState('obf')
  const [effect, setEffect] = useState(true)
  const [zs, setZs] = useState([]) // раскрытые недели текущего эксперимента
  const [full, setFull] = useState(() => simulate(true)) // весь заготовленный прогон
  const [tally, setTally] = useState({ naive: 0, pocock: 0, obf: 0, total: 0 })

  function newRun(eff = effect) { setFull(simulate(eff)); setZs([]) }
  function nextWeek() {
    if (zs.length >= K) return
    setZs(full.slice(0, zs.length + 1))
  }
  function toggleEffect(e) { setEffect(e); setFull(simulate(e)); setZs([]) }
  function runAA(n) {
    let na = 0, po = 0, ob = 0
    for (let i = 0; i < n; i++) {
      const s = simulate(false) // A/A: эффекта нет
      if (crossWeek(s, 'naive')) na++
      if (crossWeek(s, 'pocock')) po++
      if (crossWeek(s, 'obf')) ob++
    }
    setTally((t) => ({ naive: t.naive + na, pocock: t.pocock + po, obf: t.obf + ob, total: t.total + n }))
  }
  const reset = () => { setZs([]); setTally({ naive: 0, pocock: 0, obf: 0, total: 0 }) }

  const sx = (k) => PAD + ((k - 1) / (K - 1)) * (W - 2 * PAD)
  const syZ = (z) => BASE - (Math.min(Math.abs(z), ZCAP) / ZCAP) * (BASE - TOP)
  const boundPath = useMemo(() => {
    const paths = {}
    for (const key of Object.keys(BOUNDS)) {
      let d = ''
      for (let k = 1; k <= K; k++) d += `${k === 1 ? 'M' : 'L'}${sx(k).toFixed(1)},${syZ(BOUNDS[key].crit(k)).toFixed(1)} `
      paths[key] = d
    }
    return paths
  }, [])

  const runPath = zs.map((z, i) => `${i === 0 ? 'M' : 'L'}${sx(i + 1).toFixed(1)},${syZ(z).toFixed(1)}`).join(' ')
  const cross = crossWeek(zs, type)
  const lastZ = zs.length ? zs[zs.length - 1] : null
  const naiveP = lastZ != null ? 2 * (1 - cdf(Math.abs(lastZ))) : null
  const done = zs.length >= K
  const pct = (v) => (tally.total ? ((v / tally.total) * 100).toFixed(0) + '%' : '—')

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* сетка недель */}
        {Array.from({ length: K }, (_, i) => i + 1).map((k) => (
          <text key={k} x={sx(k)} y={BASE + 16} fill="#9ca3af" fontSize="10" textAnchor="middle">нед. {k}</text>
        ))}
        <line x1={PAD} y1={BASE} x2={W - PAD} y2={BASE} stroke="#d6cebf" strokeWidth="1.5" />
        <text x={PAD} y={12} fill="#6b7280" fontSize="10" textAnchor="start">|Z| — накопленная статистика ↑</text>

        {/* границы: выбранная ярко, остальные бледно */}
        {Object.entries(BOUNDS).map(([key, b]) => (
          <path key={key} d={boundPath[key]} fill="none" stroke={b.color}
            strokeWidth={key === type ? 2.2 : 1.2} strokeDasharray="5 4"
            opacity={key === type ? 1 : 0.28} />
        ))}
        <text x={W - PAD} y={syZ(BOUNDS[type].crit(K)) - 5} fill={BOUNDS[type].color} fontSize="10" textAnchor="end">
          граница: {BOUNDS[type].label}
        </text>

        {/* путь текущего эксперимента */}
        {zs.length > 0 && <path d={runPath} fill="none" stroke="#2a2f3a" strokeWidth="2" />}
        {zs.map((z, i) => (
          <circle key={i} cx={sx(i + 1)} cy={syZ(z)} r="3.5"
            fill={cross && i + 1 === cross ? BOUNDS[type].color : '#2a2f3a'} />
        ))}
        {cross && (
          <text x={sx(cross)} y={syZ(zs[cross - 1]) - 8} fill={BOUNDS[type].color} fontSize="10" textAnchor="middle">
            остановка ✓
          </text>
        )}
      </svg>

      {/* выбор границы */}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <span className="text-xs text-gray-600 mr-1">Граница:</span>
        {Object.entries(BOUNDS).map(([key, b]) => (
          <button key={key} onClick={() => setType(key)}
            className={`text-xs px-2.5 py-1 rounded border ${type === key ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>
            {b.label}
          </button>
        ))}
      </div>

      {/* сценарий данных */}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="text-xs text-gray-600 mr-1">Данные:</span>
        <button onClick={() => toggleEffect(false)} className={`text-xs px-2.5 py-1 rounded border ${!effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>эффекта нет (A/A)</button>
        <button onClick={() => toggleEffect(true)} className={`text-xs px-2.5 py-1 rounded border ${effect ? 'border-accent/50 text-cyanink bg-accent/15' : 'border-black/10 text-gray-600 hover:bg-black/5'}`}>эффект есть</button>
      </div>

      {/* читаемый статус текущего эксперимента */}
      <div className="mt-2 text-sm text-gray-700 min-h-[2.5rem]">
        {zs.length === 0
          ? <>Набирайте данные по неделям кнопкой «+1 неделя» и следите, пробьёт ли <b>|Z|</b> выбранную границу.</>
          : cross
            ? <span style={{ color: BOUNDS[type].color }}>Неделя {cross}: |Z| = {Math.abs(zs[cross - 1]).toFixed(2)} пробил границу {BOUNDS[type].label} → можно честно остановиться{effect ? ' на реальном эффекте.' : '. Но эффекта нет — это ложная остановка (у наивного порога такое случается заметно чаще).'}</span>
            : done
              ? <>Дошли до конца (нед. {K}): |Z| = {Math.abs(lastZ).toFixed(2)}, границу не пробили → эффект {effect ? 'не набрал значимости к сроку.' : 'не подтверждён — верное решение.'}</>
              : <>Неделя {zs.length}: |Z| = {Math.abs(lastZ).toFixed(2)}, наивный p = {naiveP.toFixed(3)}. Граница {BOUNDS[type].label} = {BOUNDS[type].crit(zs.length).toFixed(2)} — пока не пробита, продолжаем.</>}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <button onClick={nextWeek} disabled={done || !!cross} className="text-xs px-3 py-1 rounded-md bg-accent text-white disabled:opacity-30 hover:opacity-90">+1 неделя данных</button>
        <button onClick={() => newRun()} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">новый эксперимент</button>
      </div>

      {/* многократный прогон под A/A: доля ложных остановок по каждой границе */}
      <div className="mt-4 rounded-lg border border-black/10 bg-ink/40 p-3">
        <div className="text-xs text-gray-600 mb-2">Прогон под A/A (эффекта нет): как часто граница ложно срабатывает хоть на одной из {K} проверок. Честная цель — около 5%.</div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span className="text-[#f87171]">наивный 0.05: {pct(tally.naive)}</span>
          <span className="text-[#0d7fb0]">Pocock: {pct(tally.pocock)}</span>
          <span className="text-[#16a34a]">O'Brien–Fleming: {pct(tally.obf)}</span>
          <span className="text-gray-500">(прогонов: {tally.total})</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => runAA(50)} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-700 hover:bg-black/5">прогнать 50 A/A</button>
          <button onClick={reset} className="text-xs px-2.5 py-1 rounded border border-black/15 text-gray-600 hover:bg-black/5">сбросить</button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">Ось — накопленная статистика |Z| по неделям. Наивный порог 1.96 проверяется на каждой неделе, поэтому под A/A ложные остановки раздуваются далеко за 5%. Pocock поднимает порог до постоянного уровня, O'Brien–Fleming делает его очень строгим в начале и почти обычным к финалу — оба удерживают общий риск около 5%, но при этом позволяют законно остановиться раньше, если эффект силён. Значения границ — стандартные табличные для {K} проверок.</p>
    </div>
  )
}
