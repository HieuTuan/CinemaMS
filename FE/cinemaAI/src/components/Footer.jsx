export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full py-16 border-t border-white/5 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">

        {/* Brand */}
        <div className="col-span-1">
          <a
            className="font-display-lg text-headline-lg text-primary-container font-extrabold mb-6 block"
            href="/"
          >
            CINEPREMIER
          </a>
          <p className="text-on-surface-variant font-body-md text-body-md mb-8">
            Nâng tầm trải nghiệm điện ảnh với công nghệ AI và dịch vụ VIP đẳng cấp quốc tế.
          </p>
          <div className="flex gap-4">
            {[
              { icon: 'public', label: 'Website' },
              { icon: 'smart_display', label: 'YouTube' },
              { icon: 'chat_bubble', label: 'Chat' },
            ].map(({ icon, label }) => (
              <a
                key={icon}
                aria-label={label}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-all duration-300 cursor-pointer"
                href="#"
              >
                <span className="material-symbols-outlined text-sm">{icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="col-span-1">
          <h5 className="font-headline-lg text-white mb-6">Liên Kết</h5>
          <ul className="space-y-4 text-on-surface-variant font-body-md">
            {['Về Chúng Tôi', 'Lịch Chiếu', 'Tin Điện Ảnh', 'Ưu Đãi'].map((link) => (
              <li key={link}>
                <a className="hover:text-primary transition-colors duration-300" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy */}
        <div className="col-span-1">
          <h5 className="font-headline-lg text-white mb-6">Chính Sách</h5>
          <ul className="space-y-4 text-on-surface-variant font-body-md">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact Us'].map((link) => (
              <li key={link}>
                <a className="hover:text-primary transition-colors duration-300" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-1">
          <h5 className="font-headline-lg text-white mb-6">Newsletter</h5>
          <p className="text-on-surface-variant font-body-md text-body-md mb-4">
            Đăng ký nhận tin để không bỏ lỡ các suất chiếu sớm VIP.
          </p>
          <div className="flex">
            <input
              className="bg-surface border-none rounded-l-xl px-4 py-2 w-full text-on-surface placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary-container outline-none text-sm"
              placeholder="Email của bạn"
              type="email"
            />
            <button className="bg-primary-container px-4 py-2 rounded-r-xl text-white hover:bg-primary-container/80 transition-colors duration-300">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 pt-8 border-t border-white/5 text-center text-on-surface-variant font-label-sm text-label-sm px-margin-mobile md:px-margin-desktop">
        © 2024 CINEPREMIER STUDIOS. ALL RIGHTS RESERVED.
      </div>
    </footer>
  )
}
