import { useEffect, useRef, useState } from 'react'

// Автопрогон симуляции (паттерн Start/Stop из Seeing Theory): пока включён,
// тикает cb каждые delay мс. cb читается через ref — всегда свежая замыкание.
export function useAutoRun(cb, delay = 120) {
  const [running, setRunning] = useState(false)
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => ref.current(), delay)
    return () => clearInterval(t)
  }, [running, delay])
  return [running, setRunning]
}

// Единая кнопка-тумблер автопрогона.
export function autoRunClass(running) {
  return running
    ? 'text-xs px-2.5 py-1 rounded bg-cyanink text-white hover:opacity-90'
    : 'text-xs px-2.5 py-1 rounded border border-accent/40 text-cyanink hover:bg-accent/10'
}
