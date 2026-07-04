// Яндекс.Метрика: тонкая обёртка вокруг счётчика владельца.
// METRIKA_ID = 0 выключает всё (no-op) — удобно для локальной разработки.
const METRIKA_ID = 110382395

export function initAnalytics() {
  if (!METRIKA_ID || typeof window === 'undefined') return
  window.ym =
    window.ym ||
    function (...args) {
      ;(window.ym.a = window.ym.a || []).push(args)
    }
  window.ym.l = Date.now()
  const src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`
  if (![...document.scripts].some((s) => s.src === src)) {
    const s = document.createElement('script')
    s.async = true
    s.src = src
    document.head.appendChild(s)
  }
  // Параметры — как в официальном сниппете счётчика владельца.
  window.ym(METRIKA_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })
}

// Цель с параметрами: track('tg_click', { place: 'header' }).
// Цели в продукте: tg_click (place: header|footer|cta), lesson_view (id),
// lesson_complete (id).
export function track(goal, params) {
  if (!METRIKA_ID || typeof window === 'undefined' || typeof window.ym !== 'function') return
  window.ym(METRIKA_ID, 'reachGoal', goal, params)
}
