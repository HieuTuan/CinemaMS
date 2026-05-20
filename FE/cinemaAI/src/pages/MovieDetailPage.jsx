import { useParams } from 'react-router-dom'
import DustParticles from '../components/DustParticles'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { MOVIES_DATA, FALLBACK_MOVIE } from '../data/movies'

function ScoreBar({ label, value, pct, color, textColor }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className={`${textColor} font-bold`}>{value}</span>
      </div>
      <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CastCard({ name, role, imageUrl }) {
  return (
    <div className="flex flex-col items-center gap-3 min-w-[100px] snap-start group">
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-surface-variant group-hover:border-primary transition-colors duration-300 shadow-lg">
        <img
          alt={name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500"
          src={imageUrl}
        />
      </div>
      <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
        <p className="font-body-md font-bold text-on-surface">{name}</p>
        <p className="text-xs text-on-surface-variant">{role}</p>
      </div>
    </div>
  )
}

export default function MovieDetailPage() {
  const { id } = useParams()
  const MOVIE = MOVIES_DATA[Number(id)] || FALLBACK_MOVIE

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="flex-grow relative pt-[80px]">
        {/* Hero */}
        <div className="relative w-full min-h-[716px] md:min-h-[870px] overflow-hidden flex items-end pt-32 pb-12">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('${MOVIE.backdropUrl}')` }}
          />
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, transparent 0%, #131314 100%)' }} />

          <div className="relative w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto z-10 flex flex-col md:flex-row gap-8 items-end">
            {/* Poster */}
            <div className="hidden md:block w-64 flex-shrink-0" style={{ perspective: '1000px' }}>
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer transition-transform duration-500 hover:scale-105">
                <img
                  alt={`${MOVIE.title} Poster`}
                  className="w-full h-auto object-cover aspect-[2/3]"
                  src={MOVIE.posterUrl}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow flex flex-col items-start gap-4">
              {/* Badges */}
              <div className="flex gap-2 flex-wrap opacity-0 animate-fade-in-up">
                {MOVIE.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 rounded-full text-xs font-semibold"
                  >
                    {g}
                  </span>
                ))}
                <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 rounded-full text-xs font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">star</span>
                  {MOVIE.rating}
                </span>
                <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full text-xs font-semibold">
                  {MOVIE.duration}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background drop-shadow-lg opacity-0 animate-fade-in-up stagger-2">
                {MOVIE.title}
              </h1>

              {/* Description */}
              <p className="text-on-surface-variant max-w-3xl drop-shadow-md opacity-0 animate-fade-in-up stagger-3">
                {MOVIE.description}
              </p>

              {/* AI Analysis */}
              <div className="w-full max-w-3xl bg-surface/40 backdrop-blur-md rounded-xl p-6 border border-white/10 mt-2 mb-4 flex flex-col gap-6 shadow-xl opacity-0 animate-fade-in-up stagger-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <h3 className="font-headline-lg text-on-surface text-xl">AI Phân Tích Phim</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Score bars */}
                  <div className="flex flex-col gap-3">
                    {MOVIE.aiScores.map((s) => (
                      <ScoreBar key={s.label} {...s} />
                    ))}
                  </div>

                  {/* Emotion map + tags */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm text-on-surface-variant mb-2">Biểu đồ cảm xúc</h4>
                      <div className="h-16 w-full rounded-lg bg-surface-variant/30 border border-white/5 relative overflow-hidden">
                        <svg className="w-full h-full text-primary opacity-80" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path
                            d="M0,80 Q15,10 30,60 T60,30 T80,70 T100,20 L100,100 L0,100 Z"
                            fill="currentColor"
                            fillOpacity="0.2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MOVIE.aiTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-surface-variant/60 border border-white/10 rounded-md text-xs text-on-surface font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-4 w-full sm:w-auto opacity-0 animate-fade-in-up stagger-4">
                <button
                  className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-primary-container to-secondary-container text-white px-8 py-4 rounded-lg font-headline-lg text-headline-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
                  onClick={() => (window.location.href = '/booking')}
                >
                  <span className="material-symbols-outlined">local_activity</span>
                  Đặt Vé Ngay
                </button>
                <button className="bg-surface/50 backdrop-blur-md border border-white/20 text-on-surface px-6 py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                  <span className="material-symbols-outlined">play_circle</span>
                  Trailer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-20">
          {/* Cast */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            <section>
              <h2 className="font-headline-xl text-headline-xl mb-6">Diễn Viên</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {MOVIE.cast.map((actor) => (
                  <CastCard key={actor.name} {...actor} />
                ))}
              </div>
            </section>
          </div>

          {/* Movie Details sidebar */}
          <div className="flex flex-col gap-8">
            <div className="bg-surface-container/50 backdrop-blur-md rounded-xl p-6 border border-white/5">
              <h3 className="font-headline-lg text-headline-lg mb-4 text-on-surface">Chi Tiết Phim</h3>
              <ul className="flex flex-col gap-4 text-on-surface-variant">
                {[
                  { label: 'Đạo diễn', value: MOVIE.director },
                  { label: 'Khởi chiếu', value: MOVIE.releaseDate },
                  { label: 'Độ tuổi', value: MOVIE.ageRating },
                  { label: 'Thời lượng', value: MOVIE.duration },
                ].map(({ label, value }) => (
                  <li key={label} className="flex justify-between border-b border-white/5 pb-2">
                    <span>{label}</span>
                    <span className="text-on-surface font-semibold">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
