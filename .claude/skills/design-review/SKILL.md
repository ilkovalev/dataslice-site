---
name: design-review
description: Ревью дизайна и понятности сайта DataSlice — не «влоб» по коду, а по рендеру, метрикам и атомарным правилам с severity, через несколько линз. Верховный критерий — поймёт ли концепцию урока непогружённый новичок. Использовать для ревью страницы/урока после изменений в UI, контенте уроков или интерактивных графиках.
---

# Design Review — DataSlice

Система ревью, которая **видит** рендер, **измеряет** метрики и судит по **атомарным правилам
с severity** через несколько линз — вместо «влоб»-чтения кода. Верховный критерий над всеми
линзами: *поймёт ли концепцию урока непогружённый человек или ребёнок?* (`rules/clarity.md`).

Референсы (Seeing Theory, SFDA2022) — библиотека **приёмов** достижения понятности,
НЕ эталон для копирования. Эталон намерения — `BRAND.md` (тонкий указатель, не слепок стиля).

## Когда применять
Ревью страницы/урока после правок UI, текста урока (`src/content/lessons/*.json`) или
интерактивных виджетов. По умолчанию — ручной запуск на конкретной странице.

---

## Пайплайн

### 1. Захват
Поднять dev/preview-сервер, затем:
```
node .claude/skills/design-review/scripts/capture.mjs <slug>
# напр.: center-measures ; сервер по умолчанию http://localhost:4203, иначе --base
```
Отдаёт в `reports/shots/<slug>/`: скриншоты `mobile/tablet/desktop` × `RU/EN` (fullPage)
и `metrics.json` (шрифты, низкоконтрастные пары, мелкие тап-зоны, отсутствие alt, overflow, ошибки консоли).

### 2. Ревью по линзам
Прогнать линзы по собранному материалу. У каждой — свой вход (см. таблицу). **Начать
с `clarity.md`** — это верховная линза; включает проход `novice-test` (читать урок, не зная
темы, отметить первую точку потери понимания). Для линзы интерактива — доснять состояния
до/после действий Playwright'ом (образец — старые `_shot_l*.mjs`).

### 3. Сведение в отчёт
Собрать находки в `reports/Отчёт_<slug>_<дата>.md` по шаблону ниже: severity, привязка к
скрину/полю, конкретная правка. Отсортировать по severity. **Выход — отчёт, не авто-правки**
(правки вносит владелец).

---

## Линзы и вход

| Линза | Файл | Вход | Режим детекции |
|---|---|---|---|
| **Ясность (верховная)** | `clarity.md` | текст урока JSON + рендер | novice-test + сигналы по полям `intro`/`beats`/`definitions` |
| Копирайт / тон | `copy-voice.md` | текст урока JSON | чтение + `avoid-ai-writing-ru` |
| Визуальный дизайн | `visual-design.md` | скрин + метрики | числа из `metrics.json` + суждение по картинке |
| Качество графиков | `dataviz.md` | скрины состояний + метрики | суждение + контраст/оси |
| Интерактив | `interactivity.md` | Playwright-действия до/после | сравнение состояний |
| UX / смысл блоков | `ux-blocks.md` | скрин всей страницы + цель `BRAND.md` | суждение по композиции |
| Доступность | `accessibility.md` | метрики | почти чисто инструментально |

## Severity
- **blocker** — ломает понимание или доступ (текст нечитаем, контраст ниже AA на основном тексте, интерактив не работает на мобильном, новичок теряется в начале урока).
- **важное** — заметно вредит понятности/цели, но урок проходим.
- **полиш** — шлифовка (ритм отступов, мелкие типо-выбросы).

## Quick-reference правил

- `clarity.md`: novice-test · lesson-motivation · narrative-necessity · intuition-before-formalism · progressive-disclosure · bridges · legitimize-confusion · signal-weight · honest-simplification · worked-example · anchor-to-known · definition-has-plain · predict-reveal · humor-at-load
- `copy-voice.md`: human-translation · active-voice · reader-in-boat · voice-calibration · anti-ai-writing
- `visual-design.md`: visual-hierarchy · typography-scale · spacing-rhythm · ai-default-looks
- `dataviz.md`: chart-clarity · sim-convergence · chart-encoding · chart-honesty · chart-legibility
- `interactivity.md`: affordance · visible-response · direct-manipulation · micro-macro · live-readout · mobile-interaction
- `ux-blocks.md`: block-purpose · path-to-action · page-job · content-density
- `accessibility.md`: a11y-contrast · tap-targets · focus-visible · alt-text · reduced-motion

---

## Шаблон отчёта

```markdown
# Дизайн-ревью: <slug> — <дата>

**Целевое действие страницы:** <из BRAND.md>
**Тест новичка:** <прошёл / первая точка потери понимания: ...>

## Blockers
### [линза/правило] Краткая суть
- **Где:** <скрин mobile.png / поле beats[2].predict / блок X>
- **Проблема:** <что мешает понять/пользоваться>
- **Правка:** <конкретно: не «улучшить», а «H2 16px=body → 20/600 по шкале»>

## Важное
...

## Полиш
...

## Что хорошо (не трогать)
- <закрепить удачные решения, чтобы не сломать при правках>
```

Находки формулировать конкретно и с правкой. Тон отчёта — прямой, для эксперта.
Приоритет находок `clarity.md` — выше прочих при равном severity.
