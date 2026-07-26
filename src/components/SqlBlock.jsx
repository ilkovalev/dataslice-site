import { useState } from 'react'

// Блок SQL-кода с подсветкой. Токенизатор самописный: SQL в справочнике
// авторский и одного диалекта (PostgreSQL), поэтому полноценная библиотека
// подсветки не нужна. Рендерим React-спанами — без dangerouslySetInnerHTML.
const KEYWORDS = new Set([
  'select', 'from', 'where', 'group', 'by', 'order', 'having', 'limit', 'offset',
  'join', 'left', 'right', 'inner', 'outer', 'full', 'cross', 'on', 'using',
  'with', 'as', 'and', 'or', 'not', 'in', 'is', 'null', 'like', 'ilike', 'between',
  'case', 'when', 'then', 'else', 'end', 'distinct', 'union', 'all', 'exists',
  'over', 'partition', 'rows', 'range', 'preceding', 'following', 'current', 'row',
  'asc', 'desc', 'nulls', 'first', 'last', 'interval', 'filter', 'lateral',
  'insert', 'into', 'values', 'update', 'set', 'delete', 'create', 'table', 'view',
  'cast', 'true', 'false',
])
const FUNCTIONS = new Set([
  'count', 'sum', 'avg', 'min', 'max', 'coalesce', 'nullif', 'round', 'abs',
  'date_trunc', 'extract', 'now', 'age', 'greatest', 'least', 'percentile_cont',
  'percentile_disc', 'stddev', 'variance', 'corr', 'lag', 'lead', 'row_number',
  'rank', 'dense_rank', 'ntile', 'first_value', 'last_value', 'array_agg',
  'string_agg', 'generate_series', 'to_char', 'lower', 'upper', 'length', 'concat',
])

// Один проход по строке: комментарий | строка | число | слово | прочее.
const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_][a-zA-Z0-9_]*)|(::|[^\s])|(\s+)/g

function tokenize(sql) {
  const out = []
  let m
  TOKEN_RE.lastIndex = 0
  while ((m = TOKEN_RE.exec(sql)) !== null) {
    const [frag, comment, str, num, word] = m
    let cls = null
    if (comment) cls = 'text-gray-400 italic'
    else if (str) cls = 'text-amber-700'
    else if (num) cls = 'text-emerald-700'
    else if (word) {
      const w = word.toLowerCase()
      if (KEYWORDS.has(w)) cls = 'text-cyanink font-semibold'
      else if (FUNCTIONS.has(w)) cls = 'text-sky-600'
    }
    const prev = out[out.length - 1]
    if (prev && prev.cls === cls) prev.text += frag
    else out.push({ text: frag, cls })
  }
  return out
}

export default function SqlBlock({ sql, copyLabel = 'копировать', copiedLabel = '✓ скопировано' }) {
  const [copied, setCopied] = useState(false)
  if (!sql) return null
  const tokens = tokenize(sql)
  const copy = () => {
    navigator.clipboard?.writeText(sql).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  // Кнопка копирования — отдельной строкой над кодом, а не поверх него:
  // при горизонтальном скролле кода (узкие экраны) наложение съедало текст.
  return (
    <div className="rounded-lg bg-black/[0.04] border border-black/10">
      <div className="flex justify-end px-1.5 pt-1.5">
        <button
          onClick={copy}
          className="text-[11px] px-2 py-0.5 rounded border border-black/10 bg-white/80 text-gray-500 hover:text-cyanink hover:border-accent/40"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 pb-3 pt-1 font-mono text-[12.5px] leading-relaxed text-gray-800">
        <code>
          {tokens.map((t, i) => (t.cls ? <span key={i} className={t.cls}>{t.text}</span> : t.text))}
        </code>
      </pre>
    </div>
  )
}
