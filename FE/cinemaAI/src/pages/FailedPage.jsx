import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DustParticles from '../components/DustParticles'

// Static mock — in a real app these come from router state or API
const FAILED_REASONS = {
  insufficient: 'Số dư không đủ',
  declined:     'Thẻ bị từ chối',
  timeout:      'Hết thời gian xử lý',
  default:      'Lỗi hệ thống',
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function nowFormatted() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

// Transaction code stable for this page load
const TXN_CODE = 'CP-' + Math.floor(Math.random() * 9000000 + 1000000)
const FAILED_AT  = nowFormatted()

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FailedPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Derive a reason key from URL search params (?reason=insufficient) if present
  const reason = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return FAILED_REASONS[params.get('reason')] ?? FAILED_REASONS.default
  }, [])

  return (
    <div className="bg-[#0e0e0f] text-on-surface font-body-md min-h-screen flex flex-col">
      <DustParticles />
      <Navbar />

      <main className="relative z-10 pt-32 pb-20 px-4 flex-grow flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full flex flex-col items-center">

          {/* ── Error icon ────────────────────────────────────────────── */}
          <div className="relative mb-8 animate-fade-in-up">
            {/* soft glow blob behind icon */}
            <div className="absolute inset-0 bg-primary-container/20 blur-[60px] rounded-full scale-150 opacity-50" />
            <div className="relative glass-panel w-24 h-24 rounded-full flex items-center justify-center animate-pulse-error border border-primary-container/30">
              <span
                className="material-symbols-outlined text-[48px]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  color: '#e50914',
                }}
              >
                error
              </span>
            </div>
          </div>

          {/* ── Heading ───────────────────────────────────────────────── */}
          <div className="text-center mb-10 animate-fade-in-up delay-100">
            <h1 className="font-headline-xl text-headline-xl md:text-[48px] md:leading-[56px] text-white mb-4 tracking-tight">
              Giao dịch không thành công
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-lg leading-relaxed">
              Đã có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng kiểm tra
              lại thông tin thẻ hoặc số dư tài khoản của bạn.
            </p>
          </div>

          {/* ── Error detail card ──────────────────────────────────────── */}
          <div className="glass-panel w-full rounded-xl p-6 md:p-8 mb-12 chroma-shadow-error animate-fade-in-up delay-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest opacity-60">
                  Lý do
                </span>
                <span className="font-headline-lg text-headline-lg text-[#e50914]">
                  {reason}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest opacity-60">
                  Mã giao dịch
                </span>
                <span className="font-headline-lg text-headline-lg text-white">
                  {TXN_CODE}
                </span>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2 border-t border-white/5 pt-4">
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest opacity-60">
                  Thời gian
                </span>
                <span className="font-body-lg text-white">{FAILED_AT}</span>
              </div>
            </div>
          </div>

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-4 w-full animate-fade-in-up delay-300">
            <button
              onClick={() => navigate(`/payment/${id ?? ''}`)}
              className="flex-1 primary-gradient py-4 rounded-lg font-bold text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:shadow-[0_0_30px_rgba(229,9,20,0.6)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                refresh
              </span>
              Thử lại
            </button>

            <button
              onClick={() => navigate(`/payment/${id ?? ''}`)}
              className="flex-1 glass-panel py-4 rounded-lg font-bold text-white hover:bg-white/10 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">swap_horiz</span>
              Đổi phương thức
            </button>
          </div>

          {/* ── Back link ──────────────────────────────────────────────── */}
          <button
            onClick={() => navigate('/')}
            className="mt-10 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 group animate-fade-in-up delay-400"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            Quay lại trang chủ
          </button>
        </div>
      </main>

      {/* Ambient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-container/10 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[10%] w-[30%] h-[30%] bg-secondary-container/10 blur-[100px] rounded-full" />
      </div>

      <Footer />
    </div>
  )
}
