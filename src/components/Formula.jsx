import katex from 'katex'
import 'katex/dist/katex.min.css'

// Формула в математической нотации. LaTeX рендерится через KaTeX; старые
// plain-текстовые формулы (ещё не переведённые на LaTeX) показываются как
// прежде — моноширинным текстом. Цвет наследуется от className (обычно cyanink).
const TEX_RE = /[\\^{}]|_[a-zA-Z0-9]|\\(frac|dfrac|sqrt|sum|sigma|bar|cdot|times|leq|geq|approx)/

export default function Formula({ tex, className = '' }) {
  if (!tex) return null
  if (!TEX_RE.test(tex)) {
    return <span className={`font-mono ${className}`}>{tex}</span>
  }
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: false })
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
