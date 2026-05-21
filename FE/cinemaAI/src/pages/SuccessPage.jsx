import { useRef, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'
import { getMovieById } from '../data/movies'

// Generate a stable booking code per page load
const BOOKING_CODE = 'CP-' + Math.random().toString(36).toUpperCase().slice(2, 8) + 'X'

const TICKET_DETAILS = [
  { label: 'Rạp Chiếu',  value: 'Cinema 04 • IMAX' },
  { label: 'Suất Chiếu', value: '20:45 • Hôm nay' },
  { label: 'Ghế Ngồi',   value: 'G12, G13' },
  { label: 'Dịch Vụ',    value: 'Combo VIP 1' },
]

// ─── 3-D tilt helper ─────────────────────────────────────────────────────────
function use3DTilt() {
  const ref = useRef(null)

  function onMove(e) {
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const rx = ((e.clientY - top  - height / 2) / 50).toFixed(2)
    const ry = ((width / 2 - (e.clientX - left)) / 50).toFixed(2)
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
  }

  return { ref, onMove, onLeave }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movie = useMemo(() => (id ? getMovieById(id) : null), [id])
  const tilt = use3DTilt()

  const movieTitle = movie?.title || 'Neon Horizon'
  const posterUrl   = movie?.posterUrl || ''

  // Save this booking to localStorage so ProfilePage can list it
  useEffect(() => {
    const booking = {
      code:     BOOKING_CODE,
      movieId:  id,
      title:    movieTitle,
      posterUrl,
      seats:    TICKET_DETAILS.find(d => d.label === 'Ghế Ngồi')?.value  || 'G12, G13',
      showtime: TICKET_DETAILS.find(d => d.label === 'Suất Chiếu')?.value || '20:45',
      cinema:   TICKET_DETAILS.find(d => d.label === 'Rạp Chiếu')?.value  || 'Cinema 04',
      service:  TICKET_DETAILS.find(d => d.label === 'Dịch Vụ')?.value    || '',
      date:     new Date().toISOString(),
      status:   'upcoming',
    }
    const prev = JSON.parse(localStorage.getItem('cp_bookings') || '[]')
    // Guard against StrictMode double-fire producing duplicate entry
    if (!prev.find(b => b.code === booking.code)) {
      localStorage.setItem('cp_bookings', JSON.stringify([booking, ...prev].slice(0, 50)))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-[#0e0e0f] text-on-surface font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 flex-grow flex flex-col items-center justify-center">

        {/* ── Success badge ─────────────────────────────────────────────── */}
        <div className="mb-12 flex flex-col items-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full primary-gradient flex items-center justify-center success-glow animate-bounce">
            <span
              className="material-symbols-outlined text-white text-5xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="mt-8 text-center">
            <h2 className="font-headline-xl text-headline-xl text-white mb-2">
              Thanh Toán Thành Công!
            </h2>
            <p className="text-on-surface-variant font-body-lg">
              Cảm ơn bạn đã lựa chọn CINEPREMIER.
            </p>
          </div>
        </div>

        {/* ── Ticket card ───────────────────────────────────────────────── */}
        <div
          ref={tilt.ref}
          onMouseMove={tilt.onMove}
          onMouseLeave={tilt.onLeave}
          className="max-w-2xl w-full glass-panel rounded-xl overflow-hidden shadow-2xl relative transition-transform duration-300 animate-fade-in-up delay-200"
          style={{ willChange: 'transform' }}
        >
          {/* Shimmer sweep */}
          <div className="card-shimmer absolute inset-0 pointer-events-none z-10 rounded-xl" />

          <div className="flex flex-col md:flex-row">
            {/* Poster */}
            <div className="w-full md:w-1/3 relative" style={{ aspectRatio: '2/3' }}>
              {posterUrl ? (
                <img className="w-full h-full object-cover" src={posterUrl} alt={movieTitle} />
              ) : (
                <div className="w-full h-full bg-surface-container" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            </div>

            {/* Details */}
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                {/* Title + code row */}
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs mb-2 inline-block font-label-sm tracking-widest">
                      MÃ ĐẶT VÉ: {BOOKING_CODE}
                    </span>
                    <h3 className="font-headline-lg text-headline-lg text-white">{movieTitle}</h3>
                  </div>
                  <span className="text-primary font-headline-lg flex-shrink-0">240.000đ</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-white/10 pt-6">
                  {TICKET_DETAILS.map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                        {label}
                      </p>
                      <p className="font-semibold text-white text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR + instruction */}
              <div className="mt-8 flex items-center gap-6 bg-white/5 p-4 rounded-lg border border-white/5">
                <div className="w-24 h-24 bg-white p-2 rounded-lg flex-shrink-0">
                  <img
                    alt="Mã QR vé"
                    className="w-full h-full grayscale brightness-90"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ5VrwovGPvjWsJxXVO-OCPgrzkvqX5byKVfjjN5GxHOkzyxtEZkwlt1ir4KUqalhk6Sx5RXz0w6CHj8WOFasxVQxHXP1CIDXmNtACk7vWma8OOhBQ8M-DV2rqPN5awkUSuQrMcMBv8ZdEdR19s6l4NJ9m7xNbluxu7_VEgcNmfqe0thXxS8Q0f3RGEKBH7bQYglk240sfNn_nM6oSM-pUiOGejY2l9vi-D3scNUw0re-4ipOVtN9sEQnfTqCl-1Hj69v5MUd6Zwwy"
                  />
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Quét mã tại quầy</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Vui lòng đến trước giờ chiếu 15 phút để nhận bắp nước.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="mt-12 flex flex-col md:flex-row gap-4 w-full max-w-2xl animate-fade-in-up delay-400">
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex-1 primary-gradient py-4 rounded-lg font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              confirmation_number
            </span>
            Xem Vé Của Tôi
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 glass-panel py-4 rounded-lg font-bold text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">home</span>
            Về Trang Chủ
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
