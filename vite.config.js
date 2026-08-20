import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

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
  // избыточно: поля вытаскиваем регэкспом по одной записи за раз.
  for (const m of glossSrc.matchAll(/\{\s*term:\s*'((?:[^'\\]|\\.)*)'[\s\S]*?\}/g)) {
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
    __METRIC_INDUSTRY__: JSON.stringify(metricIndustry),
    __LESSON_INDEX__: JSON.stringify(LESSON_INDEX),
    __SEARCH_RU__: JSON.stringify(SEARCH_RU),
    __SEARCH_EN__: JSON.stringify(SEARCH_EN),
  },
})
