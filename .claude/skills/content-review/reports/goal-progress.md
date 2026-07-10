# content-review — прогресс (ревью КОНТЕНТА)

Критерий: урок позволяет новичку разобраться в теме на уровне простых задач junior/middle аналитика.
Подход: novice-test + достаточность + SFDA-манера (reference/sfda-priyomy.md). Коммит — ПО МОДУЛЮ.
Легенда: [ ] не сделан · [x] модуль прошёл порог достаточности

## ЧАСТЬ A — Статистика (/stats), 57 уроков в 12 модулях

- [x] Модуль 1 (5 ур.): center-measures, histogram, outliers, percentiles, spread

- [x] Модуль 2 (4 ур.): conditional-bayes, probability-basics, probability-lln, random-variable

- [x] Модуль 3 (5 ур.): continuous-distributions, discrete-distributions, identify-distribution, normal-distribution, skew-tail

- [x] Модуль 4 (4 ур.): bootstrap, clt, confidence-intervals, sampling-statistic

- [x] Модуль 5 (6 ур.): ci-vs-pvalue, hypothesis-intro, hypothesis-test, power-sample-size, stat-criteria, variance-reduction

- [x] Модуль 6 (9 ур.): ab-process, ab-test, evidence-pyramid, experiment-metrics, multiple-comparisons, network-effects, peeking, segments-cate, sequential-tests

- [x] Модуль 7 (6 ур.): causality, correlation-types, multiple-regression, regression-assumptions, regression-metrics, regression

- [ ] Модуль 8 (6 ур.): capstone, class-imbalance, classification, confusion-matrix, overfitting, roc

- [ ] Модуль 9 (5 ур.): data-leakage, goodhart, regression-to-mean, simpson-paradox, survivorship-bias

- [ ] Модуль 10 (3 ур.): bayesian-ab, bayesian-inference, naive-bayes

- [ ] Модуль 11 (3 ур.): anova, posthoc-anova, two-way-anova

- [ ] Модуль 12 (1 ур.): capstone-project

## ЧАСТЬ B — Иерархии метрик (/metrics), 15 индустрий

- [ ] ai — AI / LLM-продукты
- [ ] classifieds — Классифайды / lead-gen
- [ ] ecommerce — Прямая коммерция
- [ ] edtech — Образовательный результат
- [ ] fintech — Финтех
- [ ] foodtech — Транзакционные платформы
- [ ] gaming — Виртуальная экономика
- [ ] marketplace — Транзакционные платформы
- [ ] ondemand — Транзакционные платформы
- [ ] ota — Транзакционные платформы
- [ ] restaurants — Сети физических точек
- [ ] saas — Подписки
- [ ] search — Экономика внимания
- [ ] social — Экономика внимания
- [ ] streaming — Подписки

## ЧАСТЬ C — Глоссарий (glossary.js)
- [ ] термины глоссария понятны новичку

**Модуль 1** — 5/5 прошли novice-test без правок. Эталонный модуль: мотивация→провал→predict/reveal,
сквозной пример «Мама Джонс» доказывает мысль, `simple` у всех определений непустые и не дублируют text.
Правок по достаточности не требуется (добавлять нечего, воды нет).

**Модуль 2** — 4/4 прошли novice-test без правок. Ошибка игрока и база-ставка (90%→8%) поданы через
predict/reveal; обозначения P(·) и «|» разжёваны в conditional-bayes. Пустой `simple` у «Испытание» —
корректно: term атомарный («одно случайное наблюдение — бросок монеты»), дубль не нужен (правило 11).

**Модуль 3** — 5/5 прошли novice-test без правок. PMF/CDF и «плотность = площадь, не высота» разжёваны;
z-оценка на росте 192→z=2; identify-distribution даёт рабочий чек-лист (гистограмма первой, бимодальность→сегмент,
Q-Q, дисперсия≈среднее→Пуассон). Пустые `simple` у μ/σ — корректно (атомарны, text уже человеческий).

**Модуль 4** — 4/4 прошли novice-test без правок. «Оценка = случайная величина» держит весь вывод;
трактовка «95% доверия» дана корректно (частотная, заблуждение снято явно); бутстреп связан с ЦПТ
и честно ограничен («мусор на входе → уверенно посчитанный мусор»). Сильнейший блок курса.

**Модуль 5** — 6/6 прошли novice-test без правок контента. p-value с «чего он НЕ значит», связь CI↔p,
различение «A/B-метод vs стат-критерий» (t/z/Манна-Уитни с условиями), CUPED/стратификация. Урок
`stat-criteria` физически лежит в файле `t-test.json` (имя≠id) — это норма, глоссарий ссылается верно.

### ⚠ ЭСКАЛАЦИЯ владельцу (структурное, не правил сам)
- **EN-дубль урока stat-criteria.** В `src/content/lessons-en/` ДВА файла с одинаковым `id: stat-criteria`:
  `t-test.json` («which one to choose») и `stat-criteria.json` («which one to pick»). Загрузчик
  `lessons-en/index.js` глобит все `*.json` и мапит по `id` → один файл молча затирает другой
  (по alpha-порядку живёт `t-test.json`, `stat-criteria.json` — осиротевший). Нужно решение: какой
  оставить, второй удалить. НЕ трогал (правило эскалации).

**Модуль 6** — 9/9 прошли novice-test без правок. Самый прикладной блок: 5-этапный процесс A/B,
OEC/proxy/guardrail, пирамида доказательности, подглядывание→α-spending, множественные сравнения
(FWER/FDR/BH + holdout), ATE/CATE/ITE, SUTVA/интерференция/кластерная рандомизация. Юниор реально
сможет спроектировать и разобрать A/B. Мелочь (не правил): порядок segments-cate ↔ multiple-comparisons
задаётся кросс-ссылками, `order` в JSON undefined — вопрос сортировки сайдбара, структурный, не контент.

**Модуль 7** — 6/6 прошли novice-test без правок. Пирсон/Спирмен (r не ловит нелинейное, Анскомб),
МНК с обоснованием квадратов, корреляция≠причинность, множественная регрессия/контроль конфаундера,
анализ остатков (дуга/веер/рычаг), MAE/RMSE/MAPE/R² по цене ошибки, конфаундер/коллайдер/медиатор
(«не контролируй всё подряд»). Причинный блок особенно силён — превращает лозунг в навык.
