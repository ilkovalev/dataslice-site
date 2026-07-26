// Линтер текстов курса. Держит единую терминологию на всех поверхностях:
// глоссарий, словарь тултипов, определения внутри уроков, проза уроков.
//
// Зачем: разовая вычитка протухает. Глоссарий и уроки уже разъезжались —
// «асимметрия» против «скошенности», «ложноположительный результат» против
// «ложного срабатывания». Читателю это выглядит как два разных термина.
//
// Канон: src/content/TERMS.md. Запуск: node scripts/check-terms.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.relative(root, p)

// --- правила ------------------------------------------------------------
// ВАЖНО: в JS `\w` — это [A-Za-z0-9_], кириллицу он НЕ покрывает. Правило вида
// /ложн\w*\s+срабатыван\w*/ молча не срабатывает: `\w*` съедает ноль символов,
// а `\s+` упирается в русскую букву. Поэтому окончания пишем явно через `[а-яё]*`.
// (Так и было пропущено «ложное срабатывание» в hypothesis-test.)
const W = '[а-яё]*' // русское окончание
const RULES = [
  // Основа «скош», а не «скошенн»: краткие формы («данные скошены») пишутся
  // с одной «н» и проходили мимо. «скос» — с любым окончанием, «скоса» тоже.
  { re: /(?<![а-яё])(скош[а-яё]+|скос[а-яё]*|перекош[а-яё]+)(?![а-яё])/gi, msg: 'скошенность → асимметрия' },
  { re: new RegExp(`ложн${W}\\s+тревог${W}`, 'gi'), msg: 'ложная тревога → ложноположительный результат' },
  { re: new RegExp(`ложн${W}\\s+срабатыван${W}`, 'gi'), msg: 'ложное срабатывание → ложноположительный результат' },
  { re: /ошибк[а-яё]*\s+(?:I|II)\s+рода/g, msg: 'ошибка I рода → ошибка первого рода (словом)' },
  { re: /маржа\s+вклада/gi, msg: 'маржа вклада → маржинальная прибыль' },
  // «Признак (фича)» разрешён: один раз в скобках при первом введении термина
  { re: /(?<![а-яё])фич[а-яё]*/gi, msg: 'фича → признак', allowIn: /Признак\s*\(фича\)/ },
  // обращение: курс ведётся на «вы» со строчной
  { re: /(?<![а-яё])(?:ты|тебе|тебя|твой|твоя|твои|твоего)(?![а-яё])/gi, msg: 'обращение на «ты» → «вы»' },
  {
    re: /(?<![а-яё])[а-яё]+(?:ешь|ёшь|ишь)(?![а-яё])/gi,
    msg: 'глагол 2 л. ед. ч. («ты») → форма на «вы»',
    skip: /^(лишь|ещё|вишь|мышь|рожь|ложь|тишь|глушь|фальшь)$/i,
  },
  { re: /(?<![.!?»…]\s)(?<!^)(?<![а-яё])(Вы|Вам|Вас|Вами|Ваш[а-яё]*)(?![а-яё])/g, msg: '«Вы» с прописной → строчная' },
  // регистр
  { re: /(?<![а-яё])(?:кучн[а-яё]+|гуля[а-яё]+|невезучи[а-яё]*|затевается|буксует)(?![а-яё])/gi, msg: 'разговорное в учебном тексте' },
  { re: /(?<![а-яё])в\s+проде(?![а-яё])/gi, msg: 'разговорное: «в проде» → «на реальных данных»' },
]

// --- сбор текстов -------------------------------------------------------
function* walk(o, p = '') {
  if (typeof o === 'string') yield [p, o]
  else if (Array.isArray(o)) for (const [i, v] of o.entries()) yield* walk(v, `${p}[${i}]`)
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) yield* walk(v, p ? `${p}.${k}` : k)
}

const SKIP_KEYS = /(^|\.)(id|module|tier|widget|lesson|metric|slug|name)(\[|\.|$)/

function collectJson(dir) {
  const out = []
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const full = path.join(dir, f)
    for (const [p, s] of walk(JSON.parse(fs.readFileSync(full, 'utf8')))) {
      if (SKIP_KEYS.test(p)) continue
      out.push({ file: rel(full), path: p, text: s })
    }
  }
  return out
}

function collectJs(file, reField) {
  const src = fs.readFileSync(file, 'utf8')
  const out = []
  for (const m of src.matchAll(reField)) {
    out.push({ file: rel(file), path: `строка ${src.slice(0, m.index).split('\n').length}`, text: m[1] })
  }
  return out
}

// --- дубли id -----------------------------------------------------------
function checkDuplicateIds(dir) {
  const seen = {}
  const dups = []
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const { id } = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
    if (seen[id]) dups.push(`${rel(dir)}: id «${id}» в двух файлах — ${seen[id]} и ${f}`)
    seen[id] = f
  }
  return dups
}

// --- прогон -------------------------------------------------------------
// Пятая поверхность: подписи внутри виджетов. Их легко забыть — они не в
// контенте, а в коде, — и там дольше всего жили «скошенная совокупность»
// и «ложное срабатывание» уже после того, как уроки были вычищены.
function collectWidgets(dir) {
  const out = []
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.jsx'))) {
    const full = path.join(dir, f)
    const src = fs.readFileSync(full, 'utf8')
    // строковые литералы и текст между тегами — всё, что видит пользователь
    for (const m of src.matchAll(/'([^'\\\n]{6,})'|>([^<>{}\n]{6,})</g)) {
      const text = m[1] ?? m[2]
      if (!/[а-яё]/i.test(text)) continue
      out.push({ file: rel(full), path: `строка ${src.slice(0, m.index).split('\n').length}`, text })
    }
  }
  return out
}

const fields = [
  ...collectJson(path.join(root, 'src/content/lessons')),
  ...collectJs(path.join(root, 'src/content/tooltipTerms.js'), /def:\s*'((?:[^'\\]|\\.)*)'/g),
  ...collectJs(path.join(root, 'src/content/glossary.js'), /def:\s*'((?:[^'\\]|\\.)*)'/g),
  ...collectWidgets(path.join(root, 'src/components')),
]

const problems = []
for (const f of fields) {
  for (const rule of RULES) {
    rule.re.lastIndex = 0
    for (const m of f.text.matchAll(rule.re)) {
      if (rule.skip?.test(m[0])) continue
      if (rule.allowIn?.test(f.text)) continue
      const ctx = f.text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' ')
      problems.push(`${f.file} · ${f.path}\n    «${m[0]}» — ${rule.msg}\n    …${ctx}…`)
    }
  }
}
problems.push(...checkDuplicateIds(path.join(root, 'src/content/lessons')))
problems.push(...checkDuplicateIds(path.join(root, 'src/content/lessons-en')))

if (problems.length) {
  console.error(`\n✗ проверка терминов: ${problems.length} замечаний (канон — src/content/TERMS.md)\n`)
  for (const p of problems) console.error('  ' + p + '\n')
  process.exit(1)
}
console.log(`✓ проверка терминов: чисто (${fields.length} текстовых полей)`)
