import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SubscribeCTA from '../components/SubscribeCTA.jsx'
import { STR, prefix, useLocale } from '../lib/i18n.js'
import { TG_FEEDBACK } from '../lib/links.js'

// Страница входа. Задача — не продать курс, а развести людей по трём дверям
// и честно сказать, что это за проект. Раньше «/» редиректил на первый урок:
// человек из поста в Telegram падал в середину учебника, а два других раздела
// (метрики с SQL и глоссарий) с главной не были видны вообще.
//
// Живого интерактива здесь сознательно нет. Любой виджет — это виджет
// конкретного урока: он дублировал бы то, что человек увидит через один клик,
// молча заявлял бы «сайт про статистику» (ровно та ошибка позиционирования,
// которую лендинг и чинит) и давал бы чувство «я уже получил, что хотел».
// Слоган «можно потрогать» подкрепляем статичными превью — они показывают
// все три раздела поровну и не тянут ни килобайта JS.

// Превью рисуем руками. Соблазн переиспользовать MetricTreeGraph в режиме
// plain — вредный: цепочка MetricTreeGraph → MetricCardModal → Formula → katex
// затащила бы ~290 KB чанк KaTeX на страницу входа ради картинки из семи
// прямоугольников. Здесь — двадцать строк SVG и ноль зависимостей.
const SW = { className: 'w-full h-24', viewBox: '0 0 200 72', role: 'img', 'aria-hidden': true }

function StatsPreview({ meanLabel, medianLabel }) {
  const dots = [18, 26, 34, 39, 44, 48, 52, 55, 58, 62, 66, 71, 77, 84, 93, 104, 118, 138]
  return (
    <svg {...SW}>
      <line x1="10" y1="52" x2="190" y2="52" stroke="#d6cebf" strokeWidth="1.5" />
      {dots.map((x, i) => (
        <circle key={i} cx={x + 10} cy={44 - (i % 3) * 5} r="2.6" fill="#2ab8eb" opacity="0.75" />
      ))}
      <line x1="72" y1="20" x2="72" y2="56" stroke="#0a6c97" strokeWidth="1.5" />
      <line x1="58" y1="26" x2="58" y2="56" stroke="#d9a300" strokeWidth="1.5" />
      <text x="76" y="18" fontSize="8" fill="#0a6c97">{meanLabel}</text>
      <text x="10" y="26" fontSize="8" fill="#d9a300">{medianLabel}</text>
    </svg>
  )
}

function MetricsPreview() {
  const leaves = [22, 68, 122, 168]
  return (
    <svg {...SW}>
      <rect x="72" y="4" width="56" height="15" rx="3" fill="#0a6c97" opacity="0.9" />
      <rect x="34" y="29" width="52" height="14" rx="3" fill="#2ab8eb" opacity="0.55" />
      <rect x="114" y="29" width="52" height="14" rx="3" fill="#2ab8eb" opacity="0.55" />
      {leaves.map((x) => <rect key={x} x={x} y="54" width="32" height="12" rx="3" fill="#20242e" opacity="0.18" />)}
      <path d="M100,19 C100,26 60,24 60,29" stroke="#d6cebf" fill="none" strokeWidth="1.4" />
      <path d="M100,19 C100,26 140,24 140,29" stroke="#d6cebf" fill="none" strokeWidth="1.4" />
      <path d="M60,43 C60,50 38,48 38,54" stroke="#d6cebf" fill="none" strokeWidth="1.2" />
      <path d="M60,43 C60,50 84,48 84,54" stroke="#d6cebf" fill="none" strokeWidth="1.2" />
      <path d="M140,43 C140,50 138,48 138,54" stroke="#d6cebf" fill="none" strokeWidth="1.2" />
      <path d="M140,43 C140,50 184,48 184,54" stroke="#d6cebf" fill="none" strokeWidth="1.2" />
    </svg>
  )
}

function GlossaryPreview() {
  return (
    <svg {...SW}>
      <rect x="10" y="6" width="180" height="18" rx="9" fill="none" stroke="#d6cebf" strokeWidth="1.5" />
      <circle cx="22" cy="15" r="4" fill="none" stroke="#0a6c97" strokeWidth="1.5" />
      <line x1="25" y1="18" x2="28" y2="21" stroke="#0a6c97" strokeWidth="1.5" />
      <rect x="34" y="12" width="42" height="6" rx="3" fill="#20242e" opacity="0.22" />
      <rect x="10" y="32" width="180" height="16" rx="4" fill="#2ab8eb" opacity="0.1" />
      <rect x="16" y="37" width="48" height="6" rx="3" fill="#0a6c97" opacity="0.75" />
      <rect x="70" y="37" width="102" height="6" rx="3" fill="#20242e" opacity="0.16" />
      <rect x="10" y="52" width="180" height="16" rx="4" fill="#2ab8eb" opacity="0.1" />
      <rect x="16" y="57" width="34" height="6" rx="3" fill="#0a6c97" opacity="0.75" />
      <rect x="56" y="57" width="116" height="6" rx="3" fill="#20242e" opacity="0.16" />
    </svg>
  )
}

function Door({ preview, title, count, what, who, to, open, accent }) {
  return (
    <Link
      to={to}
      className={`group flex flex-col rounded-[1.15rem] border bg-panel/60 p-5 transition-shadow hover:shadow-[0_10px_36px_rgba(32,36,46,0.09)] ${
        accent ? 'border-accent/40' : 'border-black/10'
      }`}
    >
      <div className="rounded-lg bg-ink/50 mb-4 px-2 py-1">{preview}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className={`text-sm font-medium mt-0.5 ${accent ? 'text-cyanink' : 'text-gray-500'}`}>{count}</div>
      <p className="text-sm text-gray-700 leading-relaxed mt-2 flex-1">{what}</p>
      <p className="text-xs text-gray-500 mt-2">{who}</p>
      <span className="text-sm text-cyanink mt-3 group-hover:underline">{open}</span>
    </Link>
  )
}

function Scenario({ text, linkText, to }) {
  return (
    <li className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 py-2.5 border-b border-black/[0.07] last:border-0">
      <span className="text-gray-900 sm:flex-1">{text}</span>
      <Link to={to} className="text-sm text-cyanink hover:underline">{linkText}</Link>
    </li>
  )
}

export default function LandingPage() {
  const locale = useLocale()
  const t = STR[locale]
  const l = t.landing
  const p = prefix(locale)

  useEffect(() => { document.title = `${l.h1} — ${t.brand}` }, [l, t])

  return (
    <div className="max-w-5xl mx-auto">
      {/* Первый экран: за пять секунд сказать, что это и для кого, и увести
          к трём дверям. Чисел здесь нет — они живут в карточках, где есть контекст. */}
      <section className="text-center py-10 md:py-16">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900">{l.h1}</h1>
        <p className="text-gray-700 leading-relaxed mt-4 max-w-2xl mx-auto">{l.sub}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
          <Link
            to={`${p}/stats/center-measures`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-cyanink text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {l.ctaPrimary}
          </Link>
          <Link
            to={`${p}/metrics`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-black/15 text-gray-800 font-medium hover:bg-black/5 transition-colors"
          >
            {l.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* Три двери — ядро лендинга. Карточку метрик выделяем: 104 метрики
          с готовым SQL — самый недооценённый актив, он спрятан за вкладкой. */}
      <section className="mt-4">
        <h2 className="sr-only">{l.doorsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Door
            preview={<StatsPreview meanLabel={l.previewMean} medianLabel={l.previewMedian} />}
            title={l.statsTitle}
            count={l.statsCount(__N_LESSONS__, __N_MODULES__)}
            what={l.statsWhat}
            who={l.statsWho}
            to={`${p}/stats/center-measures`}
            open={l.open}
          />
          <Door
            accent
            preview={<MetricsPreview />}
            title={l.metricsTitle}
            count={l.metricsCount(__N_INDUSTRIES__, __N_METRICS__)}
            what={l.metricsWhat}
            who={l.metricsWho}
            to={`${p}/metrics`}
            open={l.open}
          />
          <Door
            preview={<GlossaryPreview />}
            title={l.glossaryTitle}
            count={l.glossaryCount(__N_TERMS__)}
            what={l.glossaryWhat}
            who={l.glossaryWho}
            to={`${p}/glossary`}
            open={l.open}
          />
        </div>
      </section>

      {/* Сценарии: превращают описание разделов в навигацию и закрывают
          проблему «57 уроков без точки входа». */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{l.scenariosTitle}</h2>
        <ul className="text-sm">
          <Scenario text={l.scenario1} linkText={l.scenario1Links} to={`${p}/stats/hypothesis-test`} />
          <Scenario text={l.scenario2} linkText={l.scenario2Links} to={`${p}/metrics`} />
          <Scenario text={l.scenario3} linkText={l.scenario3Links} to={`${p}/glossary`} />
        </ul>
      </section>

      {/* Честность про статус — актив, а не слабость: для аудитории джунов
          она снимает завышенные ожидания и вызывает доверие. */}
      <section className="mt-14 rounded-[1.15rem] border border-black/10 bg-panel/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{l.aboutTitle}</h2>
        <p className="text-gray-700 leading-relaxed">{l.aboutP1}</p>
        <p className="text-gray-700 leading-relaxed mt-3">{l.aboutP2}</p>
        <a
          href={TG_FEEDBACK}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-cyanink hover:underline mt-3"
        >
          {l.aboutFeedback}
        </a>
      </section>

      {/* Подписка. Счётчик подписчиков сознательно не показываем: канал пока
          небольшой, и маленькое число работает как отрицательное доказательство. */}
      <section className="mt-14 mb-8">
        <SubscribeCTA locale={locale} />
      </section>
    </div>
  )
}
