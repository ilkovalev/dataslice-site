import { useLayoutEffect, useRef, useState } from 'react'

// Дерево метрик как граф: боксы сверху вниз, соединённые линиями (как схема).
const BOX_W = 150
const BOX_H = 46
const Y_GAP = 112
const X_GAP = 18
// Ниже этого масштаба текст в узлах нечитаем — вместо сжатия включаем
// горизонтальный скролл (важно для телефонов).
const MIN_SCALE = 0.72

const levelBox = { 0: 'border-accent/60', 1: 'border-sky-400/50', 2: 'border-sky-300/40', 3: 'border-black/15', 4: 'border-black/10' }
const levelText = { 0: 'text-cyanink', 1: 'text-sky-600', 2: 'text-sky-700/90', 3: 'text-gray-900', 4: 'text-gray-600' }

function buildLayout(root) {
  const nodes = []
  const edges = []
  let cursor = 0
  let maxDepth = 0
  function place(node, depth) {
    maxDepth = Math.max(maxDepth, depth)
    let cx
    if (node.children && node.children.length) {
      const cs = node.children.map((c) => place(c, depth + 1))
      cx = (cs[0] + cs[cs.length - 1]) / 2
    } else {
      cx = cursor + BOX_W / 2
      cursor += BOX_W + X_GAP
    }
    nodes.push({ id: node.id, title: node.title, formula: node.formula, note: node.note, level: node.level ?? depth, cx, y: depth * Y_GAP })
    if (node.children) node.children.forEach((c) => edges.push([node.id, c.id]))
    return cx
  }
  place(root, 0)
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  return {
    nodes,
    edges: edges.map(([p, c]) => [byId[p], byId[c]]),
    width: Math.max(BOX_W, cursor - X_GAP),
    height: maxDepth * Y_GAP + BOX_H + 8,
  }
}

export default function MetricTreeGraph({ tree }) {
  const { nodes, edges, width, height } = buildLayout(tree.root)
  // Вписываем дерево по ширине контейнера, но не мельче MIN_SCALE:
  // на узких экранах появляется горизонтальный скролл, текст остаётся читаемым.
  const boxRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [selected, setSelected] = useState(null) // узел с открытым пояснением
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const apply = () => setScale(Math.min(1, Math.max(el.clientWidth / width, MIN_SCALE)))
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])
  const scrollable = width * scale > (boxRef.current?.clientWidth ?? Infinity)
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div ref={boxRef} className="overflow-x-auto">
        <div style={{ width: width * scale, height: height * scale, margin: '0 auto', position: 'relative' }}>
        <div className="relative" style={{ width, height, position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
            {edges.map(([p, c], i) => (
              <path key={i} d={`M${p.cx},${p.y + BOX_H} C${p.cx},${p.y + BOX_H + 32} ${c.cx},${c.y - 32} ${c.cx},${c.y}`} stroke="#d6cebf" fill="none" strokeWidth="1.5" />
            ))}
          </svg>
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelected(selected?.id === n.id ? null : n)}
              title={n.note}
              className={`absolute rounded-lg border bg-ink px-2 py-1.5 text-center transition-shadow ${levelBox[n.level] ?? 'border-black/15'} ${
                n.note ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
              } ${selected?.id === n.id ? 'ring-2 ring-accent/60' : ''}`}
              style={{ left: n.cx - BOX_W / 2, top: n.y, width: BOX_W }}
            >
              <div className={`text-[13px] font-medium leading-tight ${levelText[n.level] ?? 'text-gray-900'}`}>{n.title}</div>
              {n.formula && <div className="text-[10px] font-mono text-cyanink/90 mt-0.5 leading-tight">{n.formula}</div>}
            </button>
          ))}
        </div>
        </div>
      </div>
      {scrollable && (
        <div className="mt-2 text-xs text-gray-400 md:hidden">дерево шире экрана — прокрутите вбок →</div>
      )}
      {selected && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2.5 text-sm text-gray-700">
          <span className="text-cyanink font-medium">{selected.title}</span>
          {selected.formula && <span className="font-mono text-cyanink/90 ml-2 text-xs">{selected.formula}</span>}
          {selected.note && <span className="ml-2">{selected.note}</span>}
        </div>
      )}
      {tree.counterMetrics && (
        <div className="mt-4 pt-3 border-t border-black/10 text-sm text-gray-600">
          <span className="text-amber-700">Контр-метрики:</span>{' '}
          {tree.counterMetrics.map((c, k) => (
            <span key={c.title} title={c.note} className={c.note ? 'cursor-help border-b border-dotted border-gray-400/60' : ''}>
              {c.title}{k < tree.counterMetrics.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
