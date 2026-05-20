import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BG_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA_5esAHYqOsNem2B03lLqoS1MJhb14m30jsihUTyfKoHRwuSbYg_Aa9GT2_Zpgt3oO5t4CWozIselGihysqXIZHtcCySZSLKxW25XH8C4xc8sFK8QrLM2Uvqf43ZUW3RBfMStiAmq-tUJEflkeajvqTCBVecIQpbsSPMIuEOpi52736kkATSswTxApzDMI0l_qT_Foa_IZ3pMHvyojCKvqRFrMWlWD9L8-IW2uDQ-yy0ffPBNSqacwL_1ZDzFJnQgAl7NeAQk3O1a1'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Cinematic Background"
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
          src={BG_URL}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full max-w-md px-margin-mobile md:px-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary-container tracking-tighter cursor-pointer"
            onClick={() => navigate('/')}
          >
            CINEPREMIER
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Trải nghiệm điện ảnh đỉnh cao
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-xl p-8 md:p-10 shadow-2xl shadow-primary/10">
          <h2 className="font-headline-xl text-headline-xl text-on-surface mb-6 text-center">
            Đăng nhập
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                className="block font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                </span>
                <input
                  className="input-glass w-full pl-10 pr-4 py-3 rounded-lg text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md"
                  id="email"
                  name="email"
                  placeholder="nhap@email.com"
                  required
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                </span>
                <input
                  className="input-glass w-full pl-10 pr-10 py-3 rounded-lg text-on-surface placeholder-on-surface-variant/50 font-body-md text-body-md"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                className="h-4 w-4 rounded border-outline-variant bg-surface-container text-primary-container focus:ring-primary focus:ring-offset-background"
                id="remember-me"
                name="remember-me"
                type="checkbox"
              />
              <label className="ml-2 block font-body-md text-body-md text-on-surface-variant" htmlFor="remember-me">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-4 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline-lg text-headline-lg transition-all duration-300 flex justify-center items-center gap-2 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <span>Đăng nhập</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="border-t border-outline-variant flex-1" />
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Hoặc</span>
            <div className="border-t border-outline-variant flex-1" />
          </div>

          {/* Social */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex justify-center items-center py-2 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-highest transition-colors font-body-md text-body-md bg-surface-container-low/50">
              <span className="material-symbols-outlined mr-2">group</span>
              Google
            </button>
            <button className="flex justify-center items-center py-2 px-4 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-highest transition-colors font-body-md text-body-md bg-surface-container-low/50">
              <span className="material-symbols-outlined mr-2">ios</span>
              Apple
            </button>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center font-body-md text-body-md text-on-surface-variant">
            Chưa có tài khoản?
            <button
              className="font-headline-lg text-[16px] leading-[24px] text-secondary hover:text-secondary-fixed-dim transition-colors ml-1 underline decoration-secondary/30 underline-offset-4"
              onClick={() => navigate('/register')}
            >
              Đăng ký
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-label-sm text-label-sm text-on-surface-variant/50">
            © 2024 CINEPREMIER. Immersive Noir Experience.
          </p>
        </div>
      </div>
    </div>
  )
}
