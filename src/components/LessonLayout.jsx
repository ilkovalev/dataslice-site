import { widgets } from './widgets.js'
import BeatsLesson from './BeatsLesson.jsx'
import Paragraphs from './Paragraphs.jsx'

function Step({ label, children }) {
  return (
    <section className="mb-8">
      <div className="text-xs uppercase tracking-wider text-cyanink/80 mb-2">{label}</div>
      {children}
    </section>
  )
}

export default function LessonLayout({ lesson }) {
  // Новая модель: если есть beats — рендерим scrollytelling-стэппер.
  // key по id — чтобы при смене урока стэппер сбрасывался на первый бит.
  if (lesson.beats) return <BeatsLesson key={lesson.id} lesson={lesson} />

  const { interaction } = lesson
  const Widget = widgets[interaction.widget]

  return (
    <article className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">{lesson.title}</h2>

      <Step label="Зачем">
        <p className="text-lg text-gray-900 border-l-2 border-accent/50 pl-4">{lesson.hook}</p>
      </Step>

      <Step label="Интуиция">
        <p className="text-gray-700 leading-relaxed">{lesson.intuition}</p>
      </Step>

      <Step label="Формула">
        <div className="rounded-lg bg-ink border border-black/10 px-4 py-3 font-mono text-cyanink text-center mb-3">
          {lesson.formula.display}
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          {lesson.formula.terms.map((t) => (
            <li key={t.sym}>
              <span className="font-mono text-gray-900">{t.sym}</span> — {t.desc}
            </li>
          ))}
        </ul>
      </Step>

      <Step label="Потрогать">
        <p className="text-gray-700 mb-3">{interaction.prompt}</p>
        {Widget ? <Widget only={interaction.only} /> : <div className="text-gray-500">виджет «{interaction.widget}» ещё не готов</div>}
        {interaction.expected && (
          <p className="mt-3 text-sm text-gray-600">
            <span className="text-gray-700">Что заметить:</span> {interaction.expected}
          </p>
        )}
      </Step>

      <Step label={lesson.practiceTitle || 'Что это значит'}>
        <Paragraphs text={lesson.practice} className="text-gray-700 leading-relaxed" />
        {lesson.realLife && (
          <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/5 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-sky-600/90 mb-2">{lesson.realLifeTitle || 'Где это встречается'}</div>
            <Paragraphs text={lesson.realLife} className="text-sm text-gray-700 leading-relaxed" />
          </div>
        )}
      </Step>

      {lesson.nextLabel && (
        <div className="pt-4 border-t border-black/10 text-sm text-gray-600">
          Дальше → <span className="text-cyanink">{lesson.nextLabel}</span>
        </div>
      )}
    </article>
  )
}
