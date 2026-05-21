import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'
import { getMovieById } from '../data/movies'

// ─── Seat map config ──────────────────────────────────────────────────────────
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const SEATS_PER_ROW = 12
const OCCUPIED = new Set(['B04', 'B05', 'D08', 'D09', 'E01', 'H12'])
const VIP_ROWS = new Set(['F', 'G'])
const SWEETBOX_ROWS = new Set(['H'])
const SEAT_PRICES = { Standard: 120000, VIP: 160000, Sweetbox: 280000 }
const MAX_SEATS = 8

function pad(n) { return n < 10 ? `0${n}` : `${n}` }
function seatId(row, n) { return `${row}${pad(n)}` }
function getSeatType(row) {
  if (SWEETBOX_ROWS.has(row)) return 'Sweetbox'
  if (VIP_ROWS.has(row)) return 'VIP'
  return 'Standard'
}
function formatVND(n) { return n.toLocaleString('vi-VN') + 'đ' }

// ─── F&B items ────────────────────────────────────────────────────────────────
const FB_ITEMS = [
  {
    id: 'popcorn',
    name: 'Popcorn Lớn',
    desc: 'Vị truyền thống / Phô mai / Caramel',
    price: 85000,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC02NNIkfqk_O6873C4XQy-3hK_ofouo-qZ4fuZNvn3Eqd4rpJP4V4M3oyytd2RYYxlfEzl2H3Zs4SGWGO36sJ4LVtr9Hs9L5TyZ-aMvF39bBNqXqa5d7meXjLB8ukOx1_vUXKGW6FMFwVRiYdxq0WGLunx6zru4XsFs2JYAvhInF4Yb3o95qaK5oRErbvZWM14VNTqD3-Ft7F4oZAO44X_bsz3lzA-HsUtYKmhK8XVYYlRiXx2U2i_-AsnwmnnfxIUFDSAVSu8OqLC',
  },
  {
    id: 'coke',
    name: 'Coke Zero',
    desc: 'Size L (32oz) - Lạnh',
    price: 45000,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAg5DZFVscYt1Y-rVGS4ip1HOJsMu1v6FlV69WY7eWZZ-wCmhCrvIzn645DopstxdE2NM_qZyTPa5VTylHf2Cc4xGtFEP2cpyWV6KkaRnHz8IjhbxribsM8BWtWnBoAlkP3L3IZGRtPZOnACCPQwV5clCcROLK46qvotSolS7lEI7l7zX1pz0-4oiy247DydBtFl6LO-W_nnscbpnwj-8HTJX_skNVdBIY_DOz5VeMsIQoQxtRxspb9O56KC8VBbfDDgdWhtrjgZ1fW',
  },
  {
    id: 'combo',
    name: 'VIP Combo',
    desc: '1 Popcorn + 2 Drinks + 1 Snack',
    price: 199000,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMRbl7yU2iRnneZXj-u2B9dvZ8TgJWoapO1YFUgpU1GtKBiu6MrnZp4htaYr7iz1pu7XGSOpkEFrrxDB5lyLflLfRAL_HziRm1YrNYh904a0_IA6Uq14fdT26Z0tUBlR47iVdlfKxSQ8HANT0Kl0VZmr4mbLVLp_eGaEOzltj1Zo3VXT-dvRI3tsS-49tT4mWckjeueHfEuzNNen5OSBI34BSSlZxuAKMN5AMHL_11_PEgFAMJtD0iOw4i9roPQpOi',
  },
]

const PAYMENT_LOGOS = [
  {
    alt: 'Visa',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnBlnQym9RiaV56b1JlIusv89oMQWE5rbeg4kObiDFii6uB43Jp6J2CRPBgMur0eHe9Vj4TJSOjOZmBViXo-soZb3umVMMTvRjAAKSxLXqNRL-Zbku7hgDMXXOWq_xhQf4CSWZcYuNVoMsi3Yo7fP3osutv6lqhYVzWYvt6NLSwjgWwZlewfMmyj7X4UEogIl-Ek9fvVyaySWuqrboFkgfqjXHf1s67q7ZvPkag5jR4gqe8vN3PMDL_5rZJ8_R0mxnPK38zanyh6ZD',
  },
  {
    alt: 'MasterCard',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg-W-oPIdAe3RFfxP1UONpCcxKGIS2VKQeV-MypwZYmO0hv5YHOmb71MYWV1QLcfj27eaPHsMIBEDLu5lNCAscgKEubi1UqwhCNo8ccBxD3GvD_1Jupa0DYZiqAEevpl4jRmqrgnTXKvp1YjzqtSVM-J_x1_mHdVMGLzxtCevcxH12p2kAhH7Ee-xySBPaEg14uXlXimhryjNoTUXVojF0a-zPR-XvF7uVoXrJWN-rmO_ZB6eobayhbWEeCFeEtijFWsLmlAZpmkfN',
  },
  {
    alt: 'MoMo',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-1OiYsC6YfjsEvXJ38KrnGzRbkyO6DzS8v8w7RTrGAQu1Vsub694NPOuz9c1L-1ZdWwvZ_TaM6Os35hdHCD9xi5q2veTnpHtE7W5pP6um9SGS1_MTCEQpAIM7WRs3bOPvzq5z5UUQldecuFUNJmckCcWiguTL08eFjKgXHDh7pxLl7V3HJCrQpvOXuQlHWaE9TaAdwe37e0q6TN3U4Eb2ShnP-Gxx9_wL4IDLrsQG9fF3NNH746Ulj7Ic90BzOPfNbPrnJR95U3Gt',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepBubble({ n, label, active, done }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
          active
            ? 'bg-primary text-on-primary'
            : done
            ? 'bg-primary-container text-white'
            : 'bg-surface-container-high border border-outline/30 text-on-surface-variant'
        }`}
      >
        {done ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : n}
      </div>
      <span className={`font-label-sm text-label-sm uppercase ${active ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}>
        {label}
      </span>
    </div>
  )
}

function StepConnector() {
  return <div className="w-16 h-[2px] bg-outline-variant/30 mb-6" />
}

function SeatButton({ id, selected, onToggle }) {
  const row = id[0]
  const occupied = OCCUPIED.has(id)
  const type = getSeatType(row)

  let cls =
    'w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border transition-all duration-200 '

  if (occupied) {
    cls += 'bg-surface-container-high border-outline/10 text-on-surface/20 cursor-not-allowed opacity-50'
  } else if (selected) {
    cls += 'seat-selected border-transparent text-on-primary'
  } else if (type === 'Sweetbox') {
    cls += 'bg-secondary-container/20 border-secondary/30 text-secondary hover:scale-110 active:scale-90 cursor-pointer'
  } else if (type === 'VIP') {
    cls += 'bg-tertiary-container/20 border-tertiary/30 text-tertiary hover:scale-110 active:scale-90 cursor-pointer'
  } else {
    cls +=
      'bg-surface-variant/40 border-white/10 text-on-surface-variant hover:scale-110 active:scale-90 cursor-pointer'
  }

  return (
    <button
      className={cls}
      onClick={() => !occupied && onToggle(id)}
      disabled={occupied}
      title={`${id} · ${type}`}
    >
      <span className="material-symbols-outlined text-sm">chair</span>
    </button>
  )
}

function FBCard({ item, quantity, onChange }) {
  return (
    <div className="min-w-[280px] glass-card rounded-2xl overflow-hidden group flex-shrink-0">
      <div className="relative h-40 overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={item.imageUrl}
          alt={item.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131314] to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="font-headline-lg text-headline-lg mb-1">{item.name}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{item.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-primary font-bold">{formatVND(item.price)}</span>
          <div className="flex items-center gap-4 bg-surface-container-high px-3 py-1 rounded-full border border-white/5">
            <button
              className="text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => onChange(item.id, -1)}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="font-bold w-4 text-center">{quantity}</span>
            <button
              className="text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => onChange(item.id, 1)}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movie = id ? getMovieById(id) : null

  const [selectedSeats, setSelectedSeats] = useState([])
  const [fbQty, setFbQty] = useState({ popcorn: 0, coke: 0, combo: 0 })
  const [voucher, setVoucher] = useState('')

  function toggleSeat(sid) {
    setSelectedSeats((prev) => {
      if (prev.includes(sid)) return prev.filter((s) => s !== sid)
      if (prev.length >= MAX_SEATS) return prev
      return [...prev, sid]
    })
  }

  function changeFbQty(itemId, delta) {
    setFbQty((prev) => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) + delta) }))
  }

  const ticketTotal = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + SEAT_PRICES[getSeatType(s[0])], 0),
    [selectedSeats]
  )

  const fbTotal = useMemo(
    () => FB_ITEMS.reduce((sum, item) => sum + item.price * (fbQty[item.id] || 0), 0),
    [fbQty]
  )

  const total = ticketTotal + fbTotal
  const seatProgress = (selectedSeats.length / MAX_SEATS) * 100

  const movieTitle = movie?.title || 'Neon Horizon'
  const moviePoster = movie?.posterUrl || ''

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md overflow-x-hidden">
      <DustParticles />
      <Navbar />

      <main className="flex-grow pt-24 pb-32 px-gutter max-w-container-max mx-auto relative z-10">

        {/* ── Progress steps ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center mb-16 gap-4">
          <StepBubble n={1} label="Chỗ ngồi" active />
          <StepConnector />
          <StepBubble n={2} label="Bắp nước" />
          <StepConnector />
          <StepBubble n={3} label="Thanh toán" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-16">

            {/* Seat selection */}
            <section>
              {/* Screen */}
              <div className="text-center mb-16">
                <div className="inline-block px-12 py-1 bg-gradient-to-b from-primary/20 to-transparent border-t border-primary/40 rounded-t-xl mb-4">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em]">
                    Màn Hình
                  </span>
                </div>
                <div className="h-1 w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-primary to-transparent rounded-full screen-glow" />
              </div>

              {/* Cinema room */}
              <div className="cinema-room flex justify-center overflow-x-auto pb-4">
                <div className="seat-grid">
                  <div className="flex flex-col gap-3">
                    {ROWS.map((row) => (
                      <div key={row} className="flex items-center gap-3">
                        <span className="w-6 text-on-surface-variant font-bold text-xs opacity-50 shrink-0">
                          {row}
                        </span>
                        <div className="flex gap-1.5 md:gap-2">
                          {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                            const sid = seatId(row, i + 1)
                            return (
                              <SeatButton
                                key={sid}
                                id={sid}
                                selected={selectedSeats.includes(sid)}
                                onToggle={toggleSeat}
                              />
                            )
                          })}
                        </div>
                        <span className="w-6 text-on-surface-variant font-bold text-xs opacity-50 text-right shrink-0">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-16 flex flex-wrap justify-center gap-6 md:gap-8">
                {[
                  { color: 'bg-surface-variant/40 border border-white/10', label: 'Thường' },
                  { color: 'bg-tertiary-container/20 border border-tertiary/30', label: 'VIP' },
                  { color: 'bg-secondary-container/20 border border-secondary/30', label: 'Sweetbox' },
                  { color: 'seat-selected', label: 'Đang chọn' },
                  { color: 'bg-surface-container-high border border-outline/10 opacity-50', label: 'Đã đặt' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded ${color}`} />
                    <span className="text-on-surface-variant text-sm">{label}</span>
                  </div>
                ))}
              </div>

              {/* Max seats hint */}
              {selectedSeats.length >= MAX_SEATS && (
                <p className="text-center text-primary text-sm mt-6 animate-fade-in-up">
                  Tối đa {MAX_SEATS} ghế mỗi lần đặt.
                </p>
              )}
            </section>

            {/* F&B section */}
            <section>
              <h2 className="font-headline-lg text-headline-lg mb-8">Bắp Nước &amp; Đồ Ăn</h2>
              <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar">
                {FB_ITEMS.map((item) => (
                  <FBCard
                    key={item.id}
                    item={item}
                    quantity={fbQty[item.id] || 0}
                    onChange={changeFbQty}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* ── Right column: sticky order summary ───────────────────────── */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="glass-panel rounded-3xl p-8 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

              {/* Movie info */}
              <div className="flex gap-4">
                <div className="w-24 h-36 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-surface-container">
                  {moviePoster && (
                    <img className="w-full h-full object-cover" src={moviePoster} alt={movieTitle} />
                  )}
                </div>
                <div className="space-y-2">
                  <span className="font-label-sm text-label-sm text-primary uppercase">Đang đặt vé</span>
                  <h1 className="font-headline-lg leading-tight uppercase">{movieTitle}</h1>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>Bitexco, TP.HCM</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>Hôm nay, 20:45</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant/20 pt-8 space-y-6">

                {/* Selected seats + progress bar */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-on-surface-variant text-sm">
                      Ghế đã chọn ({selectedSeats.length}/{MAX_SEATS}):
                    </span>
                    <span className="text-primary font-bold text-sm text-right max-w-[160px] truncate">
                      {selectedSeats.length > 0
                        ? [...selectedSeats].sort().join(', ')
                        : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${seatProgress}%` }}
                    />
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Vé (×{selectedSeats.length})</span>
                    <span>{formatVND(ticketTotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Bắp &amp; Nước</span>
                    <span>{formatVND(fbTotal)}</span>
                  </div>
                  <div className="flex justify-between text-tertiary">
                    <span>Giảm giá</span>
                    <span>−0đ</span>
                  </div>
                </div>

                {/* Voucher */}
                <div className="relative">
                  <input
                    className="w-full bg-surface-container-low border border-outline/20 rounded-xl py-3 px-4 text-sm text-on-surface placeholder-on-surface-variant/50 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
                    placeholder="Nhập mã ưu đãi..."
                    type="text"
                    value={voucher}
                    onChange={(e) => setVoucher(e.target.value)}
                  />
                  <button className="absolute right-2 top-2 px-4 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-colors font-bold text-xs">
                    ÁP DỤNG
                  </button>
                </div>

                {/* Total */}
                <div className="pt-6 border-t border-outline-variant/20">
                  <div className="flex justify-between items-baseline">
                    <span className="font-headline-lg text-headline-lg">Tổng cộng</span>
                    <span className="text-3xl font-black text-primary tracking-tight">
                      {formatVND(total)}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-xs mt-2 italic text-right">
                    *Đã bao gồm 5% VAT
                  </p>
                </div>

                {/* Confirm button */}
                <button
                  onClick={() => selectedSeats.length > 0 && navigate(`/payment/${id ?? ''}`)}
                  className="w-full primary-gradient text-white py-5 rounded-2xl font-black text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(229,9,20,0.3)] flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={selectedSeats.length === 0}
                >
                  Xác nhận &amp; Thanh toán
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                {/* Payment logos */}
                <div className="flex items-center justify-center gap-4 opacity-50">
                  {PAYMENT_LOGOS.map((logo) => (
                    <img
                      key={logo.alt}
                      alt={logo.alt}
                      className="h-6 grayscale hover:grayscale-0 transition-all"
                      src={logo.src}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
