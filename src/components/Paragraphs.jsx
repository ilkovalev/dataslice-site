import { gloss } from './Glossed.jsx'

// Рендер текста как набора абзацев. Принимает массив строк или одну строку
// (тогда делит по пустой строке). Термины оборачиваются во всплывающие пояснения.
export default function Paragraphs({ text, className = '' }) {
  const parts = Array.isArray(text) ? text : String(text).split(/\n\n+/)
  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <p key={i} className={className}>{gloss(p)}</p>
      ))}
    </div>
  )
}
