import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { roadmaps, roles } from './src/content/roadmaps.js'

// Числа для лендинга считаем из данных на этапе сборки и подставляем литералами.
// Импортировать реестры в рантайме нельзя: уроки — это ~865 KB чанк, каталог
// метрик ещё ~350 KB, а на странице входа нужны ровно несколько чисел.
// Руками написанные цифры уже разъезжались с реальностью («56 уроков» при 57,
// «15 индустрий» при 16) — так они не соврут.
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const jsonFiles = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.json'))

const lessonFiles = jsonFiles('src/content/lessons')
const N_LESSONS = lessonFiles.length
const N_MODULES = new Set(lessonFiles.map((f) => read(path.join('src/content/lessons', f)).module)).size
const N_INDUSTRIES = jsonFiles('src/content/industries').length
const N_METRICS = jsonFiles('src/content/metrics')
  .reduce((sum, f) => sum + read(path.join('src/content/metrics', f)).length, 0)
const N_TERMS = (fs.readFileSync('src/content/glossary.js', 'utf8').match(/\{\s*term:/g) || []).length
// Число треков — тоже из данных: карточка на лендинге не должна врать, когда
// в роудмапы добавится пятая профессия. Подставляется литералом: импортировать
// модуль в чанк лендинга нельзя — это ~30 KB контента ради одной цифры.
const N_ROADMAPS = roadmaps.length

// Лёгкий индекс уроков: только то, что нужно навигации (порядок, модуль,
// заголовки). Полный JSON урока грузится отдельным чанком по требованию —
// раньше все 57 уроков в двух локалях лежали в чанке страницы целиком.
// Порядок курса — единственный источник правды, src/content/lessons/order.js.
const order = [
  ...fs.readFileSync('src/content/lessons/order.js', 'utf8').matchAll(/'([\w-]+\.json)'/g),
].map((m) => m[1])

// Два файла с одним id — тихая потеря контента: реестр EN собирается глобом
// в объект, поздний файл молча затирает ранний, а какой именно поздний —
// зависит от порядка обхода файловой системы. Так `stat-criteria.json`
// перекрывался `t-test.json`, и правки могли уходить в невидимый файл.
function readById(dir) {
  const out = {}
  const seen = {}
  for (const f of jsonFiles(dir)) {
    const l = read(path.join(dir, f))
    if (seen[l.id]) throw new Error(`${dir}: id «${l.id}» в двух файлах — ${seen[l.id]} и ${f}`)
    seen[l.id] = f
    out[l.id] = { file: f, title: l.title }
  }
  return out
}
readById('src/content/lessons') // проверка на дубли, результат не нужен
const enById = readById('src/content/lessons-en')

const LESSON_INDEX = order.map((f) => {
  const l = read(path.join('src/content/lessons', f))
  return { id: l.id, module: l.module, title: l.title, file: f, titleEn: enById[l.id]?.title ?? null, fileEn: enById[l.id]?.file ?? null }
})
// Расхождение = урок в порядке есть, а файла нет (или наоборот). Молча собрать
// неполный курс хуже, чем упасть на сборке.
const allLessonFiles = jsonFiles('src/content/lessons')
if (LESSON_INDEX.length !== allLessonFiles.length) {
  const missing = allLessonFiles.filter((f) => !order.includes(f))
  throw new Error(`order.js не покрывает все уроки. Нет в порядке: ${missing.join(', ') || '—'}`)
}

// Карта «метрика → индустрия, в чьём дереве она есть». Нужна глоссарию:
// карточка метрики открывается внутри конкретного дерева, поэтому ссылке
// мало metricId — надо ещё знать, какое дерево показать. Считаем при сборке:
// импортировать деревья в чанк глоссария нельзя, это ~350 KB.
const metricIndustry = {}
for (const f of jsonFiles('src/content/industries')) {
  const d = read(path.join('src/content/industries', f))
  const seen = new Set()
  const walk = (n) => {
    if (!n) return
    if (n.metricId) seen.add(n.metricId)
    ;(n.children || []).forEach(walk)
  }
  walk(d.root)
  ;(d.companies || []).forEach((c) => walk(c.root))
  // Первая индустрия выигрывает: порядок файлов стабилен, ссылка не «прыгает».
  for (const id of seen) if (!metricIndustry[id]) metricIndustry[id] = d.id
}

// --- Глоссарий ↔ карточка метрики -----------------------------------------
// Глоссарий и карточка метрики описывают одни и те же метрики и не должны
// расходиться по полноте: раньше в карточке были подводные камни и связанные
// метрики, а в глоссарии — нет. Теперь из каталога в глоссарий идут камни и
// связанные метрики, а из глоссария в карточку — кейс с числами. Источник
// у каждого куска один, поэтому текст не разъезжается.
const glossEntries = (file) =>
  [...fs.readFileSync(file, 'utf8').matchAll(/^\s*\{\s*term:\s*'(?:[^'\\]|\\.)*'.*$/gm)].map((m) => {
    const f = (n) => (m[0].match(new RegExp('[{,]\\s*' + n + ":\\s*'((?:[^'\\\\]|\\\\.)*)'"))?.[1] || '').replace(/\\'/g, "'")
    return { id: f('id'), metric: f('metric'), case: f('case') }
  })
const catalog = {}
for (const f of jsonFiles('src/content/metrics')) for (const m of read(path.join('src/content/metrics', f))) catalog[m.id] = m
const glossRu = glossEntries('src/content/glossary.js')
const glossEn = glossEntries('src/content/glossary-en.js')
const termByMetric = {}
for (const g of glossRu) if (g.metric && g.id && !termByMetric[g.metric]) termByMetric[g.metric] = g.id
// у каких терминов свой SQL в glossarySql.js — остальным отдаём SQL из каталога
const ownSql = new Set([...fs.readFileSync('src/content/glossarySql.js', 'utf8').matchAll(/^  '?([a-z0-9-]+)'?: `/gm)].map((m) => m[1]))
const GLOSSARY_METRICS = {}
const METRIC_CASES = {}
glossRu.forEach((g, i) => {
  const m = g.metric && catalog[g.metric]
  if (!m) return
  GLOSSARY_METRICS[g.metric] = {
    pitfalls: m.pitfalls,
    // связанные — только те, что есть в глоссарии: ссылка ведёт на термин рядом
    related: (m.related || []).map((r) => termByMetric[r]).filter((id) => id && id !== g.id),
    ...(ownSql.has(g.id) ? {} : { sql: m.sql }),
  }
  const en = glossEn.find((e) => e.id === g.id)
  if (g.case && !METRIC_CASES[g.metric]) METRIC_CASES[g.metric] = { ru: g.case, en: en?.case || '' }
})

// --- Поисковый индекс -----------------------------------------------------
// Поиск идёт по трём поверхностям сразу: темы курса, термины глоссария и
// бизнес-метрики. Индекс собирается здесь, а не в рантайме, по той же причине,
// что и всё остальное: уроки — это ~865 KB, каталог метрик ещё ~350 KB, а
// поиску хватает заголовков и ключевых слов. Сам индекс тоже не в основном
// чанке — он грузится своим чанком при первом открытии поиска
// (см. src/content/searchIndex.js).
//
// Из урока берём заголовок, первую фразу интро и термины из definitions:
// человек ищет «сезонность» или «MAPE», а не цитату из середины текста.
function buildSearchIndex(locale) {
  const en = locale === 'en'
  const out = []

  for (const meta of LESSON_INDEX) {
    const dir = en && meta.fileEn ? 'src/content/lessons-en' : 'src/content/lessons'
    const file = en && meta.fileEn ? meta.fileEn : meta.file
    const l = read(path.join(dir, file))
    const terms = (l.definitions || []).map((d) => d.term)
    // первая фраза интро: достаточно, чтобы отличить урок в выдаче,
    // и не тащит в индекс всю прозу курса
    const lead = (l.intro || '').split(/(?<=[.!?])\s/)[0] || ''
    out.push({ k: 'l', id: l.id, m: l.module, t: l.title, s: lead.slice(0, 130), w: terms.join(' · ') })
  }

  const glossSrc = fs.readFileSync(en ? 'src/content/glossary-en.js' : 'src/content/glossary.js', 'utf8')
  // Глоссарий — обычный JS-модуль, читать его парсером ради сборки индекса
  // избыточно: поля вытаскиваем регэкспом по одной записи за раз. Запись —
  // строка целиком: до первой «}» резать нельзя, в TeX-формулах есть \\text{…}.
  for (const m of glossSrc.matchAll(/^\s*\{\s*term:\s*'((?:[^'\\]|\\.)*)'.*$/gm)) {
    const entry = m[0]
    const field = (name) => entry.match(new RegExp(name + ":\\s*'((?:[^'\\\\]|\\\\.)*)'"))?.[1] || ''
    const aliases = [...entry.matchAll(/aliases:\s*\[([^\]]*)\]/g)]
      .flatMap((a) => [...a[1].matchAll(/'([^']*)'/g)].map((x) => x[1]))
    const metric = field('metric') || undefined
    out.push({
      k: 'g',
      t: m[1].replace(/\\'/g, "'"),
      s: field('def').replace(/\\'/g, "'").slice(0, 130),
      w: aliases.join(' · '),
      lesson: field('lesson') || undefined,
      metric,
      // без id индустрии карточку метрики не открыть: она живёт внутри дерева
      ind: metric ? metricIndustry[metric] : undefined,
    })
  }

  for (const f of jsonFiles('src/content/metrics')) {
    for (const mt of read(path.join('src/content/metrics', f))) {
      const title = mt.title?.[locale] || mt.title?.ru
      if (!title) continue
      out.push({
        k: 'm',
        id: mt.id,
        t: title,
        s: (mt.desc?.[locale] || mt.desc?.ru || '').slice(0, 130),
        w: (mt.aliases || []).join(' · '),
        ind: metricIndustry[mt.id],
      })
    }
  }

  // Роудмапы: три трека и роли внутри них. Ищут их именно по названию
  // профессии («дата инженер», «BI-аналитик», «ML-инженер»), и до появления
  // этих записей такой запрос не находил на сайте ничего.
  //
  // Этапы треков в индекс не идут сознательно: их заголовки («Junior»,
  // «Middle») повторяются во всех треках и в выдаче выглядели бы десятком
  // одинаковых строк. Этап открывается внутри трека.
  const loc = (v) => (typeof v === 'string' ? v : v?.[locale] || v?.ru || '')
  for (const r of roadmaps) {
    out.push({
      k: 'r',
      id: r.id,
      t: loc(r.title),
      s: loc(r.tagline).slice(0, 130),
      w: (r.aliases?.[locale] || r.aliases?.ru || []).join(' · '),
    })
  }
  for (const n of roles) {
    // Роль своего URL не имеет и живёт блоком внутри трека, к которому
    // привязана. Поэтому в записи лежит id трека: ссылка открывает нужный трек
    // и прокручивает к блоку. Без трека выдача приводила бы на страницу, где
    // этой роли в списке нет: блок показывает только роли выбранного трека.
    out.push({ k: 'r', t: loc(n.title), s: loc(n.vs).split(/(?<=[.!?])\s/)[0].slice(0, 130), nb: n.track })
  }
  return out
}

const SEARCH_RU = buildSearchIndex('ru')
const SEARCH_EN = buildSearchIndex('en')

// Сайт раздаётся из корня кастомного домена data-slice.ru → base '/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    __N_LESSONS__: N_LESSONS,
    __N_MODULES__: N_MODULES,
    __N_INDUSTRIES__: N_INDUSTRIES,
    __N_METRICS__: N_METRICS,
    __N_TERMS__: N_TERMS,
    __N_ROADMAPS__: N_ROADMAPS,
    __METRIC_INDUSTRY__: JSON.stringify(metricIndustry),
    __GLOSSARY_METRICS__: JSON.stringify(GLOSSARY_METRICS),
    __METRIC_CASES__: JSON.stringify(METRIC_CASES),
    __LESSON_INDEX__: JSON.stringify(LESSON_INDEX),
    __SEARCH_RU__: JSON.stringify(SEARCH_RU),
    __SEARCH_EN__: JSON.stringify(SEARCH_EN),
  },
})
