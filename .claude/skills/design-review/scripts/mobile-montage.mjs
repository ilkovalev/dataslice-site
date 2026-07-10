#!/usr/bin/env node
// Полный проход по виджетам на мобильном: снимает область виджета каждого урока
// на 390px (натуральный размер — подписи читаемы) и клеит в монтажные сетки
// по N штук, чтобы просмотреть ВСЕ виджеты без 56 отдельных чтений.
//
// Запуск: node .claude/skills/design-review/scripts/mobile-montage.mjs [--base URL] [--cols 4] [--per 16]
// Выход: reports/montage/mobile_widgets_<k>.png

import { chromium } from 'playwright'
import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const arg = (n, d) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : d)
const base = arg('--base', 'http://localhost:4203')
const cols = +arg('--cols', 4)
const per = +arg('--per', 16)

const lessonsDir = resolve(__dir, '../../../../src/content/lessons')
const slugs = readdirSync(lessonsDir).filter(f => f.endsWith('.json') && f !== 'index.js').map(f => f.replace('.json', '')).sort()
const outDir = resolve(__dir, '../reports/montage')
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()

// 1) снять область виджета каждого урока на мобильном → base64
const shots = []
for (const slug of slugs) {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } })
  try {
    await page.goto(`${base}/stats/${slug}`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(400)
    // виджет-обёртка = [role=group][aria-label] (добавлена в BeatsLesson); fallback — крупный SVG-контейнер
    let target = page.locator('[role=group][aria-label]').first()
    if (!(await target.count())) {
      const svg = page.locator('main svg').first()
      target = (await svg.count()) ? svg.locator('xpath=ancestor::div[1]') : null
    }
    let buf
    if (target && (await target.count())) buf = await target.screenshot()
    else buf = await page.screenshot({ clip: { x: 0, y: 200, width: 390, height: 500 } })
    shots.push({ slug, b64: buf.toString('base64') })
  } catch (e) {
    shots.push({ slug, b64: null, err: e.message.slice(0, 40) })
  }
  await page.close()
}

// 2) собрать монтажи по `per` штук
const chunks = []
for (let i = 0; i < shots.length; i += per) chunks.push(shots.slice(i, i + per))

const mk = (items) => `<!doctype html><meta charset=utf8><style>
  body{margin:0;background:#eee;font:12px system-ui}
  .grid{display:grid;grid-template-columns:repeat(${cols},390px);gap:10px;padding:10px}
  .cell{background:#fff;border:1px solid #ccc}
  .cap{padding:3px 6px;font-weight:600;background:#222;color:#fff}
  .err{padding:20px;color:#b00}
  img{display:block;width:390px}
</style><div class=grid>${items.map(s => `<div class=cell><div class=cap>${s.slug}</div>${s.b64 ? `<img src="data:image/png;base64,${s.b64}">` : `<div class=err>${s.err || 'нет'}</div>`}</div>`).join('')}</div>`

let k = 0
for (const chunk of chunks) {
  const page = await browser.newPage({ viewport: { width: cols * 400 + 30, height: 1000 } })
  await page.setContent(mk(chunk), { waitUntil: 'load' })
  await page.waitForTimeout(200)
  await page.screenshot({ path: resolve(outDir, `mobile_widgets_${k}.png`), fullPage: true })
  await page.close()
  k++
}
await browser.close()
console.log(`✓ ${shots.length} виджетов → ${k} монтажей в reports/montage/`)
console.log(`  ошибок: ${shots.filter(s => !s.b64).length}`)
process.exit(0)
