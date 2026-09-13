// Проверка разметки перед сборкой. Ловит две ошибки, которые не ломают сборку
// и потому доезжают до продакшена молча.
//
// 1. Классы Tailwind с прозрачностью вне шкалы: `bg-accent/12` выглядит
//    правдоподобно, но такого значения в шкале нет, класс не генерируется,
//    и элемент остаётся вообще без фона. Именно так на сайте пропала заливка
//    уровней пирамиды метрик.
// 2. Блочные элементы внутри <button>: <div> и <h3> там невалидны, Chrome
//    прощает, а часть браузеров не доводит клик по такому потомку до
//    обработчика — кнопка просто не срабатывает.
//
// Скрипт читает шкалу и палитру из tailwind.config.js, поэтому новые цвета
// и значения прозрачности подхватываются сами.
import fs from 'fs'
import path from 'path'
import resolveConfig from 'tailwindcss/resolveConfig.js'
import tailwindConfig from '../tailwind.config.js'

const theme = resolveConfig(tailwindConfig).theme
const OPACITIES = new Set(Object.keys(theme.opacity))
const COLORS = new Set(Object.keys(theme.colors))

const SRC = 'src'
const files = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.jsx?$/.test(e.name)) files.push(p)
  }
})(SRC)

// Утилиты, которые принимают цвет и модификатор прозрачности.
const COLOR_UTIL = /^(?:bg|text|border|ring|ring-offset|divide|outline|fill|stroke|from|via|to|placeholder|caret|accent|shadow|decoration)-/
const problems = []
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length

// Классы ищем во всём тексте файла, а не только в className: Tailwind сам
// сканирует исходники целиком, и список вида
//   const shades = ['bg-accent/25', 'bg-accent/12']
// для него такой же источник классов. Первая версия проверки смотрела только
// в className и ровно этот случай пропустила.
const UTIL = 'bg|text|border|ring|ring-offset|divide|outline|fill|stroke|from|via|to|placeholder|caret|accent|decoration'
const WITH_OPACITY = new RegExp(`(?<![\\w-])(?:${UTIL})-([a-z]+)(?:-\\d{2,3})?\\/(\\d+)(?![\\d\\]])`, 'g')
const PLAIN_COLOR = new RegExp(`(?<![\\w-])(?:${UTIL})-([a-z]{3,})(?![\\w\\[/-])`, 'g')

// Утилиты, которые начинаются так же, но цветом не являются.
const NOT_COLOR = new Set([
  'center', 'left', 'right', 'justify', 'start', 'end', 'dashed', 'dotted', 'solid', 'double',
  'none', 'hidden', 'collapse', 'separate', 'clip', 'ellipsis', 'wrap', 'nowrap', 'balance',
  'pretty', 'auto', 'inherit', 'current', 'transparent', 'black', 'white', 'top', 'bottom',
  'both', 'all', 'base', 'full', 'screen', 'fixed', 'local', 'scroll', 'repeat', 'contain',
  'cover', 'origin', 'clone', 'slice', 'blend', 'gradient', 'opacity', 'spacing', 'width',
  'color', 'style', 'thickness', 'offset', 'inset', 'reverse',
])

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')

  for (const m of src.matchAll(WITH_OPACITY)) {
    const [full, color, mod] = m
    if (!OPACITIES.has(mod)) {
      const near = [...OPACITIES].filter((o) => Math.abs(o - mod) <= 5).join(', /')
      problems.push(`${file}:${lineOf(src, m.index)} — «${full}»: прозрачности /${mod} нет в шкале, класс не соберётся и элемент останется без цвета. Возьмите /${near || '10'} или арбитрарное /[0.${String(mod).padStart(2, '0')}]`)
    }
    if (!COLORS.has(color) && !NOT_COLOR.has(color)) {
      problems.push(`${file}:${lineOf(src, m.index)} — «${full}»: цвета «${color}» нет в палитре tailwind.config.js`)
    }
  }

  for (const m of src.matchAll(PLAIN_COLOR)) {
    const [full, color] = m
    if (!COLORS.has(color) && !NOT_COLOR.has(color)) {
      problems.push(`${file}:${lineOf(src, m.index)} — «${full}»: цвета «${color}» нет в палитре tailwind.config.js`)
    }
  }

  // Блочные элементы внутри <button>. Комментарии JSX выкидываем, иначе
  // разбор спотыкается о текст вроде «<h3> внутри <button>».
  const code = src.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  for (const m of code.matchAll(/<button[\s\S]*?<\/button>/g)) {
    const tags = [...new Set([...m[0].matchAll(/<(h[1-6]|p|div|ul|ol|li|section|article|table|form)\b/g)].map((x) => x[1]))]
    if (tags.length) {
      problems.push(`${file}:${lineOf(code, m.index)} — <button> содержит <${tags.join('>, <')}>: невалидная вложенность, в части браузеров клик не доходит до обработчика. Замените на <span className="block …">`)
    }
  }
}

if (problems.length) {
  console.error(`✗ проверка разметки: ${problems.length} ${problems.length === 1 ? 'проблема' : 'проблем'}\n`)
  problems.forEach((p) => console.error('  ' + p))
  console.error('')
  process.exit(1)
}
console.log(`✓ проверка разметки: чисто (${files.length} файлов)`)
