import { useState } from 'react'

const levelColor = { 0: 'text-cyanink', 1: 'text-sky-600', 2: 'text-gray-700' }

function Node({ node, depth, adapt }) {
  const [open, setOpen] = useState(depth < 1)
  const has = node.children && node.children.length > 0
  const adapted = adapt && adapt[node.id]
  return (
    <li className="my-1.5">
      <div className={`flex items-start gap-2 ${has ? 'cursor-pointer' : ''}`} onClick={() => has && setOpen((o) => !o)}>
        <span className="text-gray-500 w-4 select-none mt-0.5">{has ? (open ? '▾' : '▸') : '·'}</span>
        <div>
          <span className={`font-medium ${levelColor[node.level] ?? 'text-gray-700'}`}>{node.title}</span>
          {node.formula && <span className="ml-2 text-xs font-mono text-cyanink/90 bg-accent/10 px-1.5 py-0.5 rounded">{node.formula}</span>}
          {node.note && <div className="text-sm text-gray-600 leading-snug">{node.note}</div>}
          {adapted && <div className="text-sm text-sky-600/90 leading-snug mt-0.5">▸ {adapted}</div>}
        </div>
      </div>
      {has && open && (
        <ul className="pl-6 border-l border-black/10 ml-2">
          {node.children.map((c) => <Node key={c.id} node={c} depth={depth + 1} adapt={adapt} />)}
        </ul>
      )}
    </li>
  )
}

export default function MetricTree({ tree, adapt }) {
  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <ul>
        <Node node={tree.root} depth={0} adapt={adapt} />
      </ul>
      {tree.counterMetrics && (
        <div className="mt-5 pt-4 border-t border-black/10">
          <div className="text-sm font-semibold text-amber-600 mb-2">Контр-метрики (Guardrails)</div>
          <ul className="space-y-1.5">
            {tree.counterMetrics.map((c, i) => (
              <li key={i} className="text-sm text-gray-600">
                <span className="text-gray-900">{c.title}</span> — {c.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
