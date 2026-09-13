// План занятий по месяцам для одного трека.
//
// Зачем отдельно от списка этапов: этапы отвечают на вопрос «что должно быть
// закрыто», а порядок в них читается как очередь. На деле SQL, статистика и
// разбор своего датасета идут одновременно, и увидеть это можно только на
// временной шкале.
//
// Полосы позиционируются в процентах от горизонта плана, поэтому диаграмма
// не зависит от ширины экрана. На узком экране диаграмма не показывается
// вовсе: в 390px помещалось четыре месяца из четырнадцати, подписи резались
// до «Выбо…», а направления, которые начинаются позже, выглядели пустыми
// строками. Вместо неё там список направлений с интервалами месяцев.
import { loc } from '../lib/i18n.js'

// #FFF8EF — фон страницы: липкая колонка перекрывает уезжающие под неё полосы.
const LABEL_W = 'w-[8.5rem] sm:w-44 shrink-0 sticky left-0 z-10 bg-[#FFF8EF]'

export default function RoadmapGantt({ plan, locale, en }) {
  const months = plan.months
  const pct = (m) => `${(m / months) * 100}%`
  // Подписи шкалы: каждый месяц на 12-месячном плане и каждый второй на 18,
  // иначе цифры сливаются.
  const step = months > 12 ? 2 : 1
  const ticks = []
  for (let m = step; m <= months; m += step) ticks.push(m)

  const range = (b) => {
    const f = (m) => (Number.isInteger(m) ? m : m.toFixed(1).replace('.', ','))
    return `${f(b.s)}–${f(b.e)}`
  }

  return (
    <>
    {/* Узкий экран: то же содержание списком. */}
    <div className="md:hidden">
      {plan.lanes.map((lane) => (
        <div key={loc(lane.t, locale)} className="border-b border-black/[0.07] py-2.5">
          <div className="text-sm font-medium text-gray-900 mb-1.5">{loc(lane.t, locale)}</div>
          <ul className="space-y-1">
            {lane.bars.map((b, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                <span className="text-[11px] text-gray-400 shrink-0 w-14 pt-0.5 tabular-nums">{range(b)}</span>
                <span>
                  {loc(b.t, locale)}
                  {b.k === 'bg' && <span className="text-gray-400">{en ? ' · in the background' : ' · фоном'}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="pt-3 space-y-1">
        {plan.milestones.map((ms) => (
          <div key={ms.at} className="text-sm text-cyanink flex gap-2">
            <span className="text-[11px] text-gray-400 shrink-0 w-14 pt-0.5 tabular-nums">{ms.at}</span>
            {loc(ms.t, locale)}
          </div>
        ))}
      </div>
    </div>

    <div className="hidden md:block overflow-x-auto -mx-4 px-4">
      <div className="min-w-[46rem]">
        {/* шкала месяцев */}
        <div className="flex items-end">
          <div className={`${LABEL_W} text-[11px] uppercase tracking-wider text-gray-400 pr-3`}>
            {en ? 'Month' : 'Месяц'}
          </div>
          <div className="relative flex-1 h-5">
            {ticks.map((m) => (
              <span
                key={m}
                className={`absolute text-[11px] text-gray-400 ${m === months ? '-translate-x-full' : '-translate-x-1/2'}`}
                style={{ left: pct(m) }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="relative border-t border-black/10">
          {/* вертикальная сетка и вехи рисуются под полосами на всю высоту */}
          <div className="absolute inset-0 flex pointer-events-none" aria-hidden>
            <div className={`${LABEL_W} bg-transparent`} />
            <div className="relative flex-1">
              {ticks.map((m) => (
                <span key={m} className="absolute top-0 bottom-0 w-px bg-black/[0.06]" style={{ left: pct(m) }} />
              ))}
              {plan.milestones.map((ms) => (
                <span key={ms.at} className="absolute top-0 bottom-0 w-px bg-accent/40" style={{ left: pct(ms.at) }} />
              ))}
            </div>
          </div>

          {plan.lanes.map((lane) => {
            // Внутри направления полосы могут идти одновременно: Linux и Git
            // учат параллельно. Раскладываем такие полосы по подстрокам, иначе
            // они наезжают друг на друга и подписи склеиваются.
            // Узкие полосы подписаны снаружи, и в одной строке их подписи
            // наезжают друг на друга. Поэтому в направлении с несколькими
            // короткими полосами каждая получает свою строку.
            const narrow = lane.bars.some((b) => (b.e - b.s) / months < 0.14)
            const rows = []
            if (lane.bars.length > 1 && narrow) {
              for (const b of lane.bars) rows.push([b])
            } else {
              for (const b of lane.bars) {
                let row = rows.find((r) => r.every((x) => b.s >= x.e || b.e <= x.s))
                if (!row) { row = []; rows.push(row) }
                row.push(b)
              }
            }
            return (
              <div key={loc(lane.t, locale)} className="flex items-stretch border-b border-black/[0.06]">
                <div className={`${LABEL_W} text-sm text-gray-700 pr-3 py-2 leading-tight flex items-center`}>
                  {loc(lane.t, locale)}
                </div>
                <div className="relative flex-1 py-2" style={{ height: `${rows.length * 2.25 + 0.75}rem` }}>
                  {rows.map((row, ri) =>
                    row.map((b, i) => {
                      const label = loc(b.t, locale)
                      const bg = b.k === 'bg'
                      const cls = `absolute h-7 rounded-md flex items-center overflow-hidden whitespace-nowrap text-xs ${
                        bg
                          ? 'border border-dashed border-accent/40 text-gray-500'
                          : 'bg-accent/20 border border-accent/40 text-gray-800'
                      }`
                      const style = { left: pct(b.s), width: pct(b.e - b.s), top: `${ri * 2.25 + 0.375}rem` }
                      // Когда направления идут одно за другим, полосы короткие
                      // и подпись внутри режется до «Синтакси…». Узкую полосу
                      // подписываем снаружи: справа, а у правого края — слева,
                      // иначе текст уезжает за диаграмму.
                      const share = (b.e - b.s) / months
                      const outside = share < 0.14
                      // Хватит ли места справа под подпись: ширина области
                      // полос около 560px на минимальной ширине диаграммы,
                      // символ ≈ 6,2px. Не хватает — уводим подпись влево.
                      const roomRight = (1 - b.e / months) * 560
                      const toLeft = roomRight < loc(b.t, locale).length * 6.2 + 10
                      const outCls = 'absolute text-xs text-gray-700 whitespace-nowrap flex items-center h-7'
                      const outStyle = toLeft
                        ? { right: `calc(${pct(months - b.s)} + 0.5rem)`, top: `${ri * 2.25 + 0.375}rem` }
                        : { left: `calc(${pct(b.e)} + 0.5rem)`, top: `${ri * 2.25 + 0.375}rem` }
                      // Ссылок на уроки в плане больше нет: план — часть пути,
                      // а путь описан областями знаний и на материалы сайта
                      // не опирается.
                      return (
                        <div key={`${ri}-${i}`}>
                          <div title={label} className={`${cls} ${outside ? '' : 'px-2'}`} style={style}>
                            {!outside && <span className="truncate">{label}</span>}
                          </div>
                          {outside && <span className={outCls} style={outStyle}>{label}</span>}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}

          {/* вехи подписываются под диаграммой: внутри полос места нет */}
          <div className="flex pt-2">
            <div className={`${LABEL_W} h-8`} />
            <div className="relative flex-1 h-8">
              {plan.milestones.map((ms) => {
                // Веха у самого края уезжает за диаграмму, если центрировать
                // подпись по её линии: у краёв прижимаем текст внутрь.
                const at = ms.at / months
                const align = at > 0.85 ? '-translate-x-full text-right' : at < 0.15 ? 'text-left' : '-translate-x-1/2 text-center'
                return (
                  <span key={ms.at} className={`absolute text-[11px] text-cyanink leading-tight w-40 ${align}`} style={{ left: pct(ms.at) }}>
                    {loc(ms.t, locale)}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
