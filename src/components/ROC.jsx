import { useMemo, useState } from 'react'

// ROC-кривая: для всех порогов сразу — доля пойманного спама (TPR) против
// доли ложных срабатываний (FPR). Площадь под кривой (залита) = AUC. Ползунок
// «разделимость» меняет, насколько классы различимы → AUC растёт/падает.
const W = 360
const H = 360
const PAD = 42
const HAM0 = [-18, -14, -11, -9, -7, -5, -3, -1, 2, 5, 8, 12]
const SPAM0 = [-12, -8, -5, -2, 1, 3, 5, 7, 10, 13, 17, 22]

export default function ROC() {
  const [thr, setThr] = useState(50)
  const [sep, setSep] = useState(8)
  const { HAM, SPAM } = useMemo(() => ({
    HAM: HAM0.map((v) => Math.max(2, Math.min(98, 45 + v - sep))),
    SPAM: SPAM0.map((v) => Math.max(2, Math.min(98, 55 + v + sep))),
  }), [sep])

  const sx = (v) => PAD + v * (W - 2 * PAD)
  const sy = (v) => H - PAD - v * (H - 2 * PAD)
  const rates = (t) => ({
    tpr: SPAM.filter((s) => s >= t).length / SPAM.length,
    fpr: HAM.filter((s) => s >= t).length / HAM.length,
  })

  const pts = []
  for (let t = 100; t >= 0; t -= 1) pts.push(rates(t))
  let auc = 0
  for (let i = 1; i < pts.length; i++) auc += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.fpr).toFixed(1)},${sy(p.tpr).toFixed(1)}`).join(' ')
  // площадь под кривой (заливка до оси FPR)
  const area = `${line} L${sx(pts[pts.length - 1].fpr).toFixed(1)},${sy(0)} L${sx(0)},${sy(0)} Z`
  const cur = rates(thr)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm mx-auto h-auto select-none">
        <path d={area} fill="#2ab8eb" opacity="0.12" />
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d6cebf" strokeWidth="1.5" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke="#6b7280" strokeWidth="1" strokeDasharray="4 4" />
        <path d={line} fill="none" stroke="#2ab8eb" strokeWidth="2" />
        {/* проекции текущей точки на оси */}
        <line x1={sx(cur.fpr)} y1={sy(cur.tpr)} x2={sx(cur.fpr)} y2={sy(0)} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <line x1={sx(cur.fpr)} y1={sy(cur.tpr)} x2={sx(0)} y2={sy(cur.tpr)} stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <circle cx={sx(cur.fpr)} cy={sy(cur.tpr)} r="6" fill="#fbbf24" />
        <text x={W / 2} y={H - 10} fill="#6b7280" fontSize="11" textAnchor="middle">FPR (ложные срабатывания) →</text>
        <text x={16} y={H / 2} fill="#6b7280" fontSize="11" textAnchor="middle" transform={`rotate(-90 16 ${H / 2})`}>TPR (пойман спам) →</text>
        <text x={W - PAD - 6} y={PAD + 14} fill="#2ab8eb" fontSize="13" textAnchor="end" fontWeight="600">AUC {auc.toFixed(2)}</text>
      </svg>

      <div className="flex flex-wrap gap-4 mt-1 text-sm">
        <span className="text-[#2ab8eb]">AUC: {auc.toFixed(2)}</span>
        <span className="text-[#fbbf24]">текущий порог: TPR {(cur.tpr * 100).toFixed(0)}% / FPR {(cur.fpr * 100).toFixed(0)}%</span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>Порог</span><span className="tabular-nums text-cyanink">{thr}</span></div>
          <input type="range" min="20" max="85" step="1" value={thr} onChange={(e) => setThr(Number(e.target.value))} className="w-full accent-accent" />
        </label>
        <label className="block text-sm">
          <div className="flex justify-between text-gray-700 mb-1"><span>Разделимость классов</span><span className="tabular-nums text-cyanink">{sep}</span></div>
          <input type="range" min="0" max="22" step="1" value={sep} onChange={(e) => setSep(Number(e.target.value))} className="w-full accent-accent" />
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-2">Порог двигает жёлтую точку по кривой. Разделимость лучше — кривая жмётся к левому верхнему углу, площадь под ней (AUC) растёт. AUC = 0.5 (диагональ) — модель не лучше монетки.</p>
    </div>
  )
}
