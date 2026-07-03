// Яндекс.Метрика: тонкая обёртка. Пока METRIKA_ID = 0, всё выключено (no-op) —
// цели уже расставлены по продукту, счётчик включается одной константой.
// TODO: создать счётчик на metrika.yandex.ru (без вебвизора) и вписать ID.
const METRIKA_ID = 0

export function initAnalytics() {
  if (!METRIKA_ID || typeof window === 'undefined') return
  window.ym =
    window.ym ||
    function (...args) {
      ;(window.ym.a = window.ym.a || []).push(args)
    }
  window.ym.l = Date.now()
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(s)
  window.ym(METRIKA_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  })
}

// Цель с параметрами: track('tg_click', { place: 'header' }).
// Цели в продукте: tg_click (place: header|footer|cta), lesson_view (id),
// lesson_complete (id).
export function track(goal, params) {
  if (!METRIKA_ID || typeof window === 'undefined' || typeof window.ym !== 'function') return
  window.ym(METRIKA_ID, 'reachGoal', goal, params)
}
