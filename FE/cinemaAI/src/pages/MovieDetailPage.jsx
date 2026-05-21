import { useEffect, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getMovieById } from '../data/movies'

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ label, score, isPrimary = false }) {
  const pct = Math.min(100, Math.round(score * 10))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className={`font-bold ${isPrimary ? 'text-primary' : 'text-secondary'}`}>{score}</span>
      </div>
      <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
        <div
          className={`${isPrimary ? 'bg-primary' : 'bg-secondary'} h-1.5 rounded-full animate-progress-fill`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function CastCircle({ name, role, imageUrl }) {
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
        <p className="font-body-md font-bold text-on-surface text-sm">{name}</p>
        <p className="font-label-sm text-on-surface-variant">{role}</p>
      </div>
    </div>
  )
}

function CastCard({ name, role, imageUrl }) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="rounded-xl overflow-hidden aspect-[3/4] border border-white/10 glass-hover">
        <img
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={imageUrl}
        />
      </div>
      <div>
        <p className="font-body-md font-bold text-on-surface text-sm">{name}</p>
        <p className="font-label-sm text-on-surface-variant">{role}</p>
      </div>
    </div>
  )
}

function StarRow({ count }) {
  return (
    <div className="flex text-primary">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: i < count ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  )
}

function ReviewCard({ initials, name, time, stars, text }) {
  return (
    <div className="bg-surface-container/40 backdrop-blur-md rounded-xl p-6 border border-white/10 glass-hover">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface font-bold text-sm">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{name}</p>
            <p className="text-[10px] text-on-surface-variant">{time}</p>
          </div>
        </div>
        <StarRow count={stars} />
      </div>
      <p className="text-sm text-on-surface-variant italic leading-relaxed">"{text}"</p>
    </div>
  )
}

// ─── Particle canvas (floating dust) ─────────────────────────────────────────

function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let animId

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2,
      vx: Math.random() * 0.5 - 0.25,
      vy: -(Math.random() * 0.5 + 0.1),
      opacity: Math.random() * 0.5,
    }))

    function tick() {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.y < 0) { p.y = h; p.x = Math.random() * w }
        if (p.x > w) p.x = 0
        if (p.x < 0) p.x = w
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      animId = requestAnimationFrame(tick)
    }

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [canvasRef])
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MovieDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  useParticles(canvasRef)

  const movie = getMovieById(id)
  if (!movie) return <Navigate to="/movies" replace />

  const { aiScores, cast, reviews, emotionTags } = movie

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
      {/* Particle layer */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[1]" />

      <Navbar />

      <main className="flex-grow relative">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative w-full min-h-[716px] md:min-h-[870px] overflow-hidden flex items-end pt-32 pb-12">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url('${movie.backdropUrl}')` }}
          />
          <div className="absolute inset-0 bg-gradient-fade z-0" />

          <div className="relative w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto z-10 flex flex-col md:flex-row gap-8 items-end">

            {/* Poster — desktop 3D hover */}
            <div className="hidden md:block w-64 flex-shrink-0 animate-fade-in-up poster-container">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 poster-3d relative after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/60 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500">
                <img
                  alt={movie.title}
                  className="w-full h-auto object-cover aspect-[2/3]"
                  src={movie.posterUrl}
                />
              </div>
            </div>

            {/* Info column */}
            <div className="flex-grow flex flex-col items-start gap-4">

              {/* Genre / rating / duration chips */}
              <div className="flex gap-2 flex-wrap animate-fade-in-up delay-100">
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 rounded-full font-label-sm"
                  >
                    {g}
                  </span>
                ))}
                {movie.rating && (
                  <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/30 rounded-full font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    {movie.rating}
                  </span>
                )}
                <span className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded-full font-label-sm">
                  {movie.duration}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display-lg-mobile md:font-display-lg text-on-background drop-shadow-lg animate-fade-in-up delay-200">
                {movie.title}
              </h1>

              {/* Description */}
              <p className="font-body-lg text-on-surface-variant max-w-3xl drop-shadow-md animate-fade-in-up delay-300 leading-relaxed">
                {movie.description}
              </p>

              {/* AI Analysis card */}
              <div className="w-full max-w-3xl bg-surface/40 backdrop-blur-md rounded-xl p-6 border border-white/10 mt-2 mb-4 shadow-xl animate-fade-in-up delay-400 glass-hover z-20">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">smart_toy</span>
                  <h3 className="font-headline-lg text-on-surface">AI Phân Tích Phim</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Score bars */}
                  <div className="flex flex-col gap-3">
                    <ScoreBar label="Tổng quan"  score={aiScores.overall} isPrimary />
                    <ScoreBar label="Cốt truyện" score={aiScores.plot} />
                    <ScoreBar label="Diễn xuất"  score={aiScores.acting} />
                    <ScoreBar label="Hình ảnh"   score={aiScores.visual} />
                    <ScoreBar label="Âm thanh"   score={aiScores.sound} />
                  </div>
                  {/* Emotion map */}
                  <div className="flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm text-on-surface-variant mb-2">Biểu đồ cảm xúc</h4>
                      <div className="h-16 w-full rounded-lg bg-surface-variant/30 border border-white/5 relative overflow-hidden">
                        <svg
                          className="w-full h-full text-primary opacity-80"
                          preserveAspectRatio="none"
                          viewBox="0 0 100 100"
                        >
                          <path
                            className="animate-draw-line"
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
                      {emotionTags.map((tag) => (
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

              {/* CTA buttons */}
              <div className="flex gap-4 w-full sm:w-auto animate-fade-in-up delay-400 z-20">
                <button className="flex-grow sm:flex-grow-0 primary-gradient text-white px-8 py-4 rounded-xl font-headline-lg flex items-center justify-center gap-2 animate-pulse-glow hover:scale-105 transition-transform duration-300">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_activity
                  </span>
                  Đặt Vé Ngay
                </button>
                <button className="glass-hover bg-surface/50 backdrop-blur-md border border-white/20 text-on-surface px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-all duration-300">
                  <span className="material-symbols-outlined">play_circle</span>
                  Trailer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Details: cast circles + sidebar ──────────────────────────────── */}
        <div className="px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-20">

          {/* Left — top 3 cast (circle, horizontal scroll) */}
          <div className="lg:col-span-2 flex flex-col gap-12 animate-fade-in-up">
            {cast.length > 0 && (
              <section>
                <h2 className="font-headline-xl text-headline-xl mb-6">Diễn Viên</h2>
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
                  {cast.slice(0, 3).map((actor) => (
                    <CastCircle key={actor.name} {...actor} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right — movie meta */}
          <div className="flex flex-col gap-8 animate-fade-in-up delay-100">
            <div className="bg-surface-container/50 backdrop-blur-md rounded-xl p-6 border border-white/5 glass-hover">
              <h3 className="font-headline-lg text-headline-lg mb-4 text-on-surface">Chi Tiết Phim</h3>
              <ul className="flex flex-col gap-4 font-body-md text-on-surface-variant">
                {movie.director && (
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Đạo diễn</span>
                    <span className="text-on-surface font-semibold">{movie.director}</span>
                  </li>
                )}
                {movie.releaseDate && (
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Khởi chiếu</span>
                    <span className="text-on-surface font-semibold">{movie.releaseDate}</span>
                  </li>
                )}
                {movie.ageRating && (
                  <li className="flex justify-between border-b border-white/5 pb-2">
                    <span>Độ tuổi</span>
                    <span className="text-on-surface font-semibold">{movie.ageRating}</span>
                  </li>
                )}
                <li className="flex justify-between border-b border-white/5 pb-2">
                  <span>Thể loại</span>
                  <span className="text-on-surface font-semibold">{movie.genres.join(', ')}</span>
                </li>
                <li className="flex justify-between">
                  <span>Thời lượng</span>
                  <span className="text-on-surface font-semibold">{movie.duration}</span>
                </li>
              </ul>
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Quay lại
            </button>
          </div>
        </div>

        {/* ── Full cast grid + reviews ──────────────────────────────────────── */}
        <section className="px-margin-mobile md:px-margin-desktop py-8 max-w-container-max mx-auto relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Full cast grid */}
            {cast.length > 0 && (
              <div className="lg:col-span-2 animate-fade-in-up">
                <h2 className="font-headline-xl text-headline-xl mb-8">Dàn Diễn Viên</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {cast.map((actor) => (
                    <CastCard key={actor.name} {...actor} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="flex flex-col gap-6 animate-fade-in-up delay-100">
                <h2 className="font-headline-xl text-headline-xl">Đánh Giá</h2>
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <ReviewCard key={r.name} {...r} />
                  ))}
                </div>
                <button className="w-full py-4 border border-white/10 rounded-xl text-on-surface-variant font-headline-lg text-sm tracking-widest hover:bg-white/5 hover:text-on-surface transition-all duration-200">
                  XEM TẤT CẢ ĐÁNH GIÁ
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
