// Призыв подписаться на канал. Брендовый блок (cyan + лёгкий пицца-паттерн).
import { track } from '../lib/analytics.js'

export default function SubscribeCTA({
  heading = 'Понравились материалы?',
  text = 'Эти материалы делает канал «Кусочек пиццы» — аналитика данных простыми словами: разборы реальных кейсов, метрики, карьера. Подпишитесь, чтобы не потерять.',
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-accent/10 p-6">
      <div
        aria-hidden
        className="pointer-events-none select-none absolute -inset-4 opacity-[0.07] text-2xl leading-[1.7] tracking-[0.35em] -rotate-12 break-words"
      >
        {'🍕'.repeat(360)}
      </div>
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-4xl leading-none" aria-hidden>🍕</div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-gray-900">{heading}</div>
          <p className="text-sm text-gray-700 mt-1 max-w-xl">{text}</p>
        </div>
        <a
          href="https://t.me/dataslice"
          target="_blank"
          rel="noreferrer"
          onClick={() => track('tg_click', { place: 'cta' })}
          className="shrink-0 px-5 py-2.5 rounded-lg bg-accent text-white font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Подписаться на «Кусочек пиццы»
        </a>
      </div>
    </div>
  )
}
