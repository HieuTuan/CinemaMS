import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'
import { getMovieById } from '../data/movies'

const QR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ5VrwovGPvjWsJxXVO-OCPgrzkvqX5byKVfjjN5GxHOkzyxtEZkwlt1ir4KUqalhk6Sx5RXz0w6CHj8WOFasxVQxHXP1CIDXmNtACk7vWma8OOhBQ8M-DV2rqPN5awkUSuQrMcMBv8ZdEdR19s6l4NJ9m7xNbluxu7_VEgcNmfqe0thXxS8Q0f3RGEKBH7bQYglk240sfNn_nM6oSM-pUiOGejY2l9vi-D3scNUw0re-4ipOVtN9sEQnfTqCl-1Hj69v5MUd6Zwwy'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function formatTime(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Derive format badge text from cinema string e.g. "Cinema 04 • IMAX"
function parseCinema(cinema = '') {
  const parts = cinema.split('•').map(s => s.trim())
  return { room: parts[0] || cinema, format: parts[1] || 'IMAX' }
}

// ─── Star rating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map(s => {
        const filled = s <= (hover || value)
        return (
          <span
            key={s}
            className={`material-symbols-outlined cursor-pointer hover:scale-125 transition-transform select-none ${
              filled ? 'text-primary' : 'text-on-surface/20'
            }`}
            style={filled ? { fontVariationSettings: "'FILL' 1" } : {}}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

// ─── Full ticket card (horizontal) ───────────────────────────────────────────
function TicketCard({ booking, index }) {
  const navigate = useNavigate()
  const movie    = getMovieById(booking.movieId)
  const poster   = booking.posterUrl || movie?.posterUrl || ''
  const { room, format } = parseCinema(booking.cinema)
  const timeStr  = formatTime(booking.date)
  const dateStr  = formatDate(booking.date)

  return (
    <div
      className="glass-panel neon-glow-red rounded-xl overflow-hidden flex flex-col md:flex-row group hover:scale-[1.01] transition-all duration-500 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Poster */}
      <div className="w-full md:w-[220px] flex-shrink-0 relative overflow-hidden bg-black flex items-center justify-center p-4 min-h-[180px]">
        {poster ? (
          <img
            src={poster}
            alt={booking.title}
            className="h-full w-full object-cover md:object-contain rounded-xl shadow-2xl scale-105"
          />
        ) : (
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">movie</span>
        )}
        <div className="absolute top-4 left-4 bg-primary-container/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase">
          {format}
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          {/* Title + time */}
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="font-headline-lg text-headline-lg text-white uppercase leading-tight">
              {booking.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="font-headline-lg text-2xl font-bold text-primary">{timeStr}</div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{dateStr}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-6">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>CINEPREMIER • {room}</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-xl mb-6">
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase mb-1">Phòng chiếu</div>
              <div className="font-bold text-white">{room}</div>
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase mb-1">Ghế</div>
              <div className="font-bold text-white">{booking.seats}</div>
            </div>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase mb-1">Mã đặt chỗ</div>
              <div className="font-bold text-white text-sm">{booking.code}</div>
            </div>
          </div>
        </div>

        {/* QR row */}
        <div
          className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => navigate(`/success/${booking.movieId}`)}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 ring-1 ring-white/20 flex-shrink-0">
              <img src={QR_URL} alt="QR" className="w-full h-full grayscale" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Sẵn sàng quét</div>
              <div className="text-[10px] text-on-surface-variant">Đưa mã này cho nhân viên soát vé</div>
            </div>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings]   = useState([])
  const [rating,   setRating]     = useState(4)
  const [review,   setReview]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const raw = JSON.parse(localStorage.getItem('cp_bookings') || '[]')
    setBookings(raw)
  }, [])

  // Most recent booking used for review section
  const latestBooking = bookings[0] || null
  const latestMovie   = latestBooking ? getMovieById(latestBooking.movieId) : null

  function handleSubmitReview() {
    if (!review.trim()) return
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setReview('')
  }

  return (
    <div className="bg-[#0e0e0f] text-on-surface font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="relative z-10 pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">

        {/* ── Page title ───────────────────────────────────────────────── */}
        <div className="mb-12 animate-fade-in-up">
          <h1 className="font-display-lg text-display-lg-mobile md:text-[56px] md:leading-[64px] gradient-text-cinema font-extrabold mb-2">
            Vé của tôi
          </h1>
          <p className="text-on-surface-variant font-body-lg">
            Quản lý trải nghiệm điện ảnh cao cấp của bạn
          </p>
        </div>

        {/* ── Current tickets ──────────────────────────────────────────── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              confirmation_number
            </span>
            <h2 className="font-headline-xl text-headline-xl">Vé hiện tại</h2>
            {bookings.length > 0 && (
              <span className="ml-auto font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                {bookings.length} vé
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="glass-panel rounded-xl p-16 flex flex-col items-center justify-center text-center gap-6">
              <span className="material-symbols-outlined text-on-surface-variant text-6xl">
                confirmation_number
              </span>
              <div>
                <p className="font-headline-lg text-white mb-2">Bạn chưa có vé nào</p>
                <p className="text-on-surface-variant">Đặt vé ngay để trải nghiệm rạp chiếu cao cấp</p>
              </div>
              <button
                onClick={() => navigate('/movies')}
                className="primary-gradient text-white px-8 py-3 rounded-full font-bold hover:scale-[1.02] active:scale-95 transition-all"
              >
                Khám phá phim
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
              {bookings.map((b, i) => (
                <TicketCard key={b.code} booking={b} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ── Booking history table ────────────────────────────────────── */}
        {bookings.length > 0 && (
          <section className="mb-20 animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                history
              </span>
              <h2 className="font-headline-xl text-headline-xl">Lịch sử đặt vé</h2>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      {['Phim', 'Ngày đặt', 'Phòng chiếu', 'Ghế', 'Mã vé', 'Trạng thái'].map(h => (
                        <th
                          key={h}
                          className="px-6 py-4 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.map(b => {
                      const { room, format } = parseCinema(b.cinema)
                      return (
                        <tr
                          key={b.code}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => navigate(`/success/${b.movieId}`)}
                        >
                          <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{b.title}</td>
                          <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{formatDate(b.date)}</td>
                          <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">
                            {room}
                            <span className="ml-2 text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase">
                              {format}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{b.seats}</td>
                          <td className="px-6 py-4 text-on-surface-variant font-mono text-sm whitespace-nowrap">{b.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-label-sm rounded-full border border-primary/20">
                              Đã đặt
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── Review section ───────────────────────────────────────────── */}
        {latestBooking && (
          <section className="animate-fade-in-up delay-300">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                rate_review
              </span>
              <h2 className="font-headline-xl text-headline-xl">Đánh giá phim đã xem</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Movie info */}
              <div className="md:col-span-1">
                <div className="glass-panel rounded-xl p-6 text-center">
                  <div className="w-32 h-48 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg border border-white/10 bg-surface-container">
                    {latestBooking.posterUrl ? (
                      <img
                        alt={latestBooking.title}
                        className="w-full h-full object-cover"
                        src={latestBooking.posterUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">movie</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-headline-lg text-white mb-1">{latestBooking.title}</h4>
                  <p className="text-on-surface-variant text-label-sm mb-6">
                    Đã xem ngày {formatDate(latestBooking.date)}
                  </p>
                  <StarRating value={rating} onChange={setRating} />
                </div>
              </div>

              {/* Review form */}
              <div className="md:col-span-2">
                <div className="glass-panel rounded-xl p-8 h-full flex flex-col">
                  <label className="font-headline-lg text-white mb-4">
                    Chia sẻ cảm nghĩ của bạn
                  </label>
                  <textarea
                    className="flex-1 min-h-[160px] bg-surface-container border border-white/10 rounded-lg p-4 text-on-surface font-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-none mb-6"
                    placeholder="Nhập nhận xét của bạn về bộ phim này..."
                    value={review}
                    onChange={e => setReview(e.target.value)}
                  />
                  <div className="flex justify-end">
                    {submitted ? (
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        Đã gửi đánh giá!
                      </div>
                    ) : (
                      <button
                        onClick={handleSubmitReview}
                        disabled={!review.trim()}
                        className="primary-gradient px-8 py-3 rounded-full font-bold text-white hover:shadow-[0_0_20px_rgba(229,9,20,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Gửi đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
