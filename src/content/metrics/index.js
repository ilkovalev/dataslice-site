// Справочник метрик — единый каталог определений: формула, SQL, описание,
// подводные камни. Узлы деревьев индустрий ссылаются сюда по metricId.
// ВАЖНО: этот модуль импортируется ТОЛЬКО динамически (import('...')) —
// он уходит в отдельный чанк и не тянет ~сотню записей в чанк страницы.
import acquisition from './acquisition.json'
import engagement from './engagement.json'
import retention from './retention.json'
import monetization from './monetization.json'
import marketplace from './marketplace.json'
import quality from './quality.json'
import finance from './finance.json'
import platform from './platform.json'

export const METRIC_CATEGORIES = {
  acquisition: { ru: 'Привлечение', en: 'Acquisition' },
  engagement: { ru: 'Вовлечённость', en: 'Engagement' },
  retention: { ru: 'Удержание', en: 'Retention' },
  monetization: { ru: 'Монетизация', en: 'Monetization' },
  marketplace: { ru: 'Платформы и маркетплейсы', en: 'Platforms & marketplaces' },
  quality: { ru: 'Качество и guardrails', en: 'Quality & guardrails' },
  finance: { ru: 'Юнит-экономика и финансы', en: 'Unit economics & finance' },
  platform: { ru: 'Платформенные (технические)', en: 'Platform (technical)' },
}

export const metrics = [
  ...acquisition,
  ...engagement,
  ...retention,
  ...monetization,
  ...marketplace,
  ...quality,
  ...finance,
  ...platform,
]

export const metricsById = Object.fromEntries(metrics.map((m) => [m.id, m]))
