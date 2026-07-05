import { useState } from 'react'

// Ошибка выжившего: видим только вернувшиеся самолёты. Пробоины у них —
// там, где попадание НЕ смертельно (крылья, хвост, фюзеляж). Броню надо
// ставить туда, где у вернувшихся пробоин нет: двигатели и кабина —
// потому что попавшие туда самолёты не вернулись.
const W = 460
const H = 300

// пробоины вернувшихся: крылья, хвост, края фюзеляжа (НЕ двигатели/кабина)
const HOLES = [
  [120, 150], [170, 130], [200, 170], [300, 130], [330, 165], [360, 150],
  [230, 95], [250, 205], [150, 165], [310, 100], [275, 185], [195, 120],
  [340, 120], [140, 135], [220, 195],
]
// смертельные зоны (куда реально нужна броня) — у вернувшихся тут пусто
const ARMOR = [
  { cx: 240, cy: 150, r: 26, label: 'двигатели', labelEn: 'engines' },
  { cx: 240, cy: 80, r: 20, label: 'кабина', labelEn: 'cockpit' },
]

export default function SurvivorshipBias({ locale = 'ru' }) {
  const en = locale === 'en'
  const [showArmor, setShowArmor] = useState(false)
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
        {/* силуэт самолёта сверху */}
        <g fill="#e7e1d4" stroke="#c9bfa9" strokeWidth="1.5">
          {/* фюзеляж */}
          <rect x="222" y="62" width="36" height="190" rx="18" />
          {/* нос/кабина */}
          <path d="M222,72 Q240,40 258,72 Z" />
          {/* крылья */}
          <polygon points="100,140 380,140 360,168 120,168" />
          {/* хвостовое оперение */}
          <polygon points="190,232 290,232 272,256 208,256" />
        </g>
        {/* двигатели — кружки на крыльях */}
        <circle cx="170" cy="154" r="9" fill="#d8cdb6" stroke="#c9bfa9" />
        <circle cx="310" cy="154" r="9" fill="#d8cdb6" stroke="#c9bfa9" />

        {/* зоны брони (показываются по кнопке) */}
        {showArmor && ARMOR.map((a, i) => (
          <g key={i}>
            <circle cx={a.cx} cy={a.cy} r={a.r} fill="#f87171" opacity="0.18" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={a.cx} y={a.cy + a.r + 14} fill="#dc4d4d" fontSize="11" textAnchor="middle">{en ? a.labelEn : a.label}</text>
          </g>
        ))}

        {/* пробоины вернувшихся */}
        {HOLES.map(([x, y], i) => (
          <circle key={`h${i}`} cx={x} cy={y} r="3.5" fill="#2a2f3a" stroke="#fff" strokeWidth="1" />
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
        <span className="text-gray-700">● {en ? 'bullet holes of the returned' : 'пробоины вернувшихся'}</span>
        {showArmor && <span className="text-[#dc4d4d]">⬡ {en ? 'where the armor goes' : 'куда ставить броню'}</span>}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        {showArmor
          ? (en
            ? <>Armor goes to the engines and the cockpit. The returned planes have NO holes there not because nothing hit them, but because the planes hit there never came back. The “survivors’” data points exactly the wrong way.</>
            : <>Броню — в двигатели и кабину. У вернувшихся там пробоин НЕТ не потому, что туда не попадали, а потому, что попавшие туда самолёты не вернулись. Данные «выживших» подсказывают ровно наоборот.</>)
          : (en
            ? <>The military wanted to reinforce where there were most holes — the wings and the tail. Where is the armor actually needed?</>
            : <>Военные хотели усилить там, где пробоин больше всего, — на крыльях и хвосте. Где на самом деле нужна броня?</>)}
      </div>

      <button onClick={() => setShowArmor((s) => !s)} className="mt-3 text-xs px-2.5 py-1 rounded-md border border-black/15 text-gray-700 hover:bg-black/5">
        {showArmor ? (en ? 'hide the answer' : 'скрыть ответ') : (en ? 'show where armor is needed' : 'показать, куда нужна броня')}
      </button>
    </div>
  )
}
