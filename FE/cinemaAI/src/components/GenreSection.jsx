const GENRES = [
  {
    label: 'Viễn Tưởng',
    icon: 'rocket_launch',
    color: 'text-primary',
    shadow: 'hover:chroma-shadow-primary',
    rotate: 'group-hover:rotate-12',
    delay: 'stagger-1',
  },
  {
    label: 'Hành Động',
    icon: 'sports_martial_arts',
    color: 'text-secondary',
    shadow: 'hover:chroma-shadow-secondary',
    rotate: 'group-hover:-rotate-12',
    delay: 'stagger-2',
  },
  {
    label: 'Tình Cảm',
    icon: 'favorite',
    color: 'text-tertiary',
    shadow: 'hover:chroma-shadow-primary',
    extra: 'animate-pulse',
    delay: 'stagger-3',
  },
  {
    label: 'Kinh Dị',
    icon: 'skull',
    color: 'text-error',
    shadow: 'hover:chroma-shadow-secondary',
    delay: 'stagger-4',
  },
]

export default function GenreSection() {
  return (
    <section className="py-16 bg-surface-container-low px-margin-desktop max-w-container-max mx-auto md:px-margin-mobile relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-variant/20 pointer-events-none" />
      <h2 className="font-headline-xl text-headline-xl text-white mb-8 text-center opacity-0 animate-fade-in-up">
        Khám Phá Thể Loại
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
        {GENRES.map(({ label, icon, color, shadow, rotate, extra, delay }) => (
          <div
            key={label}
            className={`glass-panel p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-variant/80 ${shadow} transition-all duration-300 group opacity-0 animate-fade-in-up ${delay} hover:-translate-y-2`}
          >
            <span
              className={`material-symbols-outlined text-4xl ${color} mb-4 group-hover:scale-125 ${rotate ?? ''} ${extra ?? ''} transition-transform duration-300`}
            >
              {icon}
            </span>
            <span className={`font-headline-lg text-headline-lg text-white group-hover:${color} transition-colors duration-300`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
