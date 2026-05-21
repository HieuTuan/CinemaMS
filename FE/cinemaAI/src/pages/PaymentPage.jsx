import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DustParticles from '../components/DustParticles'
import { getMovieById } from '../data/movies'

// ─── Payment method definitions ───────────────────────────────────────────────
const METHODS = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    desc: 'Thanh toán qua ứng dụng MoMo',
    icon: <div className="w-full h-full bg-pink-500 rounded-sm" />,
    iconBg: 'bg-pink-600/20',
  },
  {
    id: 'zalopay',
    name: 'ZaloPay',
    desc: 'Thanh toán qua ví điện tử ZaloPay',
    icon: <div className="w-full h-full bg-blue-500 rounded-sm" />,
    iconBg: 'bg-blue-600/20',
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng / Ghi nợ',
    desc: 'Visa, Mastercard, JCB',
    icon: <span className="material-symbols-outlined text-on-surface">credit_card</span>,
    iconBg: 'bg-surface-bright/50',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function PaymentOption({ method, selected, onSelect }) {
  const isCard = method.id === 'card'
  return (
    <div className="block">
      <div
        onClick={() => onSelect(method.id)}
        className={`w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
          selected
            ? `bg-surface-variant border-primary chroma-shadow-primary ${isCard ? 'rounded-b-none' : ''}`
            : 'bg-surface-container-high/50 border-white/5 hover:bg-surface-variant/80 hover:border-primary/50'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded flex items-center justify-center p-2 ${method.iconBg}`}>
            {method.icon}
          </div>
          <div>
            <p className="font-body-lg text-on-surface font-semibold">{method.name}</p>
            <p className="text-on-surface-variant text-sm">{method.desc}</p>
          </div>
        </div>

        {/* Radio dot */}
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          selected ? 'border-primary' : 'border-white/20'
        }`}>
          <div className={`w-3 h-3 rounded-full bg-primary transition-transform duration-300 ${
            selected ? 'scale-100' : 'scale-0'
          }`} />
        </div>
      </div>

      {/* Expandable credit card form */}
      {isCard && selected && (
        <div className="p-4 bg-surface-variant rounded-b-lg border border-t-0 border-primary shadow-inner">
          <div className="space-y-4">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                Số thẻ
              </label>
              <input
                className="w-full bg-surface-container text-on-surface font-body-md p-3 rounded border border-white/10 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                placeholder="0000 0000 0000 0000"
                type="text"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Ngày hết hạn
                </label>
                <input
                  className="w-full bg-surface-container text-on-surface font-body-md p-3 rounded border border-white/10 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                  placeholder="MM/YY"
                  type="text"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  CVV
                </label>
                <input
                  className="w-full bg-surface-container text-on-surface font-body-md p-3 rounded border border-white/10 focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                  placeholder="123"
                  type="password"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketRow({ icon, title, value, stagger = '' }) {
  return (
    <div className={`flex items-start gap-3 animate-slide-right ${stagger}`}>
      <span className="material-symbols-outlined text-primary mt-0.5">{icon}</span>
      <div>
        <p className="font-body-md text-on-surface font-semibold">{title}</p>
        <p className="text-on-surface-variant text-sm">{value}</p>
      </div>
    </div>
  )
}

function PriceRow({ label, value, colorClass = 'text-on-surface-variant', stagger = '' }) {
  return (
    <div className={`flex justify-between items-center animate-slide-right ${stagger}`}>
      <span className={`font-body-md ${colorClass}`}>{label}</span>
      <span className={`font-body-md ${colorClass}`}>{value}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const movie = id ? getMovieById(id) : null

  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [termsAgreed, setTermsAgreed] = useState(true)

  const movieTitle = movie?.title || 'NEON HORIZON'
  const backdropUrl = movie?.backdropUrl || movie?.posterUrl || ''

  function handleConfirm() {
    if (!termsAgreed) return
    navigate(`/success/${id ?? ''}`)
  }

  function handleFail() {
    navigate(`/failed/${id ?? ''}?reason=insufficient`)
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      <DustParticles />

      {/* ── Minimal header ───────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10 py-4 px-margin-mobile md:px-margin-desktop shadow-2xl">
        <div className="max-w-container-max mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-on-surface hover:text-primary transition-colors flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span className="hidden sm:inline font-body-md">Quay lại</span>
          </button>

          <span className="font-display-lg text-headline-xl tracking-tighter text-gradient font-extrabold">
            CINEPREMIER
          </span>

          {/* spacer to keep logo centred */}
          <div className="w-[72px]" />
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-grow pt-[100px] pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full relative z-10">

        <div className="mb-gutter text-center md:text-left">
          <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Thanh Toán</h1>
          <p className="text-on-surface-variant font-body-lg">
            Vui lòng kiểm tra lại thông tin vé và chọn phương thức thanh toán.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

          {/* ── Left: ticket card ───────────────────────────────────────── */}
          <div className="lg:col-span-5 flex flex-col gap-gutter animate-slide-right">
            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">

              {/* Movie backdrop */}
              <div className="h-48 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent z-10" />
                {backdropUrl && (
                  <img
                    alt={movieTitle}
                    className="w-full h-full object-cover opacity-80 brightness-75"
                    src={backdropUrl}
                  />
                )}
                <div className="absolute bottom-4 left-4 z-20 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-surface-variant/80 backdrop-blur-sm text-on-surface font-label-sm text-label-sm px-2 py-1 rounded">
                      C18
                    </span>
                    <span className="bg-secondary/20 text-secondary font-label-sm text-label-sm px-2 py-1 rounded border border-secondary/30">
                      IMAX 2D
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-on-surface drop-shadow-md truncate uppercase">
                    {movieTitle}
                  </h2>
                </div>
              </div>

              {/* Ticket details */}
              <div className="p-6 bg-surface-container/50">
                <div className="space-y-4">
                  <TicketRow
                    icon="location_on"
                    title="CINEPREMIER Metropolis"
                    value="Rạp 3 - Tầng 4, Vincom Metropolis, Hà Nội"
                    stagger="stagger-1"
                  />
                  <TicketRow
                    icon="calendar_month"
                    title="Thứ 6, 24 Tháng 5, 2024"
                    value="Suất chiếu: 19:30 – 22:15"
                    stagger="stagger-2"
                  />
                  <TicketRow
                    icon="chair"
                    title="Ghế ngồi"
                    value="G12, G13 (VIP)"
                    stagger="stagger-3"
                  />
                </div>

                {/* Dashed divider */}
                <div className="my-6 border-t border-dashed border-white/20" />

                {/* Price breakdown */}
                <div className="space-y-3">
                  <PriceRow label="Giá vé (×2)" value="240,000 đ" stagger="stagger-4" />
                  <PriceRow label="Bắp nước (Combo 1)" value="89,000 đ" stagger="stagger-4" />
                  <PriceRow label="Phí tiện ích" value="10,000 đ" stagger="stagger-4" />
                  <PriceRow
                    label="Khuyến mãi (VIP10)"
                    value="−24,000 đ"
                    colorClass="text-secondary"
                    stagger="stagger-4"
                  />
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center animate-slide-right stagger-5">
                  <span className="font-headline-lg text-on-surface">Tổng cộng</span>
                  <span className="font-headline-lg text-gradient text-2xl font-black">315,000 đ</span>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 justify-center text-on-surface-variant/70 animate-slide-right stagger-5">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest">
                Thanh toán an toàn &amp; bảo mật
              </span>
            </div>
          </div>

          {/* ── Right: payment methods ───────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-gutter">
            <div className="glass-panel rounded-xl p-6 md:p-8">
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-6">
                Phương thức thanh toán
              </h3>

              <div className="space-y-4">
                {METHODS.map((m) => (
                  <PaymentOption
                    key={m.id}
                    method={m}
                    selected={paymentMethod === m.id}
                    onSelect={setPaymentMethod}
                  />
                ))}
              </div>

              {/* Terms + confirm */}
              <div className="mt-8">
                <div className="flex items-start gap-3 mb-6">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary bg-surface-container border-white/20 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-on-surface-variant text-sm cursor-pointer leading-relaxed">
                    Tôi đồng ý với các{' '}
                    <span className="text-primary hover:underline cursor-pointer">Điều khoản Dịch vụ</span>
                    {' '}và{' '}
                    <span className="text-primary hover:underline cursor-pointer">Chính sách Bảo mật</span>
                    {' '}của CINEPREMIER.
                  </label>
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!termsAgreed}
                  className="w-full primary-gradient text-white font-headline-lg py-4 rounded-lg btn-high-energy flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:animation-none hover:brightness-110 transition-all"
                >
                  <span>Xác nhận Thanh toán</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>

                {/* Dev helper – simulate a failed transaction */}
                <button
                  onClick={handleFail}
                  className="w-full mt-3 glass-panel text-on-surface-variant font-body-md py-3 rounded-lg hover:bg-white/5 transition-all text-sm"
                >
                  Mô phỏng giao dịch thất bại
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
