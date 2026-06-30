// Реестр распределений — модуль 2 (Distribution Explorer).
// Каждое распределение data-driven: kind (continuous|discrete), params (крутилки),
// view (ФИКСИРОВАННЫЕ оси, чтобы изменение параметров было видно), функция плотности
// (pdf для непрерывных / pmf для дискретных) и mean. Добавить распределение = объект.

// --- спецфункции ---
function gammaln(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]
  let y = x
  let tmp = x + 5.5
  tmp -= (x + 0.5) * Math.log(tmp)
  let ser = 1.000000000190015
  for (let j = 0; j < 6; j++) { y++; ser += g[j] / y }
  return -tmp + Math.log((2.5066282746310005 * ser) / x)
}
const gamma = (x) => Math.exp(gammaln(x))
const logFactorial = (n) => gammaln(n + 1)
const binomCoef = (n, k) => Math.exp(gammaln(n + 1) - gammaln(k + 1) - gammaln(n - k + 1))

// --- плотности / вероятности ---
export function normalPdf(x, mu, sigma) {
  const z = (x - mu) / sigma
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI))
}
const exponentialPdf = (x, lambda) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x))
const lognormalPdf = (x, mu, sigma) =>
  x <= 0 ? 0 : Math.exp(-((Math.log(x) - mu) ** 2) / (2 * sigma * sigma)) / (x * sigma * Math.sqrt(2 * Math.PI))
const paretoPdf = (x, alpha, xm = 1) => (x < xm ? 0 : (alpha * xm ** alpha) / x ** (alpha + 1))
const studentTPdf = (x, nu) =>
  (gamma((nu + 1) / 2) / (Math.sqrt(nu * Math.PI) * gamma(nu / 2))) * (1 + (x * x) / nu) ** (-(nu + 1) / 2)
const chiSquarePdf = (x, k) =>
  x <= 0 ? 0 : (x ** (k / 2 - 1) * Math.exp(-x / 2)) / (2 ** (k / 2) * gamma(k / 2))

const bernoulliPmf = (k, p) => (k === 1 ? p : k === 0 ? 1 - p : 0)
const binomialPmf = (k, n, p) => (k < 0 || k > n ? 0 : binomCoef(n, k) * p ** k * (1 - p) ** (n - k))
const poissonPmf = (k, lambda) => (k < 0 ? 0 : Math.exp(k * Math.log(lambda) - lambda - logFactorial(k)))

export const distributions = {
  normal: {
    id: 'normal', title: 'Нормальное', kind: 'continuous',
    params: [
      { key: 'mu', label: 'μ (среднее)', min: -4, max: 4, step: 0.1, default: 0 },
      { key: 'sigma', label: 'σ (стд. отклонение)', min: 0.5, max: 3, step: 0.1, default: 1 },
    ],
    view: { xMin: -8, xMax: 8, yMax: 0.85 },
    fn: (x, p) => normalPdf(x, p.mu, p.sigma),
    mean: (p) => p.mu,
    note: 'Симметричный «колокол»: большинство значений толпится у центра, к краям всё реже. μ задаёт, где стоит центр, σ — насколько широко значения расходятся (σ растягивает колокол шире и ниже, μ двигает его по оси). Появляется там, где величина складывается из множества мелких независимых случайностей — рост людей, погрешности измерений, отклонения деталей.',
  },
  z: {
    id: 'z', title: 'Стандартное нормальное (z)', kind: 'continuous',
    params: [],
    view: { xMin: -4, xMax: 4, yMax: 0.45 },
    fn: (x) => normalPdf(x, 0, 1),
    mean: () => 0,
    note: 'Нормальное с μ = 0 и σ = 1 — эталон, к которому приводят z-оценкой (x−μ)/σ. На нём считают z-тест: ось — это «сколько сигм» от центра.',
  },
  uniform: {
    id: 'uniform', title: 'Равномерное', kind: 'continuous',
    params: [
      { key: 'a', label: 'a (минимум)', min: -4, max: 0, step: 0.5, default: -2 },
      { key: 'b', label: 'b (максимум)', min: 1, max: 6, step: 0.5, default: 2 },
    ],
    view: { xMin: -6, xMax: 8, yMax: 0.6 },
    fn: (x, p) => (x >= p.a && x <= p.b && p.b > p.a ? 1 / (p.b - p.a) : 0),
    mean: (p) => (p.a + p.b) / 2,
    note: 'Все значения в диапазоне [a, b] равновероятны — плотность это ровная «полка», у неё нет выделенного центра. Параметры a и b задают границы. Модель полного незнания: случайный момент прихода в течение часа, генератор случайных чисел, «где-то между a и b, и всё».',
  },
  exponential: {
    id: 'exponential', title: 'Экспоненциальное', kind: 'continuous',
    params: [{ key: 'lambda', label: 'λ (интенсивность)', min: 0.2, max: 3, step: 0.1, default: 1 }],
    view: { xMin: 0, xMax: 8, yMax: 3 },
    fn: (x, p) => exponentialPdf(x, p.lambda),
    mean: (p) => 1 / p.lambda,
    note: 'Время ожидания между редкими независимыми событиями: до следующего звонка, отказа, клиента. Единственный параметр λ — интенсивность: чем он больше, тем чаще события и тем короче типичное ожидание (выше старт, круче спад). Обладает свойством «без памяти» и является парой к распределению Пуассона.',
  },
  lognormal: {
    id: 'lognormal', title: 'Лог-нормальное', kind: 'continuous',
    params: [
      { key: 'mu', label: 'μ (лог-среднее)', min: -0.5, max: 1, step: 0.1, default: 0 },
      { key: 'sigma', label: 'σ (лог-σ)', min: 0.2, max: 1, step: 0.05, default: 0.5 },
    ],
    view: { xMin: 0, xMax: 8, yMax: 1.2 },
    fn: (x, p) => lognormalPdf(x, p.mu, p.sigma),
    mean: (p) => Math.exp(p.mu + (p.sigma * p.sigma) / 2),
    note: 'Если логарифм величины распределён нормально — сама величина лог-нормальна. Характерен длинный правый хвост из редких больших значений: выручка, длительности сессий, размеры файлов. Из-за хвоста среднее уезжает вправо от моды и его тянут вверх единичные «гиганты», поэтому надёжнее медиана.',
  },
  pareto: {
    id: 'pareto', title: 'Парето (степенное)', kind: 'continuous',
    params: [{ key: 'alpha', label: 'α (форма хвоста)', min: 1.2, max: 5, step: 0.1, default: 2 }],
    view: { xMin: 0, xMax: 8, yMax: 3 },
    fn: (x, p) => paretoPdf(x, p.alpha),
    mean: (p) => (p.alpha > 1 ? p.alpha / (p.alpha - 1) : Infinity),
    note: 'Степенной закон (Парето, закон Ципфа): P(X) ∝ X^(−(α+1)), где α — параметр формы. Главная особенность — «тяжёлый» (толстый) хвост: в отличие от нормального распределения, экстремально редкие и крупные события здесь имеют заметно бо́льшую вероятность. Это правило 80/20: горстка объектов даёт почти весь эффект (20% клиентов — 80% выручки). Меньше α — толще хвост; при α ≤ 1 среднее вообще бесконечно, и опираться можно только на медиану.',
  },
  studentT: {
    id: 'studentT', title: 'Стьюдента (t)', kind: 'continuous',
    params: [{ key: 'nu', label: 'ν (степени свободы)', min: 1, max: 30, step: 1, default: 3 }],
    view: { xMin: -6, xMax: 6, yMax: 0.42 },
    fn: (x, p) => studentTPdf(x, p.nu),
    mean: () => 0,
    note: 'Похоже на нормальное, но с более тяжёлыми хвостами — оно учитывает дополнительную неопределённость, когда σ оценивают по небольшой выборке. Параметр ν (степени свободы): чем он больше, тем ближе к нормальному. Это распределение t-статистики, на нём стоит t-тест.',
  },
  chiSquare: {
    id: 'chiSquare', title: 'Хи-квадрат (χ²)', kind: 'continuous',
    params: [{ key: 'k', label: 'k (степени свободы)', min: 1, max: 12, step: 1, default: 3 }],
    view: { xMin: 0, xMax: 20, yMax: 0.5 },
    fn: (x, p) => chiSquarePdf(x, p.k),
    mean: (p) => p.k,
    note: 'Распределение суммы квадратов k независимых стандартных нормальных величин (k — степени свободы). Всегда неотрицательно и скошено вправо; с ростом k становится симметричнее. На нём стоит χ²-критерий для таблиц частот и проверки дисперсии.',
  },
  bernoulli: {
    id: 'bernoulli', title: 'Бернулли', kind: 'discrete',
    params: [{ key: 'p', label: 'p (вероятность успеха)', min: 0, max: 1, step: 0.05, default: 0.5 }],
    view: { xMin: -0.6, xMax: 1.6, yMax: 1 },
    fn: (k, p) => bernoulliPmf(k, p.p),
    mean: (p) => p.p,
    note: 'Один опыт с двумя исходами «успех/неудача»: купил/не купил, орёл/решка, кликнул/нет. Единственный параметр p — вероятность успеха (высоты столбиков p и 1−p). Это кирпич, из которого складываются биномиальное распределение и доли-конверсии в A/B.',
  },
  binomial: {
    id: 'binomial', title: 'Биномиальное', kind: 'discrete',
    params: [
      { key: 'n', label: 'n (число опытов)', min: 1, max: 20, step: 1, default: 10 },
      { key: 'p', label: 'p (вероятность успеха)', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
    view: { xMin: 0, xMax: 20, yMax: 0.4 },
    fn: (k, p) => binomialPmf(k, p.n, p.p),
    mean: (p) => p.n * p.p,
    note: 'Число успехов в n независимых опытах Бернулли (сколько из n посетителей купят, сколько из 10 писем откроют). Параметры n и p, среднее n·p. С ростом n форма приближается к нормальной — это уже намёк на центральную предельную теорему.',
  },
  poisson: {
    id: 'poisson', title: 'Пуассона', kind: 'discrete',
    params: [{ key: 'lambda', label: 'λ (среднее число событий)', min: 0.5, max: 12, step: 0.5, default: 3 }],
    view: { xMin: 0, xMax: 20, yMax: 0.4 },
    fn: (k, p) => poissonPmf(k, p.lambda),
    mean: (p) => p.lambda,
    note: 'Число редких независимых событий за фиксированный интервал: звонки в колл-центр за час, отказы сервера за сутки, заказы в минуту. Единственный параметр λ — среднее число событий за интервал, и оно же равно дисперсии. При малом λ форма скошена, при большом — почти симметрична.',
  },
}

export const distributionList = Object.values(distributions)

// Универсальный сэмплер: дискретные — через обратную CMF, непрерывные —
// rejection sampling по плотности (работает для любого распределения из реестра).
export function sampleFrom(dist, params, k = 1) {
  const out = []
  const { view } = dist
  if (dist.kind === 'discrete') {
    const xs = []
    const cmf = []
    let cum = 0
    for (let x = Math.ceil(view.xMin); x <= Math.floor(view.xMax); x++) {
      const p = dist.fn(x, params)
      if (p > 0) { cum += p; xs.push(x); cmf.push(cum) }
    }
    const total = cum || 1
    for (let i = 0; i < k; i++) {
      const u = Math.random() * total
      let j = 0
      while (j < cmf.length - 1 && cmf[j] < u) j++
      out.push(xs[j])
    }
    return out
  }
  let ymax = 0
  for (let i = 0; i <= 240; i++) {
    const x = view.xMin + ((view.xMax - view.xMin) * i) / 240
    ymax = Math.max(ymax, dist.fn(x, params))
  }
  ymax *= 1.06
  for (let i = 0; i < k; i++) {
    for (let t = 0; t < 400; t++) {
      const x = view.xMin + Math.random() * (view.xMax - view.xMin)
      const y = Math.random() * ymax
      if (y <= dist.fn(x, params)) { out.push(x); break }
    }
  }
  return out
}

// Теоретическая CDF: дискретная — нарастающая сумма; непрерывная — численный интеграл pdf.
export function cdfAt(dist, params, x) {
  const { view } = dist
  if (dist.kind === 'discrete') {
    let cum = 0
    for (let k = Math.ceil(view.xMin); k <= Math.floor(x); k++) cum += dist.fn(k, params)
    return Math.min(1, cum)
  }
  const steps = 200
  const a = view.xMin
  const h = (x - a) / steps
  if (h <= 0) return 0
  let s = 0
  for (let i = 0; i < steps; i++) {
    const x0 = a + h * i
    s += 0.5 * (dist.fn(x0, params) + dist.fn(x0 + h, params)) * h
  }
  return Math.min(1, Math.max(0, s))
}
