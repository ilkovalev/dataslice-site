import { loc } from '../lib/i18n.js'

// Карьерная лестница трека: три общих грейда, после сеньора развилка на
// экспертный и управленческий путь.
//
// Прошлая версия рисовала грейды тремя карточками в ряд со стрелками между
// ними и читалась как инфографика, а не как лестница: ступени стояли на одной
// высоте, и подъёма в ней не было. Здесь лестница вертикальная, с нумерованными
// ступенями на рейке — тем же приёмом, что и этапы в «Пути», — а развилка
// показана раздвоением рейки на две.
//
// Номера продолжаются внутри веток (4, 5, 6), потому что это продолжение той же
// лестницы, а не отдельный список.

function Rung({ n, title, pace, children, accent, last }) {
  return (
    <div className="relative pl-11 sm:pl-14 pb-5 last:pb-0">
      {!last && (
        <span className="absolute left-[17px] sm:left-[21px] top-9 bottom-0 w-px bg-accent/30" aria-hidden />
      )}
      <span
        className={`absolute left-0 top-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full border text-sm font-semibold ${
          accent ? 'border-accent/60 bg-accent/20 text-cyanink' : 'border-black/15 bg-panel text-gray-600'
        }`}
        aria-hidden
      >
        {n}
      </span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 min-h-9">
        <span className="text-base font-semibold text-gray-900">{title}</span>
        {pace && <span className="text-xs text-gray-500">{pace}</span>}
      </div>
      {children}
    </div>
  )
}

function Forks({ forks, onRole, locale, en }) {
  if (!forks) return null
  return (
    <div className="mt-2.5">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">
        {en ? 'You can step aside into' : 'Отсюда можно уйти в'}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {forks.map((f, i) => {
          const title = loc(f.t, locale)
          const cls = 'text-[11px] px-2.5 py-1 rounded-full border border-accent/30 bg-accent/[0.07] text-cyanink'
          return f.role ? (
            <button key={i} onClick={() => onRole(f.role)} className={`${cls} hover:bg-accent/15 transition-colors`}>{title}</button>
          ) : (
            <span key={i} className={cls}>{title}</span>
          )
        })}
      </div>
    </div>
  )
}

function Branch({ b, from, accent, locale }) {
  return (
    <div className={`glass rounded-3xl p-5 h-full ${accent ? 'ring-1 ring-accent/40' : ''}`}>
      <h4 className="font-semibold text-gray-900 mb-1">{loc(b.t, locale)}</h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{loc(b.d, locale)}</p>
      <div>
        {b.steps.map((st, i) => (
          <Rung
            key={i}
            n={from + i}
            title={loc(st.t, locale)}
            accent={accent}
            last={i === b.steps.length - 1}
          >
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{loc(st.d, locale)}</p>
          </Rung>
        ))}
      </div>
    </div>
  )
}

export default function CareerLadder({ data, onRole, locale, en }) {
  const base = data.steps.length

  return (
    <div>
      {/* Откуда приходят в трек. Отдельной схемы этот список не заслуживает:
          для человека, который уже выбрал трек, это одна строка контекста. */}
      <div className="rounded-2xl bg-white/45 ring-1 ring-white/70 px-4 py-3 mb-6">
        <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">
          {en ? 'People arrive here from' : 'Приходят сюда из'}
        </div>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {data.entries.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
              <span className="text-accent/70 select-none" aria-hidden>·</span>
              <span>
                {e.role ? (
                  <button onClick={() => onRole(e.role)} className="text-cyanink hover:underline">{loc(e.t, locale)}</button>
                ) : (
                  loc(e.t, locale)
                )}
                <span className="text-gray-500">{en ? ' — to add: ' : ' — добрать: '}</span>
                {loc(e.add, locale)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Общий ствол лестницы. */}
      <div className="">
        {data.steps.map((s, i) => (
          <Rung
            key={s.id}
            n={i + 1}
            title={loc(s.t, locale)}
            pace={loc(s.pace, locale)}
            accent
          >
            <p className="text-sm text-gray-700 leading-relaxed mt-1">{loc(s.d, locale)}</p>
            <Forks forks={s.forks} onRole={onRole} locale={locale} en={en} />
          </Rung>
        ))}
      </div>

      {/* Развилка: рейка раздваивается. Линии рисуем рамками, чтобы они жили
          в одной сетке с карточками и не разъезжались при переносе. */}
      <div className="relative pl-11 sm:pl-14 pt-1">
        <span className="absolute left-[17px] sm:left-[21px] top-0 h-6 w-px bg-accent/30" aria-hidden />
        <p className="text-sm text-gray-600 mb-4 pt-5">{loc(data.fork.lead, locale)}</p>
        <div className="grid gap-4 lg:grid-cols-2 items-stretch">
          <Branch b={data.fork.ic} from={base + 1} accent locale={locale} />
          <Branch b={data.fork.mgmt} from={base + 1} locale={locale} />
        </div>
      </div>

      <p className="text-sm text-gray-500 leading-relaxed mt-5">{loc(data.note, locale)}</p>
    </div>
  )
}
