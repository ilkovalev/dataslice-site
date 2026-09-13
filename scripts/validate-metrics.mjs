#!/usr/bin/env node
// Валидатор контента метрик: справочник (src/content/metrics/*.json)
// и деревья индустрий (src/content/industries/*.json).
//
// Проверки:
//  - уникальность id записей каталога и узлов внутри дерева;
//  - все metricId узлов существуют в каталоге;
//  - related ссылаются на существующие записи;
//  - level узла соответствует фактической глубине;
//  - глубина каждого дерева = 6 уровней (0–5);
//  - парность ru/en: каждое локализуемое поле — либо строка без кириллицы
//    (общее для обеих локалей, например "CAC"), либо объект {ru, en} с обоими
//    непустыми значениями. Строка с кириллицей = непереведённая — ошибка;
//  - разбор по фреймворкам (industries/frameworks/<id>.json): у каждой индустрии
//    есть aarrr и heart, стадии идут в каноническом порядке и полным составом,
//    у каждой метрики есть запись в каталоге и определение «как считается здесь».
//
// Канон-паттерны веток (для консистентности деревьев между индустриями):
//  - «Привлечение»: каналы → CAC/ROAS по каналу → креативы/лендинг → CR шага;
//  - «Удержание»: когортный retention → churn и его причины → win-back/CRM;
//  - «Монетизация»: чек/ARPU → состав корзины/подписки → ценообразование;
//  - специфику индустрии добавляем поверх паттерна (выкуп у fashion,
//    ликвидность у маркетплейса, буст у классифайдов), не вместо него.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AARRR_STAGES, HEART_DIMS } from '../src/content/frameworks.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)

const CYRILLIC = /[а-яА-ЯёЁ]/
const isLocObj = (v) => v && typeof v === 'object' && !Array.isArray(v) && ('ru' in v || 'en' in v)

function checkLoc(file, path, v, { allowPlain = true } = {}) {
  if (v == null) return
  if (typeof v === 'string') {
    if (!allowPlain || CYRILLIC.test(v)) err(file, `${path}: строка «${String(v).slice(0, 60)}» не локализована — нужен объект {ru, en}`)
    return
  }
  if (isLocObj(v)) {
    for (const k of ['ru', 'en']) {
      const s = v[k]
      if (Array.isArray(s)) {
        if (!s.length) err(file, `${path}.${k}: пустой массив`)
        s.forEach((x, i) => { if (typeof x !== 'string' || !x.trim()) err(file, `${path}.${k}[${i}]: пусто`) })
      } else if (typeof s !== 'string' || !s.trim()) {
        err(file, `${path}.${k}: отсутствует или пусто`)
      }
    }
    if (Array.isArray(v.ru) !== Array.isArray(v.en)) err(file, `${path}: ru и en разных типов`)
    if (Array.isArray(v.ru) && Array.isArray(v.en) && v.ru.length !== v.en.length) err(file, `${path}: ru (${v.ru.length}) и en (${v.en.length}) разной длины`)
    return
  }
  err(file, `${path}: неожиданный тип ${typeof v}`)
}

// ---------- Каталог ----------
const metricsDir = join(root, 'src/content/metrics')
const catalogIds = new Set()
const catalog = []
const CATEGORIES = new Set(['acquisition', 'engagement', 'retention', 'monetization', 'marketplace', 'quality', 'finance', 'platform'])

for (const f of readdirSync(metricsDir).filter((f) => f.endsWith('.json')).sort()) {
  const file = `metrics/${f}`
  const arr = JSON.parse(readFileSync(join(metricsDir, f), 'utf8'))
  for (const m of arr) {
    if (!m.id) { err(file, 'запись без id'); continue }
    if (catalogIds.has(m.id)) err(file, `дубль id «${m.id}» в каталоге`)
    catalogIds.add(m.id)
    catalog.push({ ...m, _file: file })
    if (!CATEGORIES.has(m.category)) err(file, `${m.id}: неизвестная категория «${m.category}»`)
    checkLoc(file, `${m.id}.title`, m.title, { allowPlain: false })
    checkLoc(file, `${m.id}.desc`, m.desc, { allowPlain: false })
    if (m.tex) checkLoc(file, `${m.id}.tex`, m.tex)
    if (m.pitfalls) checkLoc(file, `${m.id}.pitfalls`, m.pitfalls, { allowPlain: false })
    if (typeof m.sql !== 'string' || !m.sql.trim()) err(file, `${m.id}: нет sql`)
  }
}
for (const m of catalog) {
  for (const r of m.related ?? []) {
    if (!catalogIds.has(r)) err(m._file, `${m.id}: related «${r}» не существует в каталоге`)
  }
}

// ---------- Деревья ----------
const REQUIRED_DEPTH = 5 // максимальный уровень (0–5) = 6 уровней

function checkTree(file, label, node, seen, depth = 0) {
  if (!node.id) err(file, `${label}: узел без id (глубина ${depth})`)
  else if (seen.has(node.id)) err(file, `${label}: дубль id узла «${node.id}»`)
  else seen.add(node.id)
  if ((node.level ?? depth) !== depth) err(file, `${label}: узел «${node.id}» level=${node.level}, фактическая глубина ${depth}`)
  checkLoc(file, `${label}.${node.id}.title`, node.title)
  checkLoc(file, `${label}.${node.id}.note`, node.note)
  checkLoc(file, `${label}.${node.id}.formula`, node.formula)
  if (node.metricId && !catalogIds.has(node.metricId)) err(file, `${label}: узел «${node.id}» metricId «${node.metricId}» не существует в каталоге`)
  if (node.kind && !['lever', 'group'].includes(node.kind)) err(file, `${label}: узел «${node.id}» неизвестный kind «${node.kind}»`)
  // Главное правило раздела: у каждого узла есть, что показать по клику.
  // Вычисляемая метрика → metricId (формула + SQL + подводные камни из каталога);
  // рычаг → kind: 'lever'; структурная ветка → kind: 'group'.
  if (!node.metricId && !node.kind) {
    err(file, `${label}: узел «${node.id}» без metricId и без kind — вычисляемой метрике нужна запись каталога, иначе пометьте узел kind: 'lever' или 'group'`)
  }
  if (node.metricId && node.kind) err(file, `${label}: узел «${node.id}» имеет и metricId, и kind «${node.kind}» — выберите одно`)
  let max = depth
  for (const c of node.children ?? []) max = Math.max(max, checkTree(file, label, c, seen, depth + 1))
  return max
}

function checkTreeRoot(file, label, obj) {
  const seen = new Set()
  const maxDepth = checkTree(file, label, obj.root, seen)
  if (maxDepth !== REQUIRED_DEPTH) err(file, `${label}: глубина дерева ${maxDepth} (уровни 0–${maxDepth}), требуется 0–${REQUIRED_DEPTH}`)
  checkLoc(file, `${label}.northStar`, obj.northStar)
  for (const [i, c] of (obj.counterMetrics ?? []).entries()) {
    checkLoc(file, `${label}.counterMetrics[${i}].title`, c.title)
    checkLoc(file, `${label}.counterMetrics[${i}].note`, c.note)
  }
  const p = obj.pyramid
  if (p) {
    checkLoc(file, `${label}.pyramid.note`, p.note)
    for (const [i, b] of (p.bands ?? []).entries()) {
      checkLoc(file, `${label}.pyramid.bands[${i}].label`, b.label)
      checkLoc(file, `${label}.pyramid.bands[${i}].role`, b.role)
      b.items?.forEach((it, j) => checkLoc(file, `${label}.pyramid.bands[${i}].items[${j}]`, it))
    }
  }
}

// ---------- Разбор по фреймворкам ----------
// Стадии обязаны идти полным составом и в каноническом порядке: вид рисует их
// как один сквозной путь, и пропуск стадии читается как «здесь её не бывает».
function checkFrameworks(file, fw) {
  if (!fw) { err(file, 'нет файла разбора по фреймворкам — вид «Фреймворк» покажет заглушку'); return }

  const checkBlock = (kind, block, spec, rowsKey, extra) => {
    if (!block) { err(file, `frameworks.${kind}: блок отсутствует`); return }
    const crossStage = {}
    checkLoc(file, `frameworks.${kind}.note`, block.note, { allowPlain: false })
    const rows = block[rowsKey] ?? []
    const want = spec.map((x) => x.key)
    const got = rows.map((r) => r.key)
    if (got.join(',') !== want.join(',')) {
      err(file, `frameworks.${kind}.${rowsKey}: порядок или состав стадий «${got.join(', ')}», ожидается «${want.join(', ')}»`)
    }
    for (const r of rows) {
      const at = `frameworks.${kind}.${r.key}`
      extra(at, r)
      if (!Array.isArray(r.metrics) || r.metrics.length === 0) {
        err(file, `${at}: нет метрик — стадия без метрик оставляет в верстке пустое место`)
        continue
      }
      const seen = new Set()
      for (const m of r.metrics) {
        // Одна метрика может стоять на двух стадиях (Retention D1 в активации и
        // D7/D30 в удержании), но только если названия разные: иначе на странице
        // дважды подряд появляется одинаковая карточка и это читается как баг.
        const at2 = `frameworks.${kind}`
        crossStage[m.metricId] ??= []
        crossStage[m.metricId].push({ row: r.key, label: JSON.stringify(m.label ?? null), at: at2 })
        if (!m.metricId) { err(file, `${at}: метрика без metricId`); continue }
        if (!catalogIds.has(m.metricId)) err(file, `${at}: metricId «${m.metricId}» не существует в каталоге`)
        if (seen.has(m.metricId)) err(file, `${at}: metricId «${m.metricId}» повторяется внутри стадии`)
        seen.add(m.metricId)
        if (m.label) checkLoc(file, `${at}.${m.metricId}.label`, m.label)
        if (kind === 'aarrr') {
          // Ради этих строк вид и существует: «конкретная метрика» — это метрика
          // плюс определение того, что именно тут считают.
          if (!m.def) err(file, `${at}: у метрики «${m.metricId}» нет def — без него на странице остаётся одно название`)
          checkLoc(file, `${at}.${m.metricId}.def`, m.def, { allowPlain: false })
        } else if (m.def) {
          checkLoc(file, `${at}.${m.metricId}.def`, m.def, { allowPlain: false })
        }
      }
    }
    finishCross(kind, crossStage)
  }

  const finishCross = (kind, crossStage) => {
    for (const [id, uses] of Object.entries(crossStage)) {
      if (uses.length < 2) continue
      if (new Set(uses.map((u) => u.label)).size === uses.length) continue
      err(file, `frameworks.${kind}: метрика «${id}» стоит на стадиях ${uses.map((u) => u.row).join(', ')} под одним названием — задайте разные label или уберите лишнюю`)
    }
  }

  checkBlock('aarrr', fw.aarrr, AARRR_STAGES, 'stages', (at, r) =>
    checkLoc(file, `${at}.note`, r.note, { allowPlain: false }))
  checkBlock('heart', fw.heart, HEART_DIMS, 'dims', (at, r) => {
    checkLoc(file, `${at}.goal`, r.goal, { allowPlain: false })
    checkLoc(file, `${at}.signal`, r.signal, { allowPlain: false })
  })
}

const indDir = join(root, 'src/content/industries')
for (const f of readdirSync(indDir).filter((f) => f.endsWith('.json')).sort()) {
  const file = `industries/${f}`
  const ind = JSON.parse(readFileSync(join(indDir, f), 'utf8'))
  checkLoc(file, 'industry', ind.industry)
  checkLoc(file, 'archetype', ind.archetype)
  checkTreeRoot(file, 'base', ind)
  const fwPath = join(indDir, 'frameworks', f)
  checkFrameworks(`industries/frameworks/${f}`,
    existsSync(fwPath) ? JSON.parse(readFileSync(fwPath, 'utf8')) : null)
  for (const c of ind.companies ?? []) {
    checkLoc(file, `${c.id}.name`, c.name)
    checkLoc(file, `${c.id}.note`, c.note)
    checkTreeRoot(file, c.id, c)
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} ошибок:\n`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
} else {
  console.log(`✓ каталог: ${catalogIds.size} метрик; деревья валидны (глубина 0–${REQUIRED_DEPTH}, ru/en парны); разбор по AARRR и HEART заполнен во всех индустриях`)
}
