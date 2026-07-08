#!/usr/bin/env node
// Единый захват для дизайн-ревью: скриншоты во всех вьюпортах + инструментальные
// метрики (шрифты, контраст, отступы, тап-зоны, alt, overflow). Заменяет россыпь _shot_*.mjs.
//
// Запуск:  node .claude/skills/design-review/scripts/capture.mjs <slug> [--base http://localhost:4203]
// Пример:  node .claude/skills/design-review/scripts/capture.mjs center-measures
// Выход:   .claude/skills/design-review/reports/shots/<slug>/<vp>.png  +  metrics.json
//
// Требует запущенный dev/preview-сервер и установленный playwright (уже в devDependencies).

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const slug = args.find(a => !a.startsWith('--'))
const base = (args[args.indexOf('--base') + 1] && args.includes('--base')) ? args[args.indexOf('--base') + 1] : 'http://localhost:4203'
if (!slug) { console.error('Укажи slug урока, напр.: center-measures'); process.exit(1) }

const VIEWPORTS = [{ name: 'mobile', width: 390, height: 850 }, { name: 'tablet', width: 768, height: 1024 }, { name: 'desktop', width: 1440, height: 1000 }]
const outDir = resolve(__dir, '../reports/shots', slug)
mkdirSync(outDir, { recursive: true })

// Скрипт извлечения метрик — исполняется в контексте страницы.
const collectMetrics = `(() => {
  const px = s => parseFloat(s) || 0
  const parseColor = c => { const m = c.match(/[\\d.]+/g); return m ? m.slice(0,3).map(Number) : null }
  const lum = ([r,g,b]) => { const f = v => { v/=255; return v<=0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4 }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b) }
  const ratio = (a,b) => { if(!a||!b) return null; const L1=lum(a),L2=lum(b); return +(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05))).toFixed(2) }
  const effБg = el => { let n = el; while (n) { const bg = getComputedStyle(n).backgroundColor; const c = parseColor(bg); if (c && !/rgba\\(.*,\\s*0\\)/.test(bg)) return c; n = n.parentElement } return [255,248,239] }

  const texts = [...document.querySelectorAll('h1,h2,h3,h4,p,li,span,button,a,label,text')]
    .filter(el => el.innerText && el.innerText.trim().length > 1 && el.offsetParent !== null)
  const fontHist = {}
  const lowContrast = []
  for (const el of texts.slice(0, 400)) {
    const cs = getComputedStyle(el)
    const size = Math.round(px(cs.fontSize))
    const key = size + '/' + cs.fontWeight
    fontHist[key] = (fontHist[key] || 0) + 1
    const fg = parseColor(cs.color)
    const r = ratio(fg, effБg(el))
    const big = size >= 24 || (size >= 19 && +cs.fontWeight >= 700)
    if (r !== null && r < (big ? 3 : 4.5)) lowContrast.push({ text: el.innerText.trim().slice(0, 40), size, weight: cs.fontWeight, ratio: r, need: big ? 3 : 4.5 })
  }

  const interactive = [...document.querySelectorAll('button,a,input,[role=button],svg circle,svg rect[data-interactive]')].filter(el => el.offsetParent !== null)
  const smallTargets = interactive.map(el => { const b = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), w: Math.round(b.width), h: Math.round(b.height), label: (el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,30) } }).filter(t => (t.w && t.h) && (t.w < 44 || t.h < 44))

  const imgsNoAlt = [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).map(i => i.currentSrc || i.src)
  // svg считается покрытым, если помечен сам или лежит в именованной группе/figure (role=group+aria-label и т.п.)
  const svgNoLabel = [...document.querySelectorAll('svg')].filter(s => !s.getAttribute('aria-label') && !s.querySelector('title') && !s.closest('[aria-label],[role=img],[role=figure]') && s.getBoundingClientRect().width > 80).length

  const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2

  return {
    fontSizes: Object.fromEntries(Object.entries(fontHist).sort((a,b)=>b[1]-a[1])),
    uniqueFontSizes: new Set(Object.keys(fontHist).map(k=>k.split('/')[0])).size,
    lowContrast, smallTargets, imgsNoAlt, svgNoLabel, overflowX,
  }
})()`

const browser = await chromium.launch()
const report = { slug, base, capturedAt: new Date().toISOString(), viewports: {} }

for (const locale of ['', '/en']) {
  const url = `${base}${locale}/stats/${slug}`
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    const errs = []
    page.on('pageerror', e => errs.push(e.message))
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(400)
      const tag = `${vp.name}${locale ? '_en' : ''}`
      await page.screenshot({ path: resolve(outDir, `${tag}.png`), fullPage: true })
      const metrics = await page.evaluate(collectMetrics)
      report.viewports[tag] = { url, ...metrics, consoleErrors: errs.slice(0, 6) }
    } catch (e) {
      report.viewports[`${vp.name}${locale ? '_en' : ''}`] = { url, error: e.message }
    }
    await page.close()
  }
}

writeFileSync(resolve(outDir, 'metrics.json'), JSON.stringify(report, null, 2))
await browser.close()
console.log(`✓ ${slug}: скриншоты и metrics.json → reports/shots/${slug}/`)
console.log(`  вьюпорты: ${Object.keys(report.viewports).join(', ')}`)
process.exit(0)
