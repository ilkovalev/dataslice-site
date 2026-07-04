import { Suspense, lazy } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { track } from './lib/analytics.js'

// Редирект с сохранением query/hash: проверка счётчика Метрики (и любые
// utm-метки) приходят параметрами на «/» — терять их при переадресации нельзя.
function ToStats() {
  const { search, hash } = useLocation()
  return <Navigate to={`/stats${search}${hash}`} replace />
}

// Каждая страница — свой чанк: курс (уроки + виджеты) не грузится
// тем, кто пришёл за метриками или глоссарием, и наоборот.
const StatsPage = lazy(() => import('./pages/StatsPage.jsx'))
const MetricsPage = lazy(() => import('./pages/MetricsPage.jsx'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage.jsx'))

const linkBase = 'px-3 py-1.5 rounded-full text-sm transition-colors'
const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'bg-accent/20 text-cyanink' : 'text-gray-700 hover:bg-black/5'}`

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="h-1 bg-gradient-to-r from-accent to-brand" />
      {/* Мобайл: обычная полоса. Десктоп (lg+): парящая glass-«капсула» (soft-skill). */}
      <header className="sticky top-0 z-10 lg:top-4 lg:px-4">
        <div className="border-b border-accent/20 bg-accent/10 backdrop-blur lg:max-w-fit lg:mx-auto lg:rounded-full lg:border lg:border-black/5 lg:bg-white/75 lg:shadow-[0_8px_30px_rgba(32,36,46,0.08)]">
        <div className="max-w-[1600px] mx-auto px-4 py-2 sm:py-0 sm:h-14 lg:h-12 lg:px-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="order-1 font-semibold whitespace-nowrap sm:mr-4">«Кусочек пиццы» <span aria-hidden>🍕</span></span>
          <a
            href="https://t.me/dataslice"
            target="_blank"
            rel="noreferrer"
            onClick={() => track('tg_click', { place: 'header' })}
            className="order-2 ml-auto text-sm px-3 py-1.5 rounded-full text-cyanink border border-accent/30 hover:bg-accent/10 transition-colors whitespace-nowrap sm:order-3"
          >
            🍕 Telegram-канал
          </a>
          <nav className="order-3 w-full flex gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            <NavLink to="/stats" className={linkClass}>Статистика</NavLink>
            <NavLink to="/metrics" className={linkClass}>Иерархии метрик</NavLink>
            <NavLink to="/glossary" className={linkClass}>Глоссарий</NavLink>
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
            <Route path="*" element={<ToStats />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-black/10 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 py-6 text-sm text-gray-600">
          Полезные материалы для аналитиков от канала{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" onClick={() => track('tg_click', { place: 'footer' })} className="text-cyanink hover:underline">«Кусочек пиццы» 🍕</a>{' '}
          — аналитика данных простыми словами.{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" onClick={() => track('tg_click', { place: 'footer' })} className="text-cyanink hover:underline">Подписаться →</a>{' '}
          <span className="text-gray-400">·</span>{' '}
          <a href="https://t.me/dataslice/109" target="_blank" rel="noreferrer" onClick={() => track('feedback_click')} className="text-cyanink hover:underline">Оставить фидбек →</a>
        </div>
      </footer>
    </div>
  )
}
