import { useRef, useState } from 'react'
import { SCAN, defFor } from '../content/tooltipTerms.js'

// Оборачивает в тексте известные термины и символы во всплывающее пояснение
// (наведение мышью + клик/тап для мобильных). Подсвечивается ПЕРВОЕ вхождение
// каждого термина в данном фрагменте — чтобы текст не пестрел.
function Pop({ label, def }) {
  const [open, setOpen] = useState(false)
  const [flip, setFlip] = useState(false) // открыть влево, если у правого края
  const ref = useRef(null)
  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setFlip(r.left + 272 > window.innerWidth)
    setOpen(true)
  }
  return (
    <span className="relative inline-block">
      <span
        ref={ref}
        className="border-b border-dotted border-cyanink/50 text-cyanink/95 cursor-help"
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
      >{label}</span>
      {open && (
        <span role="tooltip" className={`absolute z-40 ${flip ? 'right-0' : 'left-0'} top-full mt-1 w-64 max-w-[78vw] rounded-lg border border-black/15 bg-white shadow-xl p-2.5 text-xs font-normal text-gray-700 leading-snug normal-case tracking-normal`}>
          {def}
        </span>
      )}
    </span>
  )
}

export function gloss(text) {
  if (!text) return text
  const out = []
  const seen = new Set()
  let last = 0
  let m
  SCAN.lastIndex = 0
  while ((m = SCAN.exec(text)) !== null) {
    const frag = m[0]
    const def = defFor(frag)
    if (!def || seen.has(def)) continue
    seen.add(def)
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(<Pop key={m.index} label={frag} def={def} />)
    last = m.index + frag.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out.length ? out : text
}

export default function Glossed({ text, className = '', as: Tag = 'p' }) {
  return <Tag className={className}>{gloss(text)}</Tag>
}
