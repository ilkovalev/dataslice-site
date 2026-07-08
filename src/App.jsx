import { Suspense, lazy } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation, Link } from 'react-router-dom'
import { track } from './lib/analytics.js'
import { useLocale, prefix, switchLocalePath, STR } from './lib/i18n.js'

// Редирект с сохранением query/hash: проверка счётчика Метрики (и любые
// utm-метки) приходят параметрами на «/» — терять их при переадресации нельзя.
function ToStats({ en = false }) {
  const { search, hash } = useLocation()
  return <Navigate to={`${en ? '/en' : ''}/stats${search}${hash}`} replace />
}

// Каждая страница — свой чанк: курс (уроки + виджеты) не грузится
// тем, кто пришёл за метриками или глоссарием, и наоборот.
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'))
const MetricsPage = lazy(() => import('./pages/MetricsPage.jsx'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage.jsx'))

// min-h-[44px] на мобильном — комфортная тап-зона (WCAG); на sm+ шапка снова компактная.
const linkBase = 'px-3 py-1.5 rounded-full text-sm transition-colors inline-flex items-center min-h-[44px] sm:min-h-0'
const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'bg-accent/20 text-cyanink' : 'text-gray-700 hover:bg-black/5'}`

export default function App() {
  const locale = useLocale()
  const t = STR[locale]
  const p = prefix(locale)
  const { pathname } = useLocation()
  const otherLocale = locale === 'en' ? 'ru' : 'en'
  return (
    <div className="min-h-screen">
      <div className="h-1 bg-gradient-to-r from-accent to-brand" />
      {/* Бар во всю ширину экрана; контент внутри — в общей сетке max-w-[1600px]. */}
      <header className="sticky top-0 z-10">
        <div className="border-b border-accent/20 bg-accent/10 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-4 py-2 sm:py-0 sm:h-14 lg:h-14 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="order-1 font-semibold whitespace-nowrap sm:mr-4">{t.brand} <span aria-hidden>🍕</span></span>
          <span className="order-2 ml-auto flex items-center gap-2 sm:order-3">
            <Link
              to={switchLocalePath(pathname, otherLocale)}
              title={otherLocale === 'en' ? 'English version' : 'Русская версия'}
              className="text-xs px-2.5 py-1.5 rounded-full border border-black/10 text-gray-600 hover:bg-black/5 transition-colors uppercase tracking-wide inline-flex items-center min-h-[44px] sm:min-h-0"
            >
              {otherLocale}
            </Link>
            <a
              href="https://t.me/dataslice"
              target="_blank"
              rel="noreferrer"
              onClick={() => track('tg_click', { place: 'header' })}
              className="text-sm px-3 py-1.5 rounded-full bg-cyanink text-white hover:bg-cyanink/90 transition-colors whitespace-nowrap inline-flex items-center min-h-[44px] sm:min-h-0"
            >
              {t.tgButton}
            </a>
          </span>
          <nav className="order-3 w-full flex gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            <NavLink to={`${p}/stats`} className={linkClass}>{t.navStats}</NavLink>
            <NavLink to={`${p}/metrics`} className={linkClass}>{t.navMetrics}</NavLink>
            <NavLink to={`${p}/glossary`} className={linkClass}>{t.navGlossary}</NavLink>
          </nav>
        </div>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<ToStats />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/stats/:lessonSlug" element={<StatsPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
            <Route path="/en" element={<ToStats en />} />
            <Route path="/en/stats" element={<StatsPage />} />
            <Route path="/en/stats/:lessonSlug" element={<StatsPage />} />
            <Route path="/en/metrics" element={<MetricsPage />} />
            <Route path="/en/glossary" element={<GlossaryPage />} />
            <Route path="*" element={<ToStats />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-black/10 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 py-6 text-sm text-gray-600">
          {t.footerText}{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" onClick={() => track('tg_click', { place: 'footer' })} className="text-cyanink hover:underline">{t.brand} 🍕</a>{' '}
          — {t.footerTail}{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" onClick={() => track('tg_click', { place: 'footer' })} className="text-cyanink hover:underline">{t.footerSubscribe}</a>{' '}
          <span className="text-gray-400">·</span>{' '}
          <a href="https://t.me/dataslice/109" target="_blank" rel="noreferrer" onClick={() => track('feedback_click')} className="text-cyanink hover:underline">{t.footerFeedback}</a>
        </div>
      </footer>
    </div>
  )
}
