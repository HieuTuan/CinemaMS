import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'
import { getWishlist, toggleWishlist } from '../utils/wishlist'

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CFG = {
  now_showing:  { label: 'Đang chiếu',    bg: 'bg-tertiary-container',             text: 'text-white' },
  coming_soon:  { label: 'Sắp mở bán',    bg: 'bg-primary-container',              text: 'text-white' },
  notified:     { label: 'Thông báo đã bật', bg: 'bg-surface-container-high',      text: 'text-on-surface-variant' },
}

// ─── Single wishlist movie card ───────────────────────────────────────────────
function WishCard({ movie, onRemove }) {
  const navigate = useNavigate()
  const cfg = STATUS_CFG[movie.status] || STATUS_CFG.coming_soon
  const genreLabel = Array.isArray(movie.genres) ? movie.genres.join(' • ') : (movie.genres || '')

  return (
    <div className="group">
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden glass-panel cursor-pointer transition-all duration-500 hover:-translate-y-2"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(229,9,20,0.35)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        onClick={() => movie.id <= 200 && navigate(`/movies/${movie.id}`)}
      >
        {/* Poster */}
        {movie.posterUrl ? (
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={movie.posterUrl}
            alt={movie.title}
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant">movie</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`${cfg.bg} ${cfg.text} text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight`}>
            {cfg.label}
          </span>
        </div>

        {/* Heart remove button */}
        <button
          onClick={e => { e.stopPropagation(); onRemove(movie) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-primary-container/70 transition-all hover:scale-110 active:scale-95"
          title="Xoá khỏi danh sách"
        >
          <span
            className="material-symbols-outlined text-[18px] text-primary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>

        {/* CTA button on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {movie.status === 'now_showing' ? (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/booking/${movie.id}`) }}
              className="w-full glass-panel text-white font-label-sm text-label-sm py-2 rounded-lg flex items-center justify-center gap-2 border border-white/20 hover:bg-white hover:text-background transition-all"
            >
              <span className="material-symbols-outlined text-sm">confirmation_number</span>
              Đặt vé ngay
            </button>
          ) : (
            <button
              onClick={e => e.stopPropagation()}
              className="w-full primary-gradient text-white font-label-sm text-label-sm py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications
              </span>
              Nhận thông báo
            </button>
          )}
        </div>
      </div>

      {/* Below card */}
      <h3 className="font-headline-lg text-on-surface mt-4 px-1 truncate group-hover:text-primary transition-colors duration-300">
        {movie.title}
      </h3>
      {genreLabel && (
        <p className="text-on-surface-variant font-label-sm text-label-sm mt-1 px-1 uppercase opacity-70 truncate">
          {genreLabel}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  function load() {
    setMovies(getWishlist())
  }

  useEffect(() => {
    load()
    window.addEventListener('wishlist-change', load)
    return () => window.removeEventListener('wishlist-change', load)
  }, [])

  function handleRemove(movie) {
    toggleWishlist(movie)   // toggleWishlist dispatches 'wishlist-change' → load() fires
  }

  const nowShowing   = movies.filter(m => m.status === 'now_showing')
  const comingSoon   = movies.filter(m => m.status !== 'now_showing')

  return (
    <div className="bg-[#0e0e0f] text-on-surface font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <section className="mb-16 border-l-4 border-primary-container pl-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-[56px] md:leading-[64px] font-extrabold tracking-tight uppercase leading-tight">
                Danh sách<br />
                <span className="text-gradient">theo dõi</span>
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-xl mt-4">
                Nơi lưu giữ những tuyệt phẩm điện ảnh bạn hằng mong đợi.
              </p>
            </div>
            {movies.length > 0 && (
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
                {movies.length} phim
              </span>
            )}
          </div>
        </section>

        {/* ── Empty state ──────────────────────────────────────────────── */}
        {movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in-up">
            <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center mb-6 border border-white/10">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">bookmark_add</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-2">Danh sách trống</h2>
            <p className="text-on-surface-variant font-body-md max-w-md mb-8">
              Bạn chưa theo dõi bộ phim nào. Hãy khám phá kho tàng điện ảnh và nhấn
              <span className="material-symbols-outlined text-primary-container align-middle mx-1 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              để lưu lại.
            </p>
            <button
              onClick={() => navigate('/movies')}
              className="primary-gradient text-white px-8 py-3 rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Khám phá ngay
            </button>
          </div>
        )}

        {/* ── Now showing ──────────────────────────────────────────────── */}
        {nowShowing.length > 0 && (
          <section className="mb-16 animate-fade-in-up delay-100">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_movies
              </span>
              <h2 className="font-headline-xl text-headline-xl">Đang chiếu</h2>
              <span className="text-on-surface-variant font-label-sm text-label-sm ml-auto">{nowShowing.length} phim</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-gutter">
              {nowShowing.map(m => (
                <WishCard key={m.id} movie={m} onRemove={handleRemove} />
              ))}
            </div>
          </section>
        )}

        {/* ── Coming soon ──────────────────────────────────────────────── */}
        {comingSoon.length > 0 && (
          <section className="mb-16 animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                upcoming
              </span>
              <h2 className="font-headline-xl text-headline-xl">Sắp chiếu</h2>
              <span className="text-on-surface-variant font-label-sm text-label-sm ml-auto">{comingSoon.length} phim</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-gutter">
              {comingSoon.map(m => (
                <WishCard key={m.id} movie={m} onRemove={handleRemove} />
              ))}
            </div>
          </section>
        )}

        {/* ── Newsletter CTA ───────────────────────────────────────────── */}
        {movies.length > 0 && (
          <section className="mt-20 animate-fade-in-up delay-300">
            <div className="glass-panel rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
              {/* Ambient blobs */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-secondary-container/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex-1 z-10">
                <h2 className="font-headline-xl text-headline-xl text-white mb-4">
                  Đừng bỏ lỡ bất kỳ khoảnh khắc nào
                </h2>
                <p className="text-on-surface-variant font-body-lg">
                  Đăng ký nhận tin để được ưu tiên đặt vé cho những suất chiếu đặc biệt.
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 z-10">
                <input
                  className="bg-surface-container border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-primary-container transition-all min-w-[260px] text-on-surface placeholder-on-surface-variant/60"
                  placeholder="Email của bạn..."
                  type="email"
                />
                <button className="primary-gradient text-white px-8 py-4 rounded-full font-label-sm text-label-sm uppercase tracking-widest whitespace-nowrap hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-all active:scale-95">
                  Tham gia ngay
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
