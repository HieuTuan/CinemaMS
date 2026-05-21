import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'

// ─── Static user data (replace with real auth later) ─────────────────────────
const USER = {
  name:       'Minh Hong',
  since:      'Tháng 1, 2022',
  city:       'TP. Hồ Chí Minh',
  tier:       'VIP GOLD',
  points:     2450,
  progress:   85,         // % toward next tier
  avatarUrl:  'https://lh3.googleusercontent.com/aida-public/AB6AXuAakTITHxwPSZn1o-Ux2Tpxyha1-CgMBTYHzAIZSiTtSVJEL2kqyJyNb-TQqUEZEExXhaCwYceiB6f4ooIDMk-2lUgqLGeIZSDpNlQb4FAAk9iung2wFkW15o-7fWRRdGx_focHL-MdJbSigf3K8rYsqAAjxX-VI-zfsOQaqvyPY10pZ1ipOuqrDkkBGdkWl1hGDaWsFgqHt2O3M7Nj5-SYtFbSd1vu5HkNFt-RCoix-sVFz-wgZUUMBnOzfo2uNGlhGKF2BbIAySFY',
  baseMovies: 40,         // "base" watched count before tracked bookings
}

// ─── Ticket card ─────────────────────────────────────────────────────────────
function BookingCard({ booking, index }) {
  const navigate  = useNavigate()
  const isUpcoming = booking.status === 'upcoming'

  return (
    <div
      className="glass-panel rounded-xl p-4 flex gap-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Poster */}
      <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container">
        {booking.posterUrl ? (
          <img
            className="w-full h-full object-cover"
            src={booking.posterUrl}
            alt={booking.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">movie</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <h3 className="font-headline-lg text-lg text-white mb-0.5 truncate">{booking.title}</h3>
          <p className="text-on-surface-variant text-sm">{booking.showtime} • {booking.cinema}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-[10px] font-bold bg-surface-variant px-2 py-0.5 rounded uppercase">
            Ghế: {booking.seats}
          </span>
          {booking.service && (
            <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">
              {booking.service}
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end justify-between py-0.5 flex-shrink-0">
        {isUpcoming ? (
          <>
            {/* Mini QR placeholder */}
            <div className="bg-white p-1 rounded-sm">
              <div
                className="w-10 h-10"
                style={{
                  background: 'repeating-linear-gradient(90deg,#000,#000 1px,#fff 1px,#fff 2px)',
                }}
              />
            </div>
            <button
              onClick={() => navigate(`/success/${booking.movieId}`)}
              className="bg-primary-container text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:shadow-[0_0_15px_rgba(229,9,20,0.3)] transition-all mt-2"
            >
              Chi tiết
            </button>
          </>
        ) : (
          <>
            <span className="text-on-surface-variant text-[10px] font-bold uppercase italic">Đã xem</span>
            <button
              onClick={() => booking.movieId && navigate(`/booking/${booking.movieId}`)}
              className="bg-surface-container-highest text-on-surface px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-surface-variant transition-all mt-2"
            >
              Mua lại
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function SettingRow({ icon, label, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group"
    >
      <div className="flex items-center gap-4">
        <span
          className={`material-symbols-outlined transition-colors ${highlight ? 'text-primary-container group-hover:text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}
          style={highlight ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {icon}
        </span>
        <span className={`font-body-md ${highlight ? 'text-primary' : ''}`}>{label}</span>
      </div>
      <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate  = useNavigate()
  const [bookings, setBookings] = useState([])

  // Load bookings from localStorage
  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('cp_bookings') || '[]')
    setBookings(raw)
  }, [])

  const moviesWatched = USER.baseMovies + bookings.length

  return (
    <div className="bg-[#0e0e0f] text-on-surface font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full space-y-12">

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row gap-6 items-end animate-fade-in-up">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="glass-panel rounded-lg w-32 h-32 md:w-40 md:h-40 overflow-hidden">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src={USER.avatarUrl}
              />
            </div>
            <button className="absolute -bottom-1 -right-1 bg-primary-container p-2 rounded-lg shadow-lg hover:scale-110 active:scale-95 transition-all text-white">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            {/* Name + tier */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display-lg text-display-lg-mobile md:text-[48px] md:leading-[56px] font-extrabold tracking-tighter text-white">
                  {USER.name}
                </h1>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black px-3 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 uppercase tracking-wider">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    stars
                  </span>
                  {USER.tier}
                </span>
              </div>
              <p className="text-on-surface-variant font-body-md flex items-center gap-2 opacity-90">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Thành viên từ {USER.since} • {USER.city}
              </p>
            </div>

            {/* Tier progress bar */}
            <div className="w-full max-w-sm space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                <span>Tiến trình hạng tiếp theo</span>
                <span className="text-primary">{USER.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full shadow-[0_0_8px_#ffb4aa] animate-progress-fill"
                  style={{ width: `${USER.progress}%` }}
                />
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex gap-4 pt-1">
              <div className="glass-panel rounded-lg px-4 py-3 flex flex-col items-start min-w-[130px]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">CinePoints</span>
                </div>
                <span className="text-primary font-display-lg text-2xl font-bold">{USER.points.toLocaleString()}</span>
              </div>
              <div className="glass-panel rounded-lg px-4 py-3 flex flex-col items-start min-w-[130px]">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="material-symbols-outlined text-secondary text-[18px]">movie</span>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Phim đã xem</span>
                </div>
                <span className="text-secondary font-display-lg text-2xl font-bold">{moviesWatched}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

          {/* ── Bookings column ─────────────────────────────────────────── */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">confirmation_number</span>
                Lịch sử đặt vé
              </h2>
              {bookings.length > 0 && (
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest">
                  {bookings.length} vé
                </span>
              )}
            </div>

            {bookings.length === 0 ? (
              /* Empty state */
              <div className="glass-panel rounded-xl p-10 flex flex-col items-center justify-center text-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">
                  confirmation_number
                </span>
                <p className="text-on-surface-variant font-body-lg">Bạn chưa có vé nào.</p>
                <button
                  onClick={() => navigate('/movies')}
                  className="primary-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Khám phá phim
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b, i) => (
                  <BookingCard key={b.code} booking={b} index={i} />
                ))}
              </div>
            )}
          </section>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="space-y-6">

            {/* Genre preference radar */}
            <div className="glass-panel rounded-xl p-6">
              <h2 className="font-headline-lg text-headline-lg flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-secondary">psychology</span>
                Sở thích
              </h2>

              {/* Radar-style decoration */}
              <div className="relative w-full aspect-square flex items-center justify-center mb-6 max-w-[200px] mx-auto">
                <div className="absolute inset-0 border border-white/5 rounded-full" />
                <div className="absolute inset-6 border border-white/5 rounded-full" />
                <div className="absolute inset-12 border border-white/5 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 overflow-visible">
                    <polygon
                      fill="rgba(220,184,255,0.25)"
                      stroke="#dcb8ff"
                      strokeWidth="1.5"
                      points="100,30 150,85 130,150 70,150 50,85"
                      transform="scale(0.9) translate(11,11)"
                    />
                  </svg>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Sci-Fi</div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Drama</div>
                <div className="absolute top-1/4 left-0 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Action</div>
                <div className="absolute top-1/4 right-0 translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Noir</div>
                <div className="absolute bottom-1/4 right-0 translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Thriller</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                  Khoa học Viễn tưởng
                </span>
                <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                  Hành động
                </span>
                <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                  Kinh dị Noir
                </span>
              </div>
            </div>

            {/* Settings panel */}
            <div className="glass-panel rounded-xl p-6">
              <h2 className="font-headline-lg text-headline-lg flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-on-surface-variant">settings</span>
                Cài đặt
              </h2>

              <SettingRow icon="person_outline" label="Chỉnh sửa hồ sơ" />
              <SettingRow icon="credit_card"    label="Phương thức thanh toán" />
              <SettingRow icon="lock"           label="Mật khẩu & Bảo mật" />
              <SettingRow icon="favorite"       label="Mục yêu thích" highlight onClick={() => navigate('/wishlist')} />

              <div className="pt-4 mt-2 border-t border-white/10">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-4 p-4 text-error hover:bg-error/10 rounded-2xl transition-all"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="font-body-md font-bold uppercase tracking-widest">Đăng xuất</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
