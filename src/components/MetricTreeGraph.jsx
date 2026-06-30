// Дерево метрик как граф: боксы сверху вниз, соединённые линиями (как схема).
const BOX_W = 150
const BOX_H = 46
const Y_GAP = 112
const X_GAP = 18

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
    nodes.push({ id: node.id, title: node.title, formula: node.formula, level: node.level ?? depth, cx, y: depth * Y_GAP })
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
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="overflow-x-auto">
        <div className="relative mx-auto" style={{ width, height }}>
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
            {edges.map(([p, c], i) => (
              <path key={i} d={`M${p.cx},${p.y + BOX_H} C${p.cx},${p.y + BOX_H + 32} ${c.cx},${c.y - 32} ${c.cx},${c.y}`} stroke="#d6cebf" fill="none" strokeWidth="1.5" />
            ))}
          </svg>
          {nodes.map((n) => (
            <div
              key={n.id}
              className={`absolute rounded-lg border bg-ink px-2 py-1.5 text-center ${levelBox[n.level] ?? 'border-black/15'}`}
              style={{ left: n.cx - BOX_W / 2, top: n.y, width: BOX_W }}
            >
              <div className={`text-[13px] font-medium leading-tight ${levelText[n.level] ?? 'text-gray-900'}`}>{n.title}</div>
              {n.formula && <div className="text-[10px] font-mono text-cyanink/80 mt-0.5 leading-tight">{n.formula}</div>}
            </div>
          ))}
        </div>
      </div>
      {tree.counterMetrics && (
        <div className="mt-4 pt-3 border-t border-black/10 text-sm text-gray-600">
          <span className="text-amber-600">Контр-метрики:</span> {tree.counterMetrics.map((c) => c.title).join(' · ')}
        </div>
      )}
    </div>
  )
}
