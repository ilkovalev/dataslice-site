// Расчёты для модуля 8 «Временные ряды и прогноз».
// Все шесть виджетов модуля работают с одним и тем же рядом продаж, поэтому
// генератор и методы прогноза живут здесь, а не копируются по компонентам:
// иначе «тот же ряд» в соседних уроках выглядел бы по-разному.
//
// Случайность детерминированная (свой PRNG с сидом): читатель, вернувшись
// к уроку, должен увидеть ту же картинку, а не новый шум при каждом рендере.

// --- детерминированный шум ---------------------------------------------
// mulberry32: короткий генератор с хорошим распределением; сид фиксирован в
// параметрах ряда, поэтому одинаковые параметры → одинаковый ряд.
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// нормальный шум из равномерного (Бокс — Мюллер)
function gauss(rand) {
  const u = Math.max(1e-9, rand())
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// --- генерация ряда -----------------------------------------------------
// Ряд собирается ровно так, как урок его потом разбирает: уровень + тренд +
// недельная сезонность + шум (+ опциональные всплески промо). Компоненты
// возвращаются отдельно — виджету декомпозиции нужен ИСТИННЫЙ ответ, а не
// оценка, чтобы показать, что разложение попало в цель.
export const SEASON = 7 // недельный цикл: будни против выходных

export function makeSeries({
  n = 84,
  level = 100,
  trend = 0.45,
  seasonAmp = 14,
  noise = 4,
  seed = 7,
  promo = [], // [{ at, size }] — разовые всплески (акции)
  walk = 0, // сила случайного блуждания уровня
} = {}) {
  const rand = rng(seed)
  // Форма недели: пик в выходные, провал в середине недели. Нормирована так,
  // что среднее по циклу равно нулю, — иначе сезонность утянула бы уровень.
  const shape = [-0.6, -0.9, -0.7, -0.2, 0.5, 1.2, 0.7]
  const m = shape.reduce((a, b) => a + b, 0) / shape.length
  const seasonUnit = shape.map((s) => s - m)

  // Случайное блуждание уровня: накопленный шум, который никуда не уходит.
  // Без него будущее ряда предсказуемо с точностью до iid-шума, и ошибка
  // прогноза не растёт с горизонтом — а в жизни растёт именно из-за него.
  let drift = 0

  const t = []
  const trendPart = []
  const seasonPart = []
  const noisePart = []
  const promoPart = []
  const y = []
  for (let i = 0; i < n; i++) {
    if (walk) drift += walk * gauss(rand)
    const tr = level + trend * i + drift
    const se = seasonAmp * seasonUnit[i % SEASON]
    const no = noise * gauss(rand)
    const pr = promo.reduce((a, p) => a + (p.at === i ? p.size : 0), 0)
    t.push(i)
    trendPart.push(tr)
    seasonPart.push(se)
    noisePart.push(no)
    promoPart.push(pr)
    y.push(tr + se + no + pr)
  }
  return { t, y, trend: trendPart, season: seasonPart, noise: noisePart, promo: promoPart }
}

// --- скользящее среднее -------------------------------------------------
// Центрированное окно: для чётного окна края усредняются наполовину, иначе
// сглаженная линия сдвигается вправо и «опаздывает» за рядом.
export function movingAverage(y, w) {
  if (w <= 1) return y.slice()
  const half = Math.floor(w / 2)
  const out = []
  for (let i = 0; i < y.length; i++) {
    let sum = 0
    let cnt = 0
    for (let k = -half; k <= half; k++) {
      const j = i + k
      if (j < 0 || j >= y.length) continue
      const weight = w % 2 === 0 && Math.abs(k) === half ? 0.5 : 1
      sum += y[j] * weight
      cnt += weight
    }
    out.push(sum / cnt)
  }
  return out
}

// Скользящее среднее «только по прошлому» — то, чем реально прогнозируют:
// оценка на шаг вперёд не имеет права заглядывать в будущее.
export function trailingAverage(y, w) {
  const out = []
  for (let i = 0; i < y.length; i++) {
    const from = Math.max(0, i - w + 1)
    const slice = y.slice(from, i + 1)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}

// --- экспоненциальное сглаживание --------------------------------------
// Простое (Брауна): уровень = α·наблюдение + (1−α)·прежний уровень.
export function expSmoothing(y, alpha) {
  const out = []
  let level = y[0]
  for (let i = 0; i < y.length; i++) {
    level = i === 0 ? y[0] : alpha * y[i] + (1 - alpha) * level
    out.push(level)
  }
  return out
}

// Хольт — Уинтерс, аддитивный: уровень + тренд + сезонность. Именно он стоит
// за фразой «хранит компоненты и обновляет их с каждым наблюдением».
export function holtWinters(y, { alpha = 0.4, beta = 0.1, gamma = 0.3, period = SEASON } = {}) {
  const n = y.length
  if (n < 2 * period) return { fitted: y.slice(), forecast: () => y[n - 1] }
  // старт: уровень и тренд по первым двум циклам, сезонность — отклонения от уровня
  const mean = (a) => a.reduce((x, b) => x + b, 0) / a.length
  const m1 = mean(y.slice(0, period))
  const m2 = mean(y.slice(period, 2 * period))
  let level = m1
  let trend = (m2 - m1) / period
  const season = []
  for (let i = 0; i < period; i++) season.push(y[i] - m1)

  const fitted = []
  for (let i = 0; i < n; i++) {
    const s = season[i % period]
    fitted.push(level + trend + s)
    const prevLevel = level
    level = alpha * (y[i] - s) + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
    season[i % period] = gamma * (y[i] - level) + (1 - gamma) * s
  }
  const forecast = (h) => level + h * trend + season[(n + h - 1) % period]
  return { fitted, forecast, level, trend, season }
}

// --- дифференцирование --------------------------------------------------
export const diff = (y, lag = 1) => y.slice(lag).map((v, i) => v - y[i])

// --- автокорреляция -----------------------------------------------------
// ACF по стандартной формуле: ковариация ряда с самим собой, сдвинутым на лаг,
// делённая на дисперсию. Знаменатель — полная сумма квадратов (оценка,
// принятая в statsmodels), поэтому |r| убывает с ростом лага.
export function acf(y, maxLag = 21) {
  const n = y.length
  const mean = y.reduce((a, b) => a + b, 0) / n
  const denom = y.reduce((a, v) => a + (v - mean) ** 2, 0) || 1
  const out = []
  for (let k = 0; k <= maxLag; k++) {
    let num = 0
    for (let i = k; i < n; i++) num += (y[i] - mean) * (y[i - k] - mean)
    out.push(num / denom)
  }
  return out
}

// Порог значимости для коррелограммы: ±1.96/√n — за ним палочку уже нельзя
// списать на случайность.
export const acfBand = (n) => 1.96 / Math.sqrt(n)

// --- AR(1) на прошлом ---------------------------------------------------
// Оценка коэффициента авторегрессии обычным МНК по паре (y[t-1], y[t]).
export function fitAR1(y) {
  const x = y.slice(0, -1)
  const z = y.slice(1)
  const mx = x.reduce((a, b) => a + b, 0) / x.length
  const mz = z.reduce((a, b) => a + b, 0) / z.length
  let sxx = 0
  let sxz = 0
  for (let i = 0; i < x.length; i++) {
    sxx += (x[i] - mx) ** 2
    sxz += (x[i] - mx) * (z[i] - mz)
  }
  const phi = sxx ? sxz / sxx : 0
  return { phi, c: mz - phi * mx }
}

// --- метрики качества прогноза -----------------------------------------
export const mae = (actual, pred) =>
  actual.reduce((a, v, i) => a + Math.abs(v - pred[i]), 0) / actual.length

export const rmse = (actual, pred) =>
  Math.sqrt(actual.reduce((a, v, i) => a + (v - pred[i]) ** 2, 0) / actual.length)

// MAPE в процентах. Нули в знаменателе выбрасываются: на них метрика уходит
// в бесконечность — та самая причина, по которой MAPE не годится для рядов,
// проходящих через ноль.
export function mape(actual, pred) {
  const parts = actual.map((v, i) => (v === 0 ? null : Math.abs((v - pred[i]) / v))).filter((v) => v !== null)
  return parts.length ? (100 * parts.reduce((a, b) => a + b, 0)) / parts.length : NaN
}

// --- ARIMA-конструктор --------------------------------------------------
// Упрощённая, но честная по механике сборка семейства: AR (зависимость от
// прошлых значений), I (дифференцирование), MA (зависимость от прошлой
// ошибки), S (сезонные индексы), X (внешний фактор — промо).
// Полноценный statsmodels в браузер не тащим: цель урока — показать, ЧТО
// добавляет каждая буква, а не воспроизвести оценку максимального
// правдоподобия. Коэффициенты — обычный МНК по лагам.

// Решение маленькой системы методом Гаусса (для p ≤ 3 больше и не нужно).
function solve(A, b) {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    if (Math.abs(M[c][c]) < 1e-12) return Array(n).fill(0)
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

// МНК по p лагам плюс свободный член.
function fitAR(y, p) {
  if (p === 0) {
    const c = y.reduce((a, b) => a + b, 0) / y.length
    return { c, phi: [] }
  }
  const rows = []
  const target = []
  for (let t = p; t < y.length; t++) {
    rows.push([1, ...Array.from({ length: p }, (_, k) => y[t - 1 - k])])
    target.push(y[t])
  }
  const k = p + 1
  const A = Array.from({ length: k }, () => Array(k).fill(0))
  const b = Array(k).fill(0)
  for (let i = 0; i < rows.length; i++) {
    for (let a = 0; a < k; a++) {
      b[a] += rows[i][a] * target[i]
      for (let c = 0; c < k; c++) A[a][c] += rows[i][a] * rows[i][c]
    }
  }
  const sol = solve(A, b)
  return { c: sol[0], phi: sol.slice(1) }
}

// Сезонные индексы: среднее отклонение от центрированного скользящего
// среднего по каждому дню цикла. Нормируем к нулевой сумме, иначе индексы
// утащат уровень.
export function seasonalIndices(y, period = SEASON) {
  const trend = movingAverage(y, period)
  const buckets = Array.from({ length: period }, () => [])
  for (let i = 0; i < y.length; i++) buckets[i % period].push(y[i] - trend[i])
  const idx = buckets.map((b) => (b.length ? b.reduce((a, v) => a + v, 0) / b.length : 0))
  const m = idx.reduce((a, b) => a + b, 0) / period
  return idx.map((v) => v - m)
}

// Прогноз на h шагов вперёд по выбранной конфигурации.
// promoTrain / promoFuture — индикаторы внешнего фактора (1 в день акции).
export function arimaForecast(y, {
  p = 1, d = 0, q = 0, seasonal = false, exog = false, period = SEASON, h = 14,
  promoTrain = [], promoFuture = [],
} = {}) {
  let work = y.slice()

  // S и X оцениваются в два прохода и именно в таком порядке. Наивная оценка
  // «надбавка промо = день акции минус скользящее среднее» вбирает в себя
  // сезонность: если акции регулярно попадают на выходные, эффект акции
  // завышается на весь недельный подъём, а прогноз уезжает вверх во все дни.
  // Поэтому сначала снимаем сезонность, на очищенном ряду оцениваем промо,
  // а затем пересчитываем сезонные индексы уже без всплесков.
  let idx = Array(period).fill(0)
  let beta = 0
  const hasPromo = exog && promoTrain.some(Boolean)

  if (seasonal) idx = seasonalIndices(work, period)

  if (hasPromo) {
    const deseason = seasonal ? work.map((v, i) => v - idx[i % period]) : work
    const base = movingAverage(deseason, period)
    const lifts = []
    for (let i = 0; i < deseason.length; i++) if (promoTrain[i]) lifts.push(deseason[i] - base[i])
    // окно скользящего среднего накрывает и сам всплеск, размазывая его на
    // period точек, — возвращаем эту долю обратно в оценку эффекта
    const raw = lifts.reduce((a, b) => a + b, 0) / lifts.length
    beta = raw / (1 - 1 / period)
    work = work.map((v, i) => v - (promoTrain[i] ? beta : 0))
    if (seasonal) idx = seasonalIndices(work, period)
  }

  if (seasonal) work = work.map((v, i) => v - idx[i % period])

  // I: дифференцируем d раз, запоминая последние уровни для обратной сборки
  const tails = []
  for (let i = 0; i < d; i++) {
    tails.push(work[work.length - 1])
    work = diff(work, 1)
  }

  // AR + MA: коэффициенты по лагам и вклад последней ошибки
  const { c, phi } = fitAR(work, p)
  const resid = []
  for (let t = p; t < work.length; t++) {
    const pred = c + phi.reduce((a, ph, k) => a + ph * work[t - 1 - k], 0)
    resid.push(work[t] - pred)
  }
  let theta = 0
  if (q > 0 && resid.length > 2) {
    const x = resid.slice(0, -1)
    const z = resid.slice(1)
    const sxx = x.reduce((a, v) => a + v * v, 0)
    theta = sxx ? x.reduce((a, v, i) => a + v * z[i], 0) / sxx : 0
  }
  const lastErr = resid.length ? resid[resid.length - 1] : 0

  // рекурсивный прогноз в пространстве разностей
  const hist = work.slice()
  const out = []
  for (let step = 1; step <= h; step++) {
    let v = c + phi.reduce((a, ph, k) => a + ph * hist[hist.length - 1 - k], 0)
    // вклад MA(1) живёт ровно один шаг вперёд — дальше прошлая ошибка забыта
    if (q > 0 && step === 1) v += theta * lastErr
    hist.push(v)
    out.push(v)
  }

  // обратная сборка: интегрируем, возвращаем сезонность и промо
  let fc = out
  for (let i = d - 1; i >= 0; i--) {
    let acc = tails[i]
    fc = fc.map((v) => (acc += v))
  }
  if (seasonal) fc = fc.map((v, i) => v + idx[(y.length + i) % period])
  if (exog) fc = fc.map((v, i) => v + (promoFuture[i] ? beta : 0))
  return { forecast: fc, phi, theta, beta, seasonalIdx: idx }
}
