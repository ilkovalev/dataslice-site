// Пререндер: после `vite build` снимает готовый HTML каждого маршрута
// (через preview-сервер + headless Chromium) и кладёт статические страницы
// в dist. GitHub Pages отдаёт /stats/foo из stats/foo.html без редиректов,
// так что поисковики и превью-боты видят контент, а не пустой div#root.
// Плюс каждой странице урока подставляются свои title/description/og/canonical.
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const SITE = 'https://data-slice.ru'
const PORT = 4179

// Уроки читаем напрямую из JSON (id, title, intro — для мета-тегов).
const lessonsDir = path.join(root, 'src/content/lessons')
const lessons = fs.readdirSync(lessonsDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(lessonsDir, f), 'utf8')))

const truncate = (s, n = 160) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…')
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

// Английские уроки: переведённые id (для них есть /en-страницы и hreflang).
const lessonsEnDir = path.join(root, 'src/content/lessons-en')
const lessonsEn = fs.readdirSync(lessonsEnDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(lessonsEnDir, f), 'utf8')))
const enIds = new Set(lessonsEn.map((l) => l.id))

// hreflang-пара: русская и английская версии одной страницы.
const alt = (ruPath, enPath) => [
  { hreflang: 'ru', href: `${SITE}${ruPath}` },
  { hreflang: 'en', href: `${SITE}${enPath}` },
  { hreflang: 'x-default', href: `${SITE}${ruPath}` },
]

// Маршруты: разделы + все уроки (RU) + переведённые разделы/уроки (EN).
// У голого /stats контент совпадает с первым уроком (клиентский redirect),
// поэтому canonical ведёт на URL урока.
const first = 'center-measures'
const routes = [
  { url: '/stats', file: 'stats.html', canonical: `${SITE}/stats/${first}` },
  { url: '/metrics', file: 'metrics.html', canonical: `${SITE}/metrics`, title: 'Иерархии метрик по 15 индустриям — «Кусочек пиццы»', desc: 'Деревья метрик North Star → драйверы → операционные → контр-метрики по 15 индустриям, с разборами реальных компаний. Бесплатно и интерактивно.', alternates: alt('/metrics', '/en/metrics') },
  { url: '/glossary', file: 'glossary.html', canonical: `${SITE}/glossary`, title: 'Глоссарий статистики и бизнес-метрик — «Кусочек пиццы»', desc: 'Термины статистики и бизнес-метрики простыми словами, с поиском по-русски и по-английски и ссылками на интерактивные уроки.', alternates: alt('/glossary', '/en/glossary') },
  ...lessons.map((l) => ({
    url: `/stats/${l.id}`,
    file: `stats/${l.id}.html`,
    canonical: `${SITE}/stats/${l.id}`,
    title: `${l.title} — «Кусочек пиццы»`,
    desc: truncate(l.intro || ''),
    alternates: enIds.has(l.id) ? alt(`/stats/${l.id}`, `/en/stats/${l.id}`) : undefined,
  })),
  // /en в приложении — клиентский redirect на /en/stats; без пререндера боты
  // (LinkedIn, TG) получали бы 404-заглушку с русскими метатегами.
  { url: '/en', file: 'en.html', canonical: `${SITE}/en/stats/${first}`, lang: 'en', title: 'Statistics you can touch — DataSlice', desc: 'Free interactive statistics course: 56 lessons from the mean to A/B tests and Bayes, plus metric trees for 15 industries. No sign-up.' },
  { url: '/en/stats', file: 'en/stats.html', canonical: `${SITE}/en/stats/${first}`, lang: 'en', title: 'Statistics you can touch — DataSlice', desc: 'Free interactive statistics course: 56 lessons from the mean to A/B tests and Bayes, plus metric trees for 15 industries. No sign-up.' },
  { url: '/en/metrics', file: 'en/metrics.html', canonical: `${SITE}/en/metrics`, lang: 'en', title: 'Metric trees for 15 industries — DataSlice', desc: 'North Star → drivers → operational → guardrail metric trees for 15 industries, with real-company breakdowns. Free and interactive.', alternates: alt('/metrics', '/en/metrics') },
  { url: '/en/glossary', file: 'en/glossary.html', canonical: `${SITE}/en/glossary`, lang: 'en', title: 'Statistics and business-metrics glossary — DataSlice', desc: 'Statistics and business-metric terms in plain words, with search and links to interactive lessons.', alternates: alt('/glossary', '/en/glossary') },
  ...lessonsEn.map((l) => ({
    url: `/en/stats/${l.id}`,
    file: `en/stats/${l.id}.html`,
    canonical: `${SITE}/en/stats/${l.id}`,
    lang: 'en',
    title: `${l.title} — DataSlice`,
    desc: truncate(l.intro || ''),
    alternates: alt(`/stats/${l.id}`, `/en/stats/${l.id}`),
  })),
]

function patchHead(html, r) {
  if (r.title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`)
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
  }
  if (r.desc) {
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.desc)}$2`)
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.desc)}$2`)
  }
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${r.canonical}$2`)
  if (r.lang === 'en') {
    html = html.replace('<html lang="ru">', '<html lang="en">')
    html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, '$1en_US$2')
    html = html.replace(/(<meta property="og:site_name" content=")[^"]*(")/, '$1DataSlice$2')
    html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${SITE}/og-en.png$2`)
  }
  let head = `  <link rel="canonical" href="${r.canonical}" />\n`
  for (const a of r.alternates ?? []) {
    head += `  <link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />\n`
  }
  html = html.replace('</head>', `${head}  </head>`)
  return html
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
async function waitServer() {
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://localhost:${PORT}/`); return } catch { await new Promise((r) => setTimeout(r, 250)) }
  }
  throw new Error('preview server did not start')
}

try {
  await waitServer()
  const browser = await chromium.launch()
  const page = await browser.newPage()
  // Не стреляем в Яндекс.Метрику при пререндере: 60 страниц на каждую сборку
  // засоряли бы статистику фейковыми визитами.
  await page.route('**://mc.yandex.*/**', (r) => r.abort())
  let n = 0
  for (const r of routes) {
    await page.goto(`http://localhost:${PORT}${r.url}`, { waitUntil: 'networkidle' })
    const html = patchHead(await page.content(), r)
    const out = path.join(dist, r.file)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, '<!doctype html>\n' + html.replace(/^<!doctype html>\s*/i, ''))
    n++
  }
  await browser.close()
  console.log(`prerendered ${n} pages`)
} finally {
  server.kill()
}
