// Призыв подписаться на канал. Брендовый блок (cyan + лёгкий пицца-паттерн).
// Оформление — soft-skill: Double-Bezel («стекло в лотке») + кнопка-в-кнопке.
import { track } from '../lib/analytics.js'
import { STR } from '../lib/i18n.js'

export default function SubscribeCTA({ locale = 'ru', heading, text }) {
  const t = STR[locale]
  heading = heading ?? t.ctaHeading
  text = text ?? t.ctaText
  return (
    <div className="rounded-[1.4rem] bg-black/[0.04] ring-1 ring-black/5 p-1.5 shadow-[0_12px_40px_rgba(32,36,46,0.08)]">
      <div className="relative overflow-hidden rounded-[calc(1.4rem-0.375rem)] border border-accent/30 bg-accent/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
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
            className="group shrink-0 inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 rounded-full bg-cyanink text-white font-semibold whitespace-nowrap transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
          >
            {t.ctaButton}
            <span
              aria-hidden
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105"
            >
              →
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
