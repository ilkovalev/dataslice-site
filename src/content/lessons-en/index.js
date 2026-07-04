// Английские версии уроков. Ключ — тот же id, что в русском реестре.
// Переводим батчами: урок появляется здесь — /en/stats/<id> становится английским,
// остальные показывают русский оригинал с пометкой.
import centerMeasures from './center-measures.json'
import spread from './spread.json'
import histogram from './histogram.json'
import percentiles from './percentiles.json'
import outliers from './outliers.json'

export const lessonsEnById = Object.fromEntries(
  [centerMeasures, spread, histogram, percentiles, outliers].map((l) => [l.id, l]),
)
