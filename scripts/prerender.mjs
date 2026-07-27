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

// Числа в метатегах считаем из данных, а не пишем руками: раньше в описаниях
// висели «56 уроков» и «15 индустрий», когда на сайте было уже 57 и 16.
const N_LESSONS = lessons.length
const N_INDUSTRIES = fs.readdirSync(path.join(root, 'src/content/industries'))
  .filter((f) => f.endsWith('.json')).length

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
  { url: '/metrics', file: 'metrics.html', canonical: `${SITE}/metrics`, title: `Иерархии метрик по ${N_INDUSTRIES} индустриям — «Кусочек пиццы»`, desc: `Деревья метрик North Star → драйверы → операционные → контр-метрики по ${N_INDUSTRIES} индустриям, с разборами реальных компаний. Бесплатно и интерактивно.`, alternates: alt('/metrics', '/en/metrics') },
  { url: '/glossary', file: 'glossary.html', canonical: `${SITE}/glossary`, title: 'Глоссарий статистики и бизнес-метрик — «Кусочек пиццы»', desc: 'Термины статистики и бизнес-метрики простыми словами, с поиском по-русски и по-английски и ссылками на интерактивные уроки.', alternates: alt('/glossary', '/en/glossary') },
  ...lessons.map((l) => ({
    url: `/stats/${l.id}`,
    file: `stats/${l.id}.html`,
    canonical: `${SITE}/stats/${l.id}`,
    title: `${l.title} — «Кусочек пиццы»`,
    desc: truncate(l.intro || ''),
    alternates: enIds.has(l.id) ? alt(`/stats/${l.id}`, `/en/stats/${l.id}`) : undefined,
  })),
  // /en — английский лендинг. Без пререндера боты (LinkedIn, TG) получали бы
  // 404-заглушку с русскими метатегами.
  { url: '/en', file: 'en.html', canonical: `${SITE}/en`, lang: 'en', alternates: alt('/', '/en'), title: 'Analytics you can touch — DataSlice', desc: `An interactive reference for analysts: ${N_LESSONS} statistics lessons, metric trees for ${N_INDUSTRIES} industries and a glossary. No sign-up.` },
  { url: '/en/stats', file: 'en/stats.html', canonical: `${SITE}/en/stats/${first}`, lang: 'en', title: 'Statistics you can touch — DataSlice', desc: `Free interactive statistics course: ${N_LESSONS} lessons from the mean to A/B tests and Bayes, plus metric trees for ${N_INDUSTRIES} industries. No sign-up.` },
  { url: '/en/metrics', file: 'en/metrics.html', canonical: `${SITE}/en/metrics`, lang: 'en', title: `Metric trees for ${N_INDUSTRIES} industries — DataSlice`, desc: `North Star → drivers → operational → guardrail metric trees for ${N_INDUSTRIES} industries, with real-company breakdowns. Free and interactive.`, alternates: alt('/metrics', '/en/metrics') },
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
  // Лендинг — СТРОГО ПОСЛЕДНИМ. Он перезаписывает dist/index.html, из которого
  // preview-сервер отдаёт все остальные маршруты по SPA-фолбэку: попади он в
  // начало, следующие страницы снимались бы поверх разметки лендинга.
  // Без этой записи «/» вообще осталась бы единственной страницей без готового
  // HTML — превью ссылки в Telegram и поисковики получали бы пустой каркас,
  // то есть провал ровно там, ради чего лендинг и делается.
  {
    url: '/',
    file: 'index.html',
    canonical: `${SITE}/`,
    title: 'Аналитика, которую можно потрогать — «Кусочек пиццы»',
    desc: `Интерактивный справочник для аналитика: ${N_LESSONS} уроков статистики, деревья метрик по ${N_INDUSTRIES} индустриям и глоссарий. Без регистрации.`,
    alternates: alt('/', '/en'),
  },
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
  // /en/ со слэшем: Pages ищет для него en/index.html. Копируем готовый en.html,
  // а не снимаем маршрут второй раз — повторный заход на /en отдавал бы уже
  // пропатченный файл, и canonical с hreflang задваивались бы.
  fs.mkdirSync(path.join(dist, 'en'), { recursive: true })
  fs.copyFileSync(path.join(dist, 'en.html'), path.join(dist, 'en/index.html'))

  // Sitemap собираем здесь же, из того же списка маршрутов. Раньше он лежал
  // в public/ и правился руками — и отстал: 68 URL вместо 122, без лендинга,
  // без /en и без единого английского урока (они появились уже после того,
  // как файл написали). Пока источник один, разъехаться нечему.
  // lastmod берём из даты изменения исходного JSON, а не из даты сборки:
  // иначе каждая пересборка помечала бы весь сайт как обновлённый.
  const srcMtime = (r) => {
    const id = r.url.match(/\/stats\/(.+)$/)?.[1]
    const dir = r.lang === 'en' ? lessonsEnDir : lessonsDir
    if (id) {
      const f = fs.readdirSync(dir).find((x) => x.endsWith('.json') && JSON.parse(fs.readFileSync(path.join(dir, x), 'utf8')).id === id)
      if (f) return fs.statSync(path.join(dir, f)).mtime
    }
    return new Date()
  }
  const seen = new Set()
  const entries = []
  for (const r of routes) {
    // В карту сайта — только канонические адреса: у /stats canonical ведёт
    // на первый урок, дублировать его отдельной строкой незачем.
    if (r.canonical !== `${SITE}${r.url === '/' ? '/' : r.url}`) continue
    if (seen.has(r.canonical)) continue
    seen.add(r.canonical)
    entries.push(`  <url><loc>${r.canonical}</loc><lastmod>${srcMtime(r).toISOString().slice(0, 10)}</lastmod></url>`)
  }
  fs.writeFileSync(
    path.join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
  )
  console.log(`prerendered ${n} pages (+ en/index.html копией, sitemap: ${entries.length} URL)`)
} finally {
  server.kill()
}
