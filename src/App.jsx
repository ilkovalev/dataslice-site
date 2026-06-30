import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import StatsPage from './pages/StatsPage.jsx'
import MetricsPage from './pages/MetricsPage.jsx'
import GlossaryPage from './pages/GlossaryPage.jsx'

const linkBase = 'px-3 py-1.5 rounded-md text-sm transition-colors'
const linkClass = ({ isActive }) =>
  `${linkBase} ${isActive ? 'bg-accent/20 text-cyanink' : 'text-gray-700 hover:bg-black/5'}`

export default function App() {
  return (
    <div className="min-h-screen">
      <div className="h-1 bg-gradient-to-r from-accent to-brand" />
      <header className="border-b border-accent/20 sticky top-0 bg-accent/10 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-4 py-2 sm:py-0 sm:h-14 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="order-1 font-semibold whitespace-nowrap sm:mr-4">«Кусочек пиццы» <span aria-hidden>🍕</span></span>
          <a
            href="https://t.me/dataslice"
            target="_blank"
            rel="noreferrer"
            className="order-2 ml-auto text-sm px-3 py-1.5 rounded-md bg-accent text-white border border-accent hover:opacity-90 transition-opacity whitespace-nowrap sm:order-3"
          >
            🍕 Telegram-канал
          </a>
          <nav className="order-3 w-full flex gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            <NavLink to="/stats" className={linkClass}>Статистика</NavLink>
            <NavLink to="/metrics" className={linkClass}>Иерархии метрик</NavLink>
            <NavLink to="/glossary" className={linkClass}>Глоссарий</NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/stats" replace />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
        </Routes>
      </main>
      <footer className="border-t border-black/10 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-gray-600">
          Полезные материалы для аналитиков от канала{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" className="text-cyanink hover:underline">«Кусочек пиццы» 🍕</a>{' '}
          — аналитика данных простыми словами.{' '}
          <a href="https://t.me/dataslice" target="_blank" rel="noreferrer" className="text-cyanink hover:underline">Подписаться →</a>
        </div>
      </footer>
    </div>
  )
}
