import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gloss } from './Glossed.jsx'
import MetricCardModal from './MetricCardModal.jsx'
import { useLocale, STR } from '../lib/i18n.js'

// Дерево метрик как граф: боксы сверху вниз, соединённые линиями (как схема).
// Высота бокса зависит от длины названия и формулы, поэтому она измеряется по
// факту (см. heights ниже), а не берётся константой: иначе длинные названия
// вылезают за рамку, а линии и чипы «+N» рисуются не там, где стоит бокс.
const BOX_W = 150
const BOX_MIN_H = 46
const V_GAP = 60 // просвет между рядами: линия + место под чип «+N»
const CHIP_SPACE = 30 // запас снизу, чтобы чипы нижнего ряда не обрезались
const X_GAP = 18
// Ниже этого масштаба текст в узлах нечитаем — вместо сжатия включаем
// горизонтальный скролл (важно для телефонов).
const MIN_SCALE = 0.72

const levelBox = {
  0: 'border-accent/60',
  1: 'border-sky-400/50',
  2: 'border-sky-300/40',
  3: 'border-black/15',
  4: 'border-black/10',
  5: 'border-black/10 border-dashed',
}
const levelText = {
  0: 'text-cyanink',
  1: 'text-sky-600',
  2: 'text-sky-700/90',
  3: 'text-gray-900',
  4: 'text-gray-700',
  5: 'text-gray-500',
}

function countDescendants(node) {
  if (!node.children?.length) return 0
  return node.children.reduce((acc, c) => acc + 1 + countDescendants(c), 0)
}

// Свёрнутые по умолчанию: у всех узлов уровня depth и глубже прячем детей.
function initialCollapsed(root, depth) {
  const s = new Set()
  ;(function walk(n, d) {
    if (d >= depth && n.children?.length) s.add(n.id)
    n.children?.forEach((c) => walk(c, d + 1))
  })(root, 0)
  return s
}

// Карточка открывается, только если узлу есть что показать: своя метрика в
// справочнике, пояснение или пометка рычага. Иначе узел некликабелен —
// пустая модалка с одним заголовком хуже, чем отсутствие клика.
const hasCard = (n) => !!(n.metricId || n.note || n.kind === 'lever')

function buildLayout(root, collapsed, heights, plain = false) {
  const nodes = []
  const edges = []
  let cursor = 0
  let maxDepth = 0
  function place(node, depth) {
    maxDepth = Math.max(maxDepth, depth)
    const isCollapsed = collapsed.has(node.id)
    let cx
    if (node.children?.length && !isCollapsed) {
      const cs = node.children.map((c) => place(c, depth + 1))
      cx = (cs[0] + cs[cs.length - 1]) / 2
    } else {
      cx = cursor + BOX_W / 2
      cursor += BOX_W + X_GAP
    }
    nodes.push({
      id: node.id, title: node.title, formula: node.formula, note: node.note,
      metricId: node.metricId, kind: node.kind, detail: node.detail,
      level: node.level ?? depth, depth, cx,
      h: heights[node.id] ?? BOX_MIN_H,
      hasChildren: !!node.children?.length,
      collapsed: isCollapsed,
      hidden: isCollapsed ? countDescendants(node) : 0,
    })
    if (node.children && !isCollapsed) node.children.forEach((c) => edges.push([node.id, c.id]))
    return cx
  }
  place(root, 0)

  // Ряд выравнивается по самому высокому боксу в нём: так линии между
  // уровнями остаются одинаковой длины, даже если названия разной длины.
  const rowH = []
  for (const n of nodes) rowH[n.depth] = Math.max(rowH[n.depth] ?? BOX_MIN_H, n.h)
  const rowY = []
  let acc = 0
  for (let d = 0; d <= maxDepth; d++) {
    rowY[d] = acc
    acc += rowH[d] + V_GAP
  }
  for (const n of nodes) n.y = rowY[n.depth]

  // Запас снизу нужен только под чипы «+N»; в режиме иллюстрации их нет.
  const bottomPad = plain ? 0 : CHIP_SPACE

  // Полосы-ряды: фон под каждым уровнем. Полоса тянется до середины просвета
  // до следующего ряда, чтобы уровни читались как сплошные дорожки без щелей.
  const rows = []
  for (let d = 0; d <= maxDepth; d++) {
    const top = d === 0 ? 0 : rowY[d] - V_GAP / 2
    const bottom = d === maxDepth ? rowY[d] + rowH[d] + bottomPad : rowY[d + 1] - V_GAP / 2
    rows.push({ depth: d, top, height: bottom - top, labelY: rowY[d] })
  }

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  return {
    nodes,
    rows,
    edges: edges.map(([p, c]) => [byId[p], byId[c]]),
    width: Math.max(BOX_W, cursor - X_GAP),
    height: rowY[maxDepth] + rowH[maxDepth] + bottomPad,
  }
}

// Справочник метрик грузится лениво (отдельный чанк) и кэшируется на модуль.
let catalogCache = null
function loadCatalog() {
  return import('../content/metrics/index.js').then((m) => {
    catalogCache = { byId: m.metricsById, categories: m.METRIC_CATEGORIES }
    return catalogCache
  })
}

// plain — режим иллюстрации: дерево показывается целиком и просто как схема,
// без полос уровней, чипов сворачивания, карточек и тулбара. Нужен там, где
// дерево объясняет саму идею дерева (вкладка «Основы»), а не разбирает метрики:
// интерактив в такой картинке отвлекает от мысли, ради которой её показывают.
export default function MetricTreeGraph({ tree, defaultDepth, plain = false, className = '' }) {
  const locale = useLocale()
  const t = STR[locale]
  // Глубина по умолчанию подобрана так, чтобы дерево целиком влезало по ширине:
  // на L2 у самых широких деревьев ~11 листьев (≈1850px), и это последняя
  // глубина, которая вписывается в десктопный контейнер без скролла.
  // Дальше — по кнопке «Развернуть всё» или чипам «+N» на узлах.
  const isNarrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  const depth = plain ? 99 : defaultDepth ?? (isNarrow ? 1 : 2)

  const [collapsed, setCollapsed] = useState(() => initialCollapsed(tree.root, depth))
  // При переключении индустрии/компании сбрасываем раскрытие к дефолту.
  const rootId = tree.root.id
  useEffect(() => {
    setCollapsed(initialCollapsed(tree.root, depth))
    setSelected(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootId, depth])

  // Реальные высоты боксов: заполняются после первого рендера (см. useLayoutEffect
  // ниже) и на следующем проходе дают корректную раскладку линий и чипов.
  const [heights, setHeights] = useState({})
  const nodeRefs = useRef({})

  const { nodes, rows, edges, width, height } = useMemo(
    () => buildLayout(tree.root, collapsed, heights, plain),
    [tree, collapsed, heights, plain]
  )

  useLayoutEffect(() => {
    const next = {}
    let changed = false
    for (const n of nodes) {
      const el = nodeRefs.current[n.id]
      if (!el) continue
      const h = el.offsetHeight
      next[n.id] = h
      if (heights[n.id] !== h) changed = true
    }
    // Сравниваем по значениям: setState только при реальном изменении, иначе
    // измерение зациклится.
    if (changed || Object.keys(next).length !== Object.keys(heights).length) setHeights(next)
  })

  // Вписываем дерево по ширине контейнера, но не мельче MIN_SCALE:
  // на узких экранах появляется горизонтальный скролл, текст остаётся читаемым.
  const boxRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [selected, setSelected] = useState(null) // узел с открытой карточкой
  const [catalog, setCatalog] = useState(catalogCache)
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const apply = () => setScale(Math.min(1, Math.max(el.clientWidth / width, MIN_SCALE)))
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  // Дерево читается от корня вниз, поэтому при горизонтальном скролле
  // (широкое дерево или узкий экран) показываем сначала вершину, а не
  // случайную середину: иначе пользователь видит ветки без их начала.
  const rootCx = nodes.find((n) => n.y === 0)?.cx ?? width / 2
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    el.scrollLeft = rootCx * scale - el.clientWidth / 2
  }, [rootCx, scale, width])

  // Прогреваем каталог в свободное время, чтобы карточка открывалась мгновенно.
  useEffect(() => {
    if (catalogCache) return
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 400))
    const id = idle(() => loadCatalog().then(setCatalog))
    return () => (window.cancelIdleCallback ?? clearTimeout)(id)
  }, [])

  const openCard = (n) => {
    setSelected(n)
    if (!catalogCache) loadCatalog().then(setCatalog)
  }

  const toggle = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const expandAll = () => setCollapsed(new Set())
  const collapseAll = () => setCollapsed(initialCollapsed(tree.root, depth))
  const anyCollapsible = nodes.some((n) => n.hasChildren && n.level > 0)
  const allExpanded = collapsed.size === 0

  const scrollable = width * scale > (boxRef.current?.clientWidth ?? Infinity)

  return (
    <div className={`rounded-xl border border-black/10 bg-panel p-5 ${className}`}>
      {!plain && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
          <div className="text-xs text-gray-500">{t.treeHintClick}</div>
          {anyCollapsible && (
            <button
              onClick={allExpanded ? collapseAll : expandAll}
              className="text-xs px-2.5 py-1 rounded-md border border-black/10 text-gray-600 hover:bg-black/5 hover:text-cyanink ml-auto"
            >
              {allExpanded ? t.treeCollapseAll : t.treeExpandAll}
            </button>
          )}
        </div>
      )}
      {/* Полосы уровней и их номера живут вне области прокрутки: дерево шире
          экрана, и внутри неё полосы обрывались бы по краям дерева, а подписи
          уезжали бы вбок вместе с ним. */}
      <div className="relative">
        {!plain && rows.map((r) => (
          <div
            key={`row-${r.depth}`}
            aria-hidden
            className={`absolute left-0 right-0 pointer-events-none rounded ${
              r.depth % 2 === 0 ? 'bg-cyanink/[0.04]' : 'bg-transparent'
            }`}
            style={{ top: r.top * scale, height: r.height * scale }}
          />
        ))}
        <div className="relative flex">
          {!plain && (
            <div className="shrink-0 relative w-7 sm:w-9" style={{ height: height * scale }} aria-hidden>
              {rows.map((r) => (
                <div
                  key={r.depth}
                  className="absolute left-0 text-[11px] font-mono text-gray-400/90 leading-none"
                  style={{ top: (r.labelY + BOX_MIN_H / 2 - 5) * scale }}
                >
                  L{r.depth}
                </div>
              ))}
            </div>
          )}
        <div ref={boxRef} className="overflow-x-auto flex-1 min-w-0">
        <div style={{ width: width * scale, height: height * scale, margin: '0 auto', position: 'relative' }}>
        <div className="relative" style={{ width, height, position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
            {edges.map(([p, c], i) => (
              <path key={i} d={`M${p.cx},${p.y + p.h} C${p.cx},${p.y + p.h + 30} ${c.cx},${c.y - 30} ${c.cx},${c.y}`} stroke="#d6cebf" fill="none" strokeWidth="1.5" />
            ))}
          </svg>
          {nodes.map((n) => {
            const clickable = !plain && hasCard(n)
            return (
              <button
                key={n.id}
                ref={(el) => { nodeRefs.current[n.id] = el }}
                onClick={clickable ? () => openCard(n) : undefined}
                title={n.note}
                aria-disabled={!clickable}
                className={`absolute rounded-lg border bg-ink px-2 py-1.5 text-center transition-shadow ${
                  clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                } ${levelBox[n.level] ?? 'border-black/15'} ${selected?.id === n.id ? 'ring-2 ring-accent/60' : ''}`}
                style={{ left: n.cx - BOX_W / 2, top: n.y, width: BOX_W, minHeight: BOX_MIN_H }}
              >
                <div className={`text-[13px] font-medium leading-tight ${levelText[n.level] ?? 'text-gray-900'}`}>{n.title}</div>
                {n.formula && <div className="text-[10px] font-mono text-cyanink/90 mt-0.5 leading-tight">{n.formula}</div>}
              </button>
            )
          })}
          {/* Чипы разворачивания — отдельно от клика по узлу (клик = карточка). */}
          {!plain && nodes.filter((n) => n.hasChildren).map((n) => (
            <button
              key={`t-${n.id}`}
              onClick={(e) => { e.stopPropagation(); toggle(n.id) }}
              aria-label={n.collapsed ? t.treeExpandAll : t.treeCollapseAll}
              className={`absolute z-10 rounded-full border text-[10px] font-mono leading-none px-1.5 min-w-[26px] h-[20px] ${
                n.collapsed
                  ? 'border-accent/50 bg-white text-cyanink hover:bg-accent/10'
                  : 'border-black/15 bg-white text-gray-400 hover:text-gray-700'
              }`}
              style={{ left: n.cx - 13, top: n.y + n.h + 2 }}
            >
              {n.collapsed ? `+${n.hidden}` : '–'}
            </button>
          ))}
        </div>
        </div>
        </div>
        </div>
      </div>
      {scrollable && (
        <div className="mt-2 text-xs text-gray-400">{t.treeHintScroll}</div>
      )}
      {tree.counterMetrics && (
        <div className="mt-4 pt-3 border-t border-black/10 text-sm text-gray-600">
          <span className="text-amber-700">{t.treeCounterMetrics}</span>{' '}
          {tree.counterMetrics.map((c, k) => (
            <span key={c.title} title={c.note} className={c.note ? 'cursor-help border-b border-dotted border-gray-400/60' : ''}>
              {c.title}{k < tree.counterMetrics.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
      )}
      {selected && (
        <MetricCardModal
          node={selected}
          catalog={catalog?.byId}
          categories={catalog?.categories}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
