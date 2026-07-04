// Английские версии уроков: авто-реестр — любой JSON в этой папке
// автоматически попадает в /en (и в пререндер через glob по файлам).
const modules = import.meta.glob('./*.json', { eager: true })
export const lessonsEnById = Object.fromEntries(
  Object.values(modules).map((m) => {
    const l = m.default ?? m
    return [l.id, l]
  }),
)
