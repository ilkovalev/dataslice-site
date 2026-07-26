// Реестр индустрий — стр. 2. Каждое дерево — отдельный JSON.
// Порядок задаёт группировку по архетипу на странице.
import { loc } from '../../lib/i18n.js'
import social from './social.json'
import messengers from './messengers.json'
import search from './search.json'
import streaming from './streaming.json'
import saas from './saas.json'
import marketplace from './marketplace.json'
import ondemand from './ondemand.json'
import foodtech from './foodtech.json'
import ota from './ota.json'
import classifieds from './classifieds.json'
import restaurants from './restaurants.json'
import ecommerce from './ecommerce.json'
import fintech from './fintech.json'
import gaming from './gaming.json'
import edtech from './edtech.json'
import ai from './ai.json'

export const industries = [
  social, search,
  messengers,
  streaming, saas,
  marketplace, ondemand, foodtech, ota,
  classifieds,
  restaurants,
  ecommerce,
  fintech,
  gaming,
  edtech,
  ai,
]
export const industriesById = Object.fromEntries(industries.map((i) => [i.id, i]))

// Текстовые поля деревьев могут быть строкой (одинаковой в обеих локалях)
// или объектом { ru, en }. Резолвер разворачивает дерево в плоские строки
// нужной локали — компоненты рендера про i18n не знают.
function resolveNode(n, locale) {
  if (!n) return n
  return {
    ...n,
    title: loc(n.title, locale),
    note: loc(n.note, locale),
    formula: loc(n.formula, locale),
    children: n.children?.map((c) => resolveNode(c, locale)),
  }
}

function resolvePyramid(p, locale) {
  if (!p) return p
  return {
    note: loc(p.note, locale),
    bands: p.bands?.map((b) => ({
      label: loc(b.label, locale),
      role: loc(b.role, locale),
      items: b.items?.map((it) => loc(it, locale)),
    })),
  }
}

const resolveCounters = (cm, locale) =>
  cm?.map((c) => ({ title: loc(c.title, locale), note: loc(c.note, locale) }))

export function resolveIndustry(ind, locale) {
  return {
    ...ind,
    industry: loc(ind.industry, locale),
    archetype: loc(ind.archetype, locale),
    // Канонический (русский) ключ архетипа: по нему конструктор в «Основах»
    // сопоставляет индустрии с архетипом независимо от локали.
    archetypeKey: loc(ind.archetype, 'ru'),
    northStar: loc(ind.northStar, locale),
    root: resolveNode(ind.root, locale),
    pyramid: resolvePyramid(ind.pyramid, locale),
    counterMetrics: resolveCounters(ind.counterMetrics, locale),
    companies: ind.companies?.map((c) => ({
      ...c,
      name: loc(c.name, locale),
      note: loc(c.note, locale),
      northStar: loc(c.northStar, locale),
      root: resolveNode(c.root, locale),
      pyramid: resolvePyramid(c.pyramid, locale),
      counterMetrics: resolveCounters(c.counterMetrics, locale),
    })),
  }
}
