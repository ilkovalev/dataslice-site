#!/usr/bin/env node
// Быстрый поведенческий скан всех уроков: ошибки консоли (сломанные виджеты),
// overflow по X, безымянные графики. Без fullPage-скринов — только сигналы.
// Запуск: node .claude/skills/design-review/scripts/scan-all.mjs [--base http://localhost:4203]
// Выход: reports/scan-behavior.json + сводка в stdout.

import { chromium } from 'playwright'
import { readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const base = process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : 'http://localhost:4203'
const lessonsDir = resolve(__dir, '../../../../src/content/lessons')
const slugs = readdirSync(lessonsDir).filter(f => f.endsWith('.json') && f !== 'index.js').map(f => f.replace('.json', ''))

const browser = await chromium.launch()
const results = []
for (const slug of slugs) {
  const page = await browser.newPage({ viewport: { width: 390, height: 850 } })
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) })
  const row = { slug, errors: [], overflowX: null, svgNoLabel: null, notFound: false }
  try {
    await page.goto(`${base}/stats/${slug}`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(500)
    const m = await page.evaluate(() => ({
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
      svgNoLabel: [...document.querySelectorAll('svg')].filter(s => !s.getAttribute('aria-label') && !s.querySelector('title') && !s.closest('[aria-label],[role=img],[role=figure],.katex') && s.getBoundingClientRect().width > 80).length,
      notReady: /виджет «.*» ещё не готов/.test(document.body.innerText),
    }))
    row.overflowX = m.overflowX; row.svgNoLabel = m.svgNoLabel; row.notReady = m.notReady
  } catch (e) { row.notFound = e.message.slice(0, 80) }
  row.errors = errs.slice(0, 4)
  results.push(row)
  await page.close()
}
await browser.close()
writeFileSync(resolve(__dir, '../reports/scan-behavior.json'), JSON.stringify(results, null, 2))

const flagged = results.filter(r => r.errors.length || r.overflowX || r.svgNoLabel || r.notReady || r.notFound)
console.log(`Просканировано: ${results.length} | с сигналами: ${flagged.length}`)
for (const r of flagged) {
  const sig = [r.errors.length && `errors:${r.errors.length}`, r.overflowX && 'overflowX', r.svgNoLabel && `svgNoLabel:${r.svgNoLabel}`, r.notReady && 'widget_not_ready', r.notFound && 'LOAD_FAIL'].filter(Boolean).join(' ')
  console.log(`${r.slug.padEnd(26)} ${sig}`)
  if (r.errors.length) r.errors.forEach(e => console.log(`    ! ${e}`))
}
process.exit(0)
