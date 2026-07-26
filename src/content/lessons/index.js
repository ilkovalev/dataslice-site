// Реестр уроков стр. 1.
//
// Раньше здесь было 57 статических импортов JSON, и весь курс в двух локалях
// лежал в чанке страницы: ~1 MB отдавалось ради одного открытого урока.
// Теперь модуль отдаёт только ЛЁГКИЙ ИНДЕКС (id, модуль, заголовки) — этого
// хватает навигации, оглавлению и прогрессу, — а полный текст урока грузится
// отдельным чанком по требованию через loadLesson().
//
// Индекс собирается при сборке из самих JSON (см. vite.config.js): порядок
// берётся из массива в прежнем реестре, поэтому последовательность курса
// не зависит от имён файлов и не разъезжается с содержимым.
export const lessons = __LESSON_INDEX__

export const lessonsByModule = lessons.reduce((acc, l) => {
  ;(acc[l.module] ||= []).push(l)
  return acc
}, {})

export const lessonsById = Object.fromEntries(lessons.map((l) => [l.id, l]))

// Ленивые загрузчики. Ключ глоба — путь к файлу, а имя файла не всегда равно
// id урока (например, t-test.json несёт id stat-criteria), поэтому путь берём
// из индекса, а не собираем из id.
const ruFiles = import.meta.glob('./*.json')
const enFiles = import.meta.glob('../lessons-en/*.json')

const cache = new Map()

// Возвращает полный урок: русский текст, поверх него — английский, если он
// есть. Флаг _untranslated поднимает баннер «перевода пока нет».
export async function loadLesson(id, locale = 'ru') {
  const key = `${id}:${locale}`
  if (cache.has(key)) return cache.get(key)

  const meta = lessonsById[id]
  if (!meta) return null

  const loadRu = ruFiles[`./${meta.file}`]
  if (!loadRu) return null
  const ru = (await loadRu()).default

  if (locale !== 'en') {
    cache.set(key, ru)
    return ru
  }

  const loadEn = meta.fileEn ? enFiles[`../lessons-en/${meta.fileEn}`] : null
  const en = loadEn ? (await loadEn()).default : null
  const merged = en ? { ...ru, ...en } : { ...ru, _untranslated: true }
  cache.set(key, merged)
  return merged
}
