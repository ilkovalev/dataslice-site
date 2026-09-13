import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { roadmaps, foundation, roles, pitfalls, ladder, plans } from '../content/roadmaps.js'
import RoadmapGantt from '../components/RoadmapGantt.jsx'
import CareerLadder from '../components/CareerLadder.jsx'
import { useLocale, prefix, loc, plural, STR } from '../lib/i18n.js'

// Роудмапы профессий. Четвёртая дверь сайта: уроки, метрики и глоссарий
// отвечают на вопрос «как считать», а этот раздел на вопрос «кем становиться
// и в каком порядке это учить». Без него 63 урока выглядят складом, из
// которого новичок не понимает, что брать первым.
//
// Всё, что ниже выбора трека, показывается под выбранный трек: этапы, план
// занятий, схема роста, соседние роли и названия вакансий. Общих блоков про
// все профессии сразу на странице нет — человек выбирает одну.
//
// Профессия живёт в URL (?role=ds): ссылку на конкретный трек нужно уметь
// кинуть в чат ответом на вопрос «а чем DS отличается», а из useState такую
// ссылку не получить.


// Список тем внутри области знаний. Темы свёрнуты: на этапе шесть областей и
// около сотни тем, и развёрнутыми они читаются как сплошной текст, в котором
// не видно, из чего этап вообще состоит. Свёрнутыми видны сами области.
function Topics({ items, locale }) {
  return (
    <ul className="pb-3 sm:columns-2 sm:gap-x-10">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2 mb-1.5 break-inside-avoid">
          <span className="text-accent/70 select-none" aria-hidden>·</span>
          {loc(item.t, locale)}
        </li>
      ))}
    </ul>
  )
}

// defaultOpen приходит снаружи: кнопка «развернуть всё» меняет его и
// перемонтирует список через key, иначе состояние каждой области пришлось бы
// держать на странице и синхронизировать вручную.
function Block({ block, locale, en, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const n = block.items.length
  return (
    <div className="break-inside-avoid border-b border-black/[0.07]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left flex items-baseline gap-2 py-2.5 group"
      >
        <span className="text-sm font-medium text-gray-900 group-hover:text-cyanink transition-colors">
          {loc(block.title, locale)}
        </span>
        {/* Со словом, а не голым числом: «SQL 6» читалось как номер пункта. */}
        <span className="text-[11px] text-gray-400 shrink-0">
          {en ? `${n} ${n === 1 ? 'topic' : 'topics'}` : `${n} ${plural(n, 'тема', 'темы', 'тем')}`}
        </span>
        <span className="ml-auto shrink-0 -my-1.5 w-8 h-8 flex items-center justify-center text-cyanink text-base leading-none group-hover:bg-accent/10 rounded-md transition-colors" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <Topics items={block.items} locale={locale} />}
    </div>
  )
}

// Карточка роли внутри трека. Разворачивается, потому что разбор роли занимает
// экран: задачи, стек, кому подойдёт. Свёрнутой видно то, ради чего человек
// сюда пришёл: кто это и чем отличается от базовой роли трека и от соседних.
//
// Часть полей есть не у всех ролей: у базовой роли нет разговора про переход,
// потому что переходить в неё внутри трека неоткуда.
function RoleCard({ n, locale, en, onRole }) {
  const [open, setOpen] = useState(false)
  // Первая группа стека — самое узнаваемое в роли: по «dbt» или «Amplitude»
  // человек понимает, о чём вакансия, быстрее, чем по абзацу текста.
  const chips = (n.stack?.[0]?.items || []).slice(0, 3)
  return (
    <div className="rounded-[1.15rem] border border-black/10 bg-panel/50 p-5">
      {/* Кликабельна вся верхняя часть карточки, а не строка заголовка:
          раньше цель была высотой 24px, а знак «+» — 8×14px, и промах мимо
          него ничего не делал. Знак остался как подсказка, но попадать в него
          не нужно. */}
      {/* Кнопка лежит внутри заголовка, а не наоборот: <h3> внутри <button> —
          невалидная вложенность, и в части браузеров клик по такому заголовку
          до кнопки не доходит. Внутри кнопки только строчные элементы. */}
      <h3 className="font-medium text-gray-900">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full text-left group -m-1 p-1 font-medium"
        >
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="group-hover:text-cyanink transition-colors">{loc(n.title, locale)}</span>
            {n.base && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-cyanink font-normal">
                {en ? 'the base role' : 'базовая роль'}
              </span>
            )}
            <span className="ml-auto shrink-0 -my-2 w-8 h-8 flex items-center justify-center text-cyanink text-base leading-none font-normal group-hover:bg-accent/10 rounded-md transition-colors" aria-hidden>
              {open ? '−' : '+'}
            </span>
          </span>
          {/* Свёрнутая карточка показывает одну строку: пять развёрнутых
              описаний подряд превращаются в полотно, в котором роли
              не различить. */}
          <span className="block text-sm font-normal text-gray-700 leading-relaxed mt-1.5">{loc(n.short, locale)}</span>
        </button>
      </h3>
      {/* В раскрытой карточке те же чипы стоят ниже в полном стеке, поэтому
          здесь их прячем, чтобы не дублировать. */}
      {!open && chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {chips.map((it) => (
            <span key={it} className="text-xs px-2 py-1 rounded-md border border-black/10 text-gray-600">{it}</span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-4 border-t border-black/10 pt-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'What the role is' : 'Что это за роль'}</div>
            <p className="text-sm text-gray-700 leading-relaxed">{loc(n.who, locale)}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'How it differs' : 'Чем отличается'}</div>
            <p className="text-sm text-gray-700 leading-relaxed">{loc(n.vs, locale)}</p>
          </div>
          {n.where && (
            <div>
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Where the jobs are' : 'Куда идут работать'}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{loc(n.where, locale)}</p>
            </div>
          )}
          {n.tasks && (
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1.5">{en ? 'What the job actually is' : 'Что реально делает'}</div>
            <ul className="space-y-1">
              {loc(n.tasks, locale).map((x, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-accent/70 select-none" aria-hidden>·</span>{x}
                </li>
              ))}
            </ul>
          </div>
          )}
          {n.stack && (
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{en ? 'Stack' : 'Стек'}</div>
            <div className="space-y-2">
              {n.stack.map((g) => (
                <div key={loc(g.g, locale)}>
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">{loc(g.g, locale)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <span key={it} className="text-xs px-2 py-1 rounded-md border border-black/10 text-gray-600">{it}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
          {n.fit && (
            <div>
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Who it suits' : 'Кому подойдёт'}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{loc(n.fit, locale)}</p>
            </div>
          )}
          {n.overlap && (
            <div>
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'What counts if you switch' : 'Что засчитается при переходе'}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{loc(n.overlap, locale)}</p>
            </div>
          )}
          {n.growth && (
            <div>
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Where the role grows' : 'Куда растёт роль'}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{loc(n.growth, locale)}</p>
            </div>
          )}
          {n.role && (
            <button onClick={() => onRole(n.role)} className="text-sm text-cyanink hover:underline">
              {en ? 'Open the track →' : 'Открыть трек →'}
            </button>
          )}
        </div>
      )}

    </div>
  )
}

function Stage({ stage, index, total, locale, defaultOpen, areasOpen, areasKey }) {
  const [open, setOpen] = useState(defaultOpen)
  const en = locale === 'en'

  return (
    <div className="relative pl-9 sm:pl-12 pb-6">
      {/* Вертикальная линия таймлайна: до последнего этапа включительно её
          рисовать нельзя — хвост уходил бы в пустоту под последней ступенью. */}
      {index < total - 1 && (
        <span className="absolute left-[13px] sm:left-[17px] top-8 bottom-0 w-px bg-black/10" aria-hidden />
      )}
      <span
        className="absolute left-0 top-1 flex items-center justify-center w-[27px] h-[27px] sm:w-[35px] sm:h-[35px] rounded-full border border-black/15 bg-panel text-gray-500 text-xs font-semibold"
        aria-hidden
      >
        {index + 1}
      </span>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left group"
      >
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-lg font-semibold text-gray-900 group-hover:text-cyanink transition-colors">
            {loc(stage.title, locale)}
          </span>
          <span className="text-xs text-gray-500">{loc(stage.pace, locale)}</span>
          <span className="ml-auto shrink-0 -my-2 w-9 h-9 flex items-center justify-center text-cyanink text-lg leading-none group-hover:bg-accent/10 rounded-md transition-colors" aria-hidden>
            {open ? '−' : '+'}
          </span>
        </span>
        <span className="block text-sm text-gray-700 mt-1">{loc(stage.goal, locale)}</span>
      </button>

      {open && (
        <div className="mt-4">
          {/* Общий фундамент не дублируется в данных: этап помечает флагом,
              что берёт его целиком, и добавляет своё сверху. */}
          {stage.sharedFoundation && (
            <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-4 mb-5">
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{loc(foundation.title, locale)}</div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{loc(foundation.lead, locale)}</p>
              <div>
                {foundation.blocks.map((b, i) => <Block key={`${i}-${areasKey}`} block={b} locale={locale} en={en} defaultOpen={areasOpen} />)}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed border-t border-black/10 pt-3">
                <span className="text-gray-900 font-medium">{en ? 'Check: ' : 'Проверка: '}</span>
                {loc(foundation.check, locale)}
              </div>
            </div>
          )}

          {stage.extra && (
            <div className="mb-5">
              <Block
                key={areasKey}
                block={{ title: { ru: 'Сверх общего фундамента', en: 'On top of the foundation' }, items: stage.extra }}
                locale={locale}
                en={en}
                defaultOpen={areasOpen}
              />
            </div>
          )}

          {/* Из чего состоит день именно здесь. Junior и senior одной профессии
              проводят его по-разному, а выбирают люди не роль вообще, а первый
              год работы. */}
          {stage.dayMix && (
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 mb-5">
              <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1.5">{en ? 'A day at this grade' : 'День на этом грейде'}</div>
              <ul className="space-y-1">
                {loc(stage.dayMix, locale).map((x, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                    <span className="text-accent/70 select-none" aria-hidden>·</span>{x}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stage.blocks && (
            <div className="mb-5">
              {stage.blocks.map((b, i) => <Block key={`${i}-${areasKey}`} block={b} locale={locale} en={en} defaultOpen={areasOpen} />)}
            </div>
          )}

          {/* Проверка и ловушка — то, ради чего этап вообще имеет границы.
              Список навыков без критерия закрытия длится бесконечно. */}
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {stage.check && (
              <div className="rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-1">{en ? 'Stage closed when' : 'Этап закрыт, когда'}</div>
                <p className="text-sm text-gray-700 leading-relaxed">{loc(stage.check, locale)}</p>
              </div>
            )}
            {stage.trap && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-400/[0.08] px-4 py-3">
                <div className="text-xs uppercase tracking-wider text-amber-700/90 mb-1">{en ? 'Where people get stuck' : 'Где застревают'}</div>
                <p className="text-sm text-gray-700 leading-relaxed">{loc(stage.trap, locale)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RoadmapsPage() {
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const en = locale === 'en'
  const [sp, setSp] = useSearchParams()
  const { hash } = useLocation()

  // Неизвестный id из чужой или устаревшей ссылки не должен ронять страницу —
  // молча открываем первый трек.
  const role = roadmaps.find((r) => r.id === sp.get('role')) ?? roadmaps[0]

  const setRole = (id) => setSp(id === roadmaps[0].id ? {} : { role: id })

  // Роли и ловушки привязаны к треку: показывать все сразу значит рассказывать
  // человеку, выбравшему инженерию данных, чем ML-инженер отличается от MLOps.
  const trackRoles = roles.filter((n) => n.track === role.id)
  const trackPitfalls = pitfalls[role.id] || []

  // Высота шапки сайта меняется с шириной экрана: на мобильном навигация
  // переносится на вторую строку и шапка втрое выше. Прибитое значение
  // означало бы, что липкая полоса выбора трека наезжает на неё.
  const [headerH, setHeaderH] = useState(57)
  useEffect(() => {
    const el = document.querySelector('header')
    if (!el || typeof ResizeObserver === 'undefined') return
    const upd = () => setHeaderH(Math.round(el.getBoundingClientRect().height))
    upd()
    const ro = new ResizeObserver(upd)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Вид пути: этапы или тот же материал по месяцам. Раньше это были два
  // соседних раздела с одним содержанием — «Путь» и «Что учить и когда».
  const [pathView, setPathView] = useState('stages')

  // Раскрытие всего пути. Состояние каждого этапа и каждой области локальное,
  // поэтому «развернуть всё» меняет значение по умолчанию и перемонтирует
  // список через key: так не приходится тянуть состояние сотни блоков наверх.
  const [expand, setExpand] = useState({ key: 0, all: null })
  const expandAll = (all) => setExpand((e) => ({ key: e.key + 1, all }))
  // Смена трека сбрасывает раскрытие: иначе на новом треке этапы открывались
  // бы в том же виде, в каком их оставили на прошлом.
  useEffect(() => { setExpand({ key: 0, all: null }) }, [role.id])

  // Переход по якорю внутри SPA браузер сам не отрабатывает: на /roadmaps
  // приходят из поиска сразу на блок ролей, и без этого человек оказывался
  // наверху страницы, не понимая, что нашлось.
  useEffect(() => {
    if (!hash) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash])

  useEffect(() => {
    document.title = en
      ? `Data career roadmaps — ${t.brand}`
      : `Роудмапы профессий в данных — ${t.brand}`
  }, [en, t.brand])

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
        {en ? 'Roadmaps: professions in data' : 'Роудмапы профессий в данных'}
      </h1>
      <p className="text-gray-600 mb-4 leading-relaxed">
        {en
          ? '3 main tracks in data work: DS/ML, analytics, data engineering. Each track has its own skill map, roadmap and possible career paths.'
          : '3 основных трека в области работы с данными: DS/ML, аналитика, дата-инженерия. Для каждого трека своя карта навыков, роудмап и возможные карьерные перспективы.'}
      </p>

      {/* Выбор трека липкий: страница длинная, а переключатель был один и
          стоял наверху. Чтобы сравнить треки, приходилось уезжать к началу и
          возвращаться обратно. top совпадает с высотой шапки сайта. */}
      <div className="sticky z-30 -mx-4 px-4 py-2 bg-[#FFF8EF]/95 backdrop-blur border-b border-black/[0.06] mb-6" style={{ top: headerH }}>
        {/* На узком экране чипы едут в одну строку с горизонтальной
            прокруткой: перенос на вторую строку вместе со 153-пиксельной
            шапкой съедал почти треть экрана. */}
        <div className="flex sm:flex-wrap items-center gap-1.5 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs text-gray-500 mr-1 hidden sm:inline">{en ? 'Track:' : 'Трек:'}</span>
          {roadmaps.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors shrink-0 ${
                r.id === role.id ? 'border-accent/50 text-cyanink bg-accent/15 font-medium' : 'border-black/10 text-gray-600 hover:bg-black/5'
              }`}
            >
              {loc(r.title, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Карточка трека: «кто это» до списка навыков. Роудмап, который
          начинается со стека, отвечает на вопрос «что учить» раньше, чем на
          вопрос «зачем». */}
      <section className="rounded-[1.15rem] border border-black/10 bg-panel/60 p-5 md:p-6 mb-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
          <h2 className="text-xl font-semibold text-gray-900">{loc(role.title, locale)}</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/15 text-cyanink">{loc(role.entry, locale)}</span>
        </div>
        <p className="text-gray-700 leading-relaxed mb-5">{loc(role.who, locale)}</p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{en ? 'A typical week' : 'Из чего состоит неделя'}</div>
            <ul className="space-y-1">
              {loc(role.day, locale).map((d, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-accent/70 select-none" aria-hidden>·</span>{d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{en ? 'Tools' : 'Инструменты'}</div>
            {/* Инструменты сгруппированы по этапу работы: плоский список
                читается как требования вакансии. */}
            <div className="space-y-2">
              {role.tools.map((g) => (
                <div key={loc(g.stage, locale)}>
                  <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">{loc(g.stage, locale)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((tool) => (
                      <span key={tool} className="text-xs px-2 py-1 rounded-md border border-black/10 text-gray-600">{tool}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Где есть работа и кому трек не подойдёт. Оба вопроса человек задаёт
            себе до обучения, а ответ обычно получает после: списки индустрий
            пишут только с той стороны, где вакансии есть. */}
        <div className="grid gap-5 md:grid-cols-2 mt-5 pt-5 border-t border-black/10">
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{en ? 'Where the jobs are' : 'Куда идут работать'}</div>
            <p className="text-sm text-gray-700 leading-relaxed">{loc(role.where.often, locale)}</p>
            <p className="text-sm text-gray-500 leading-relaxed mt-2">{loc(role.where.rare, locale)}</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{en ? 'Not your track if' : 'Это не ваш трек, если'}</div>
            <ul className="space-y-1">
              {loc(role.notForYou, locale).map((x, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex gap-2">
                  <span className="text-accent/70 select-none" aria-hidden>·</span>{x}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </section>

      {/* Путь. Два вида одного содержания: по этапам и по месяцам. Раньше это
          были два соседних раздела, и человек читал один и тот же список
          навыков дважды. */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{en ? 'The path' : 'Путь'}</h2>
        {/* Переключатель вида стоит слева над содержимым, которое переключает.
            Справа от заголовка на широком экране он уезжал к дальнему краю и
            нависал над вводным абзацем: было непонятно, к чему он относится. */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 mb-4">
          {[['stages', en ? 'By stage' : 'По этапам'], ['plan', en ? 'By month' : 'По месяцам']].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setPathView(v)}
              aria-pressed={pathView === v}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                pathView === v ? 'border-accent/50 text-cyanink bg-accent/15 font-medium' : 'border-black/10 text-gray-600 hover:bg-black/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {pathView === 'stages' ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {en
                ? 'Each stage is broken down by area of knowledge: SQL, Python, statistics, experiments, and so on. The same area comes back at the next stage at greater depth. Timings are a rough guide and depend on your background and how much you practise on real data.'
                : 'Каждый этап разложен по областям знаний: SQL, Python, статистика, эксперименты и так далее. Одна и та же область возвращается на следующем этапе, но глубже. Сроки — ориентир, они зависят от вашей базы и от того, сколько вы практикуетесь на настоящих данных.'}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm">
              <button onClick={() => expandAll(true)} className="text-cyanink hover:underline py-1 -my-1 min-h-[24px]">
                {en ? 'Expand everything' : 'Развернуть всё'}
              </button>
              <button onClick={() => expandAll(false)} className="text-cyanink hover:underline py-1 -my-1 min-h-[24px]">
                {en ? 'Collapse everything' : 'Свернуть всё'}
              </button>
            </div>

            <div>
              {role.stages.map((stage, i) => (
                <Stage
                  key={`${stage.id}-${expand.key}`}
                  stage={stage}
                  index={i}
                  total={role.stages.length}
                  locale={locale}
                  defaultOpen={expand.all ?? i === 0}
                  areasOpen={expand.all ?? false}
                  areasKey={expand.key}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {en
                ? 'The same content laid out over time. Directions run one after another: starting on statistics before SQL is closed means learning both halfway. Only three things run alongside everything else — Git, metrics with the domain, and practice on your own data. The plan assumes around 8–10 hours a week; at a different pace stretch it proportionally, because the order matters more than the exact month.'
                : 'То же содержание, разложенное по времени. Направления идут одно за другим: браться за статистику, не закрыв SQL, значит учить обе вещи вполовину. Параллельно идут только три вещи — Git, метрики с доменом и практика на своих данных. План рассчитан примерно на 8–10 часов в неделю, при другом темпе растягивайте пропорционально: порядок важнее конкретного месяца.'}
            </p>
            <RoadmapGantt plan={plans[role.id]} locale={locale} en={en} />
            <div className="hidden md:flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-5 h-3 rounded-sm bg-accent/20 border border-accent/40" aria-hidden />
                {en ? 'main focus' : 'основное время'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-5 h-3 rounded-sm border border-dashed border-accent/40" aria-hidden />
                {en ? 'runs in the background' : 'идёт фоном'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-px h-3 bg-accent/40" aria-hidden />
                {en ? 'checkpoint' : 'веха'}
              </span>
            </div>
          </>
        )}
      </section>

      {/* Карьерные перспективы: лестница грейдов с развилками. Главный вопрос
          человека, который выбирает профессию, — докуда по ней можно дойти. */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{en ? 'Career paths' : 'Карьерные перспективы'}</h2>
        <p className="text-sm text-gray-500 mb-5">
          {en
            ? 'The first three grades look alike everywhere. After senior the ladder splits into an expert path and a management path, and what those two hold differs from track to track.'
            : 'Первые три грейда выглядят похоже везде. После сеньора лестница раздваивается на экспертный и управленческий путь, и содержание этих веток у треков разное.'}
        </p>
        <CareerLadder data={ladder[role.id]} onRole={setRole} locale={locale} en={en} />
      </section>

      {/* Роли трека. Человек выбирает трек, а откликается на конкретную
          вакансию, и названия у неё разные. Поэтому каждая роль разобрана
          отдельно, с отличиями от базовой роли и от соседних ролей трека. */}
      <section id="roles" className="mb-10 scroll-mt-28">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{en ? 'Roles inside the track' : 'Роли, входящие в трек'}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {en
            ? 'One track covers several job titles. They share the base but differ in subject and in what the person owns; in a smaller company they merge back into one job.'
            : 'Один трек закрывает несколько названий вакансий. База у них общая, а предмет работы и зона ответственности разные; в компании поменьше все они снова становятся одной работой.'}
        </p>
        {/* Одна колонка: в сетке из двух раскрытие карточки растягивало
            строку, и соседняя карточка тянулась за ней пустым местом. */}
        <div className="flex flex-col gap-3">
          {trackRoles.map((n) => (
            <RoleCard key={loc(n.title, locale)} n={n} locale={locale} en={en} onRole={setRole} />
          ))}
        </div>
      </section>

      {/* Ловушки вынесены из ролей отдельным блоком: это не разбор профессии,
          а разбор вакансии, и стоят они там, где человек уже знает, как
          выглядит настоящая работа. */}
      {trackPitfalls.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{en ? 'Possible traps' : 'Возможные ловушки'}</h2>
          <p className="text-sm text-gray-500 mb-4">
            {en
              ? 'A job title says less than the task list and the stack under it. Always read those two before you apply.'
              : 'Название вакансии говорит меньше, чем список задач и стек под ним. Всегда смотрите на эти два раздела до отклика.'}
          </p>
          <dl className="flex flex-col gap-3">
            {trackPitfalls.map((x, i) => (
              <div key={i} className="rounded-[1.15rem] border border-black/10 bg-panel/50 p-5">
                <dt className="text-sm font-medium text-gray-900 mb-1">{loc(x.t, locale)}</dt>
                <dd className="text-sm text-gray-700 leading-relaxed">{loc(x.d, locale)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="rounded-lg border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-gray-600 leading-relaxed mb-6">
        <span className="text-gray-900">{en ? 'Where to start right now: ' : 'С чего начать прямо сейчас: '}</span>
        {en ? (
          <>
            take the first statistics lesson (<Link to={`${p}/stats/center-measures`} className="text-cyanink hover:underline">mean and median</Link>),
            open a <Link to={`${p}/metrics`} className="text-cyanink hover:underline">metric tree</Link> for an industry you know,
            and keep the <Link to={`${p}/glossary`} className="text-cyanink hover:underline">glossary</Link> open for the words you meet along the way.
          </>
        ) : (
          <>
            откройте первый урок статистики (<Link to={`${p}/stats/center-measures`} className="text-cyanink hover:underline">среднее и медиана</Link>),
            посмотрите <Link to={`${p}/metrics`} className="text-cyanink hover:underline">дерево метрик</Link> знакомой индустрии
            и держите рядом <Link to={`${p}/glossary`} className="text-cyanink hover:underline">глоссарий</Link> для незнакомых слов.
          </>
        )}
      </div>

      <SubscribeCTA locale={locale} />
    </div>
  )
}
