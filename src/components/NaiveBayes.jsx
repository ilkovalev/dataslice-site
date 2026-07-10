import { useState } from 'react'

// Наивный Байес: письмо — набор слов. Для каждого встретившегося слова берём
// отношение правдоподобий P(слово|спам)/P(слово|не спам) и ПЕРЕМНОЖАЕМ их
// (допущение независимости), домножив на априорные шансы P(спам). Получаем P(спам|письмо).
const WORDS = [
  { w: 'выигрыш', wEn: 'prize', s: 0.30, h: 0.02 },
  { w: 'срочно', wEn: 'urgent', s: 0.25, h: 0.05 },
  { w: 'деньги', wEn: 'money', s: 0.22, h: 0.05 },
  { w: 'встреча', wEn: 'meeting', s: 0.05, h: 0.30 },
  { w: 'отчёт', wEn: 'report', s: 0.04, h: 0.28 },
  { w: 'проект', wEn: 'project', s: 0.05, h: 0.22 },
]

export default function NaiveBayes({ locale = 'ru' }) {
  const en = locale === 'en'
  const [on, setOn] = useState([true, true, false, false, false, false])
  const [prior, setPrior] = useState(0.3)

  const toggle = (i) => setOn(on.map((v, k) => (k === i ? !v : v)))
  let odds = prior / (1 - prior)
  const present = []
  WORDS.forEach((wd, i) => { if (on[i]) { const lr = wd.s / wd.h; odds *= lr; present.push({ ...wd, lr }) } })
  const p = odds / (1 + odds)

  return (
    <div className="rounded-xl border border-black/10 bg-panel p-5">
      <div className="text-xs text-gray-500 mb-2">{en ? 'The email = the selected words. Click to add/remove a word:' : 'Письмо = выбранные слова. Кликайте, чтобы включить/убрать слово:'}</div>
      <div className="flex flex-wrap gap-2">
        {WORDS.map((wd, i) => (
          <button key={wd.w} onClick={() => toggle(i)} className={`text-sm px-3 py-1.5 rounded-lg border ${on[i] ? (wd.s > wd.h ? 'border-[#2ab8eb]/50 bg-[#2ab8eb]/15 text-cyanink' : 'border-amber-400/50 bg-amber-400/15 text-amber-700') : 'border-black/10 text-gray-500 hover:bg-black/5'}`}>
            {en ? wd.wEn : wd.w}
            <span className="block text-[10px] text-gray-500">LR {(wd.s / wd.h).toFixed(1)}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-black/10 bg-ink px-3 py-2.5 text-sm">
        <div className="font-mono text-gray-700 text-xs leading-relaxed">
          {en ? 'odds' : 'шансы'} = {prior.toFixed(2)}/{(1 - prior).toFixed(2)}
          {present.map((pr) => <span key={pr.w}> × {pr.lr.toFixed(1)}<span className="text-gray-400">({en ? pr.wEn : pr.w})</span></span>)}
        </div>
        <div className="mt-2 text-lg">{en ? 'P(spam | email)' : 'P(спам | письмо)'} = <span className={`font-semibold ${p > 0.5 ? 'text-[#dc4d4d]' : 'text-green-600'}`}>{(p * 100).toFixed(1)}%</span> <span className="text-sm text-gray-500">→ {p > 0.5 ? (en ? 'spam' : 'спам') : (en ? 'not spam' : 'не спам')}</span></div>
        {/* шкала */}
        <div className="h-2 rounded-full bg-black/10 mt-2 overflow-hidden"><div className="h-full bg-[#dc4d4d]" style={{ width: `${p * 100}%` }} /></div>
      </div>

      <label className="block mt-3 text-sm">
        <div className="flex justify-between text-gray-700 mb-1"><span>{en ? 'Prior share of spam P(spam)' : 'Априорная доля спама P(спам)'}</span><span className="tabular-nums text-cyanink">{(prior * 100).toFixed(0)}%</span></div>
        <input type="range" min="0.05" max="0.7" step="0.05" value={prior} onChange={(e) => setPrior(Number(e.target.value))} className="w-full accent-accent" />
      </label>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">{en
        ? 'Each spam word (LR>1) pushes the probability up; a "business" word (LR<1) pushes it down. The words multiply independently — hence "naive". The base rate P(spam) is the starting odds: when spam is rare, even strong words do not make the email spam for sure.'
        : 'Каждое спам-слово (LR>1) толкает вероятность вверх, «деловое» (LR<1) — вниз. Слова перемножаются независимо — отсюда «наивный». Базовая ставка P(спам) — стартовые шансы: при редком спаме даже сильные слова не делают письмо спамом наверняка.'}</p>
    </div>
  )
}
